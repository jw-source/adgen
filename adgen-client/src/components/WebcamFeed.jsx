import React, { useEffect, useRef } from "react"

const WebcamFeed = () => {
  const videoRef = useRef(null)

  useEffect(() => {
    // Request access to the user's webcam
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream // Set the video stream
        }
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err)
      })
  }, [])

  return (
    <div style={{ position: "absolute", top: "10px", right: "10px" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: "200px",
          height: "150px",
          borderRadius: "8px",
          border: "2px solid #000",
        }}
      />
    </div>
  )
}

export default WebcamFeed
