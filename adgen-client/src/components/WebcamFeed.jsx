import React, { useEffect, useRef, useState } from "react";

const WebcamFeed = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null); // State to store captured image
  const [screenshotMessage, setScreenshotMessage] = useState(""); // State for screenshot message

  useEffect(() => {
    // Start the webcam feed
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream; // Assign stream to video element
        }
      })
      .catch((err) => console.error("❌ Error accessing webcam:", err));
  }, []);

  const takeScreenshot = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!video || !canvas) {
      console.error("❌ Canvas or Video element not found");
      return;
    }

    // Capture the video frame onto the canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas image to Base64 and store it in state
    const screenshotData = canvas.toDataURL("image/png");
    setCapturedImage(screenshotData);

    // Display "Screenshot Taken" message
    setScreenshotMessage("Screenshot Taken!");

    // Clear the message after 3 seconds
    setTimeout(() => setScreenshotMessage(""), 3000);

    // Send Screenshot to Backend for Saving
    fetch("http://localhost:5000/api/save-screenshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: screenshotData, fileName: "reactionImage.png" }),
    })
      .then((res) => res.json())
      .then((data) => console.log("📸 Screenshot saved on server:", data))
      .catch((err) => console.error("❌ Error saving screenshot:", err));
  };

  return (
    <div style={containerStyle}>
      <div style={webcamContainerStyle}>
        <video ref={videoRef} autoPlay playsInline style={videoStyle} />
        <button onClick={takeScreenshot} style={buttonStyle}>
          Take Screenshot
        </button>
        {capturedImage && (
          <div style={screenshotContainerStyle}>
            <img src={capturedImage} alt="Captured" style={screenshotStyle} />
            <p style={messageStyle}>{screenshotMessage}</p> {/* Screenshot Message */}
          </div>
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} /> {/* Hidden canvas */}
    </div>
  );
};

/* 🔹 Styling */
const containerStyle = {
  position: "fixed",
  top: "10px",
  right: "10px",
  textAlign: "center",
};

const webcamContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const videoStyle = {
  width: "200px",
  height: "150px",
  borderRadius: "8px",
  border: "2px solid #fff",
};

const buttonStyle = {
  marginTop: "10px",
  padding: "8px 16px",
  fontSize: "14px",
  backgroundColor: "#007BFF",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const screenshotContainerStyle = {
  marginTop: "10px", // Space between webcam and screenshot
};

const screenshotStyle = {
  width: "200px", // Same width as webcam feed for consistency
  height: "150px", // Same height as webcam feed for consistency
  borderRadius: "8px",
  border: "2px solid #fff",
};

const messageStyle = {
  marginTop: "5px", // Space between image and message
  fontSize: "14px",
  color: "#28a745", // Green color for success message
};

/* 🔹 Export Component */
export default WebcamFeed;
