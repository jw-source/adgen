import React, { useEffect, useState } from "react";
import WebSocketClient from "./WebSocketClient";

const AdDisplay = () => {
  const [originalAd, setOriginalAd] = useState(null);
  const [generatedAd, setGeneratedAd] = useState(null);

  const fetchGeneratedAd = () => {
    fetch("http://localhost:5000/api/get-generated-ad")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch generated ad");
        }
        return response.blob();
      })
      .then((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setGeneratedAd(imageUrl);
      })
      .catch((error) => console.error("Error fetching generated ad:", error));
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/get-ad-image")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch ad image");
        }
        return response.blob();
      })
      .then((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setOriginalAd(imageUrl);
      })
      .catch((error) => console.error("Error fetching ad image:", error));
  }, []);

  return (
    <div style={containerStyle}>
      <WebSocketClient fetchGeneratedAd={fetchGeneratedAd} />
      <div style={adContainerStyle}>
        <div style={adWrapperStyle}>
          <h3 style={titleStyle}>Original Ad</h3>
          {originalAd ? (
            <img src={originalAd} alt="Original Ad" style={imageStyle} />
          ) : (
            <p>Loading original ad...</p>
          )}
        </div>
        <div style={adWrapperStyle}>
          <h3 style={titleStyle}>Generated Ad</h3>
          {generatedAd ? (
            <img src={generatedAd} alt="Generated Ad" style={imageStyle} />
          ) : (
            <p>Loading generated ad...</p>
          )}
        </div>
      </div>
    </div>
  );
};

const containerStyle = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  padding: "20px",
};

const adContainerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "20px",
  flex: 1,
};

const adWrapperStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const titleStyle = {
  marginBottom: "10px",
  color: "#333",
};

const imageStyle = {
  maxWidth: "600px",
  maxHeight: "600px",
  width: "100%",
  objectFit: "contain",
};

export default AdDisplay;
