import React, { useEffect, useRef } from "react";

const WebSocketClient = ({ setFaceData, fetchGeneratedAd }) => {
  const ws = useRef(null);

  useEffect(() => {
    const connectWebSocket = () => {
      if (!ws.current || ws.current.readyState === WebSocket.CLOSED) {
        ws.current = new WebSocket("ws://localhost:8765");

        ws.current.onopen = () => console.log("✅ Connected to WebSocket server");

        ws.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("Received WebSocket message:", data);
            if (data.type === "ad_generated") {
              console.log("Ad generation complete, fetching new ad...");
              fetchGeneratedAd();
            } else if (data.type === "face_data") {
              setFaceData(data);
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        ws.current.onerror = (err) => {
          console.error("❌ WebSocket error:", err);
        };

        ws.current.onclose = () => {
          console.warn("⚠️ WebSocket disconnected, attempting to reconnect...");
          setTimeout(connectWebSocket, 3000);
        };
      }
    };

    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [setFaceData, fetchGeneratedAd]);

  return null;
};

export default WebSocketClient;