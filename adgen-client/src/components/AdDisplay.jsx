import React, { useEffect, useState } from "react";
import WebSocketClient from "./WebSocketClient";

const AdDisplay = () => {
  const [adImage, setAdImage] = useState(null); // State to store ad image URL

  const fetchGeneratedAd = () => {
    fetch("http://localhost:5000/api/get-generated-ad")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch generated ad");
        }
        return response.blob(); // Convert response to a Blob
      })
      .then((blob) => {
        // Create a URL for the Blob and set it as the ad image
        const imageUrl = URL.createObjectURL(blob);
        setAdImage(imageUrl);
      })
      .catch((error) => console.error("Error fetching generated ad:", error));
  };

  useEffect(() => {
    // Fetch the currently selected ad image from the backend
    fetch("http://localhost:5000/api/get-ad-image")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch ad image");
        }
        return response.blob(); // Convert response to a Blob
      })
      .then((blob) => {
        // Create a URL for the Blob and set it as the ad image
        const imageUrl = URL.createObjectURL(blob);
        setAdImage(imageUrl);
      })
      .catch((error) => console.error("Error fetching ad image:", error));
  }, []);

  return (
    <div style={containerStyle}>
      <WebSocketClient fetchGeneratedAd={fetchGeneratedAd} />
      {adImage ? (
        <img src={adImage} alt="Ad" style={imageStyle} />
      ) : (
        <p>Loading ad...</p>
      )}
    </div>
  );
};

/* 🔹 Styling */
const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
};

const imageStyle = {
  maxWidth: "100%",
  maxHeight: "100%",
};

export default AdDisplay;
