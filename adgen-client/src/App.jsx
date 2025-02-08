import React, { useState, useEffect } from "react";
import WebSocketClient from "./components/WebSocketClient";
import WebcamFeed from "./components/WebcamFeed";

const App = () => {
  const [faceData, setFaceData] = useState(null); // State for face data
  const [generatedAd, setGeneratedAd] = useState(null); // State for generated ad
  const [originalAd, setOriginalAd] = useState(null); // State for original ad
  const [loading, setLoading] = useState(false); // Loading state for fetching ads
  const [showModal, setShowModal] = useState(false); // State for controlling modal visibility

  useEffect(() => {
    // Fetch original ad on component mount
    fetch("http://localhost:5000/api/get-ad-image")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.blob();
      })
      .then((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setOriginalAd(imageUrl);
      })
      .catch((error) => {
        console.error("Error fetching original ad:", error);
        setOriginalAd(null);
      });
  }, []);

  const fetchGeneratedAd = () => {
    setLoading(true);
    console.log("Fetching generated ad...");
    fetch("http://localhost:5000/api/get-generated-ad")
      .then((response) => {
        if (!response.ok) {
          console.error("Server response not OK:", response.status);
          throw new Error(`Failed to fetch generated ad: ${response.status}`);
        }
        console.log("Received response, converting to blob...");
        return response.blob();
      })
      .then((blob) => {
        console.log("Creating object URL from blob...");
        const imageUrl = URL.createObjectURL(blob);
        const cachedUrl = `${imageUrl}?t=${new Date().getTime()}`;
        console.log("Setting generated ad URL:", cachedUrl);
        setGeneratedAd(cachedUrl);
        setShowModal(true); // Show modal when image is loaded
      })
      .catch((error) => {
        console.error("Error in fetchGeneratedAd:", error);
        setGeneratedAd(null); // Reset the state on error
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Modal component
  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
      <div style={modalOverlayStyle} onClick={onClose}>
        <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
          <button style={closeButtonStyle} onClick={onClose}>
            ×
          </button>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>AdGen</h1>
      <div style={adContainerStyle}>
        <div style={adItemStyle}>
          <h2 style={subtitleStyle}>Original Ad</h2>
          {originalAd ? (
            <img src={originalAd} alt="Original Ad" style={imageStyle} />
          ) : (
            <div style={placeholderStyle}>Loading original ad...</div>
          )}
        </div>
        <div style={adItemStyle}>
          <h2 style={subtitleStyle}>Generated Ad</h2>
          {generatedAd ? (
            <img src={generatedAd} alt="Generated Ad" style={imageStyle} />
          ) : (
            <div style={placeholderStyle}>
              {loading ? 'Generating ad...' : 'Click "Generate New Ad" to create a personalized advertisement'}
            </div>
          )}
        </div>
      </div>
      <button onClick={fetchGeneratedAd} style={buttonStyle}>
        Generate New Ad
      </button>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        {loading ? (
          <div style={{ color: '#333', fontSize: '18px' }}>Loading generated ad...</div>
        ) : generatedAd ? (
          <img 
            src={generatedAd} 
            alt="Generated Ad" 
            style={modalImageStyle} 
            onError={(e) => {
              console.error('Error loading image:', e);
              setGeneratedAd(null);
            }}
          />
        ) : (
          <div style={{ color: '#333', fontSize: '18px' }}>Failed to load generated ad</div>
        )}
      </Modal>
      <WebSocketClient setFaceData={setFaceData} fetchGeneratedAd={fetchGeneratedAd} />
      <WebcamFeed />
    </div>
  );
};

/* Styling */
const containerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
};

const titleStyle = {
  fontSize: "36px",
  marginBottom: "20px",
  color: "#333",
};

const adContainerStyle = {
  display: "flex",
  gap: "40px",
  justifyContent: "center",
  flexWrap: "wrap",
};

const adItemStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderRadius: "10px",
  backgroundColor: "#f5f5f5",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

const subtitleStyle = {
  fontSize: "24px",
  marginBottom: "15px",
  color: "#444",
};

const imageStyle = {
  maxWidth: "400px",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

const buttonStyle = {
  marginTop: "20px",
  padding: "10px 20px",
  fontSize: "16px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  transition: "background-color 0.2s",
  ':hover': {
    backgroundColor: "#0056b3",
  },
};

const placeholderStyle = {
  width: "400px",
  height: "300px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#e9ecef",
  borderRadius: "8px",
  color: "#6c757d",
  fontSize: "18px",
};

// Modal styles
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  position: "relative",
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "10px",
  maxWidth: "90vw",
  maxHeight: "90vh",
  overflow: "visible",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1001
};

const modalImageStyle = {
  maxWidth: "100%",
  maxHeight: "80vh",
  objectFit: "contain",
  display: "block",
  margin: "0 auto"
};

const closeButtonStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  background: "none",
  border: "none",
  fontSize: "24px",
  cursor: "pointer",
  color: "#666",
  padding: "5px 10px",
};

export default App;
