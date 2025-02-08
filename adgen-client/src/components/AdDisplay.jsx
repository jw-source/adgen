import React, { useEffect, useRef } from "react"

const AdDisplay = ({ faceData }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    const img = new Image()
    img.src = "/lebron.png" // Correct path for the image in the public folder

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      if (faceData) {
        ctx.font = "24px Arial"
        ctx.fillStyle = "red"
        ctx.fillText(`Age: ${faceData.age}`, 20, 40)
        ctx.fillText(`Gender: ${faceData.gender}`, 20, 70)
        ctx.fillText(`Emotion: ${faceData.emotion}`, 20, 100)
        ctx.fillText(`Race: ${faceData.race}`, 20, 130)
      }
    }

    img.onerror = () => {
      console.error("Failed to load the image")
    }
  }, [faceData])

  return <canvas ref={canvasRef} width={800} height={600} style={{ border: "1px solid black" }} />
}

export default AdDisplay
