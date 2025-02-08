import React, { useState } from "react"
import AdDisplay from "./components/AdDisplay"
import WebSocketClient from "./components/WebSocketClient"
import WebcamFeed from "./components/WebcamFeed" // Import the WebcamFeed component

const App = () => {
  const [faceData, setFaceData] = useState(null)

  return (
    <div style={{ position: "relative", height: "100vh", backgroundColor: "#f8f9fa" }}>
      <h1 style={{ textAlign: "center" }}>AI-Powered Ad Display</h1>
      <WebSocketClient setFaceData={setFaceData} />
      <AdDisplay faceData={faceData} />
      <WebcamFeed /> {/* Webcam feed in the top-right corner */}
    </div>
  )
}

export default App
