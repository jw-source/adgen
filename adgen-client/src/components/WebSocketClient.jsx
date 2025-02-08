import React, { useEffect } from "react"

const WebSocketClient = ({ setFaceData }) => {
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8765") // WebSocket server URL

    ws.onopen = () => console.log("Connected to WebSocket server")

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log("Received data:", data)
      setFaceData(data) // Update state
    }

    ws.onclose = () => console.log("Disconnected from WebSocket server")
    ws.onerror = (err) => console.error("WebSocket error:", err)

    return () => ws.close() // Cleanup on component unmount
  }, [setFaceData])

  return null // This component doesn't render anything
}

export default WebSocketClient
