import React, { useState } from "react"
import AdDisplay from "./components/AdDisplay"
import WebSocketClient from "./components/WebSocketClient"
import WebcamFeed from "./components/WebcamFeed" // Import the WebcamFeed component

const App = () => {
  const [faceData, setFaceData] = useState(null)

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <h1>AI-Powered Ad Display</h1>
      <WebSocketClient setFaceData={setFaceData} />
      <AdDisplay faceData={faceData} />
      <WebcamFeed /> {/* Add the webcam feed */}
    </div>
  )
}

export default App
