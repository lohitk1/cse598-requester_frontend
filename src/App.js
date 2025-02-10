import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [tokens, setTokens] = useState([]);
    const [labeledCount, setLabeledCount] = useState(0);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        const response = await axios.get("https://cse598-requester.onrender.com/api/images/get_images/");
        setImages(response.data.images);
        setCurrentIndex(0);
        setLabeledCount(0); // Reset labeled count when fetching new images
    };

    const generateToken = () => {
        return `TOKEN_${Math.floor(1000 + Math.random() * 9000)}`;
    };

    const handleLabel = async (label) => {
        if (currentIndex >= images.length) return;

        const imageUrl = images[currentIndex];
        const imageName = imageUrl.split("/").pop();

        await axios.post("https://cse598-requester.onrender.com/api/images/submit_label/", {
            image_name: imageName,
            label
        });

        const newLabeledCount = labeledCount + 1;
        setLabeledCount(newLabeledCount);

        if (newLabeledCount === 10) {
            const newToken = generateToken();
            setTokens([...tokens, newToken]);
            setLabeledCount(0); // Reset progress bar after generating a token
        }

        if (currentIndex === images.length - 1) {
            fetchImages();
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    };

    return (
        <div className="container">
            {/* Instruction Box */}
            <div className="instruction-box">
                <h2>Welcome to Image Labeling</h2>
                <p>Help us classify images by selecting whether they are AI-generated or real. For every 10 images you label, you earn a token.</p>
                <p>Your contributions improve AI accuracy!</p>
            </div>

            {/* Image Display */}
            {images.length > 0 && currentIndex < images.length ? (
                <div>
                    <div className="image-container">
                        <img src={`https://cse598-requester.onrender.com${images[currentIndex]}`} alt="Label this" />
                    </div>

                    <p className="instructions">Is this a real photo or AI-generated?</p>

                    {/* Centered Buttons */}
                    <div className="button-container">
                        <button className="real-button" onClick={() => handleLabel("Real")}>Real</button>
                        <button className="ai-button" onClick={() => handleLabel("AI")}>AI</button>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${(labeledCount / 10) * 100}%` }}></div>
                    </div>

                    <p className="progress-text">{labeledCount}/10 images labeled until next token</p>
                </div>
            ) : (
                <p className="loading-message">Please wait for the backend to load (1 min). Thanks for your patience!</p>
            )}

            {/* Token Display */}
            {tokens.length > 0 && (
                <div className="token-container">
                    <p>🎉 You've earned tokens:</p>
                    {tokens.map((t, index) => (
                        <p key={index}>{t}</p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default App;
