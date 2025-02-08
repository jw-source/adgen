import os
import base64
import asyncio
import subprocess
import websockets
import json
from flask import Flask, request, jsonify, send_from_directory
from threading import Thread
from flask_cors import CORS

# Initialize Flask App
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Define folder paths
IMG_FOLDER = os.path.join(os.getcwd(), "imgs")
IMAGES_FOLDER = os.path.join(os.getcwd(), "images")
CURRENT_AD_FILE = os.path.join(IMG_FOLDER, "current_ad.txt")  # File to store current ad filename

# Ensure folders and files exist
if not os.path.exists(IMG_FOLDER):
    os.makedirs(IMG_FOLDER)

if not os.path.exists(IMAGES_FOLDER):
    os.makedirs(IMAGES_FOLDER)

if not os.path.exists(CURRENT_AD_FILE):
    with open(CURRENT_AD_FILE, "w") as f:
        f.write("ad.png")  # Default ad image


@app.route("/api/upload-ad-image", methods=["POST"])
def upload_ad_image():
    """Handle image uploads."""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        if file and (file.filename.endswith(".png") or file.filename.endswith(".jpg")):
            # Save the uploaded file
            filename = file.filename
            file_path = os.path.join(IMG_FOLDER, filename)
            file.save(file_path)

            # Update current ad file
            with open(CURRENT_AD_FILE, "w") as f:
                f.write(filename)

            return jsonify({"message": f"File {filename} uploaded successfully", "filename": filename}), 200

        return jsonify({"error": "Invalid file type"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/get-ad-image", methods=["GET"])
def get_ad_image():
    """Serve the currently selected ad image."""
    try:
        with open(CURRENT_AD_FILE, "r") as f:
            current_ad = f.read().strip()
        return send_from_directory(IMG_FOLDER, current_ad)
    except Exception as e:
        return {"error": str(e)}, 500


@app.route("/api/save-screenshot", methods=["POST"])
def save_screenshot():
    """Save a screenshot sent from the frontend and trigger ad generation."""
    try:
        data = request.json
        image_data = data["image"]
        file_name = "screenshot.png"  # Save as screenshot.png

        # Full file path in the images folder
        file_path = os.path.join(IMAGES_FOLDER, file_name)

        # Decode and save the image
        with open(file_path, "wb") as f:
            f.write(base64.b64decode(image_data.split(",")[1]))

        # Trigger Python script to generate modified ad
        subprocess.run(["python", "ads.py"], check=True)

        # Notify all connected clients that the ad has been generated
        asyncio.run(notify_clients({"type": "ad_generated"}))

        return jsonify({"message": "Screenshot saved and ad generation triggered", "filePath": file_path})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/get-generated-ad", methods=["GET"])
def get_generated_ad():
    """Serve the generated ad image."""
    try:
        generated_ad_path = os.path.join("imgs", "generated_ad.png")
        if not os.path.exists(generated_ad_path):
            return jsonify({"error": "Generated ad not found"}), 404
        return send_from_directory("imgs", "generated_ad.png")
    except Exception as e:
        return jsonify({"error": str(e)}), 500


connected_clients = set()


async def notify_clients(message):
    """Send a message to all connected WebSocket clients."""
    if connected_clients:  # Only attempt to send if there are connected clients
        message_str = json.dumps(message)
        await asyncio.gather(
            *[client.send(message_str) for client in connected_clients]
        )


async def handle_client(websocket):
    """Handle communication with a connected WebSocket client."""
    print("✅ WebSocket client connected")
    connected_clients.add(websocket)

    try:
        async for message in websocket:
            print(f"📩 Received WebSocket message: {message}")
            # Echo the message back to the client or process it as needed
            await websocket.send(f"Echo: {message}")
    except websockets.exceptions.ConnectionClosedError as e:
        print(f"❌ WebSocket connection closed: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    finally:
        connected_clients.remove(websocket)
        print("⚠️ WebSocket client disconnected")


async def start_websocket_server():
    """Start the WebSocket server."""
    print("✅ Starting WebSocket server on ws://localhost:8765")
    async with websockets.serve(handle_client, "localhost", 8765):
        await asyncio.Future()  # Keep the server running


def start_flask_app():
    """Start the Flask app in a separate thread."""
    app.run(port=5000, debug=False)


async def main():
    """Run both Flask and WebSocket servers."""
    flask_thread = Thread(target=start_flask_app)
    flask_thread.start()

    await start_websocket_server()


if __name__ == "__main__":
    asyncio.run(main())
