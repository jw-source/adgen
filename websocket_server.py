import asyncio
import websockets
import json
from deepface import DeepFace

async def handle_client(websocket, path):
    print("Client connected...")
    try:
        async for message in websocket:
            data = json.loads(message)
            img_path = data.get('img_path', 'imgs/lebron.png')  # Fallback image

            # Analyze the face
            try:
                analysis = DeepFace.analyze(img_path=img_path)[0]
                response = {
                    "age": analysis['age'],
                    "gender": analysis['dominant_gender'],
                    "emotion": analysis['dominant_emotion'],
                    "race": analysis['dominant_race'],
                }
            except Exception as e:
                response = {"error": str(e)}

            # Send back the analysis
            await websocket.send(json.dumps(response))
    except websockets.exceptions.ConnectionClosed as e:
        print("Client disconnected...", e)

async def main():
    start_server = await websockets.serve(handle_client, "localhost", 8765)
    print("WebSocket server started on ws://localhost:8765")
    await start_server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())
