import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [tokens, setTokens] = useState([]);
    const [labeledCount, setLabeledCount] = useState(0);
    const [userChoice, setUserChoice] = useState(null);
    const [aiPrediction, setAiPrediction] = useState(null);
    const [finalChoice, setFinalChoice] = useState(null);
    const [step, setStep] = useState("select"); // 'select', 'ai-feedback', 'final-submit'

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const response = await axios.get("https://cse598-requester.onrender.com/api/images/get_images/");
            setImages(response.data.images);
            setCurrentIndex(0);
            setLabeledCount(0);
        } catch (error) {
            console.error("Error fetching images:", error);
        }
    };

    const fetchAIPrediction = async (imageName) => {
        try {
            const response = await axios.get(`https://cse598-requester.onrender.com/api/ai/predict/${imageName}`);
            setAiPrediction(response.data);
        } catch (error) {
            console.error("Error fetching AI prediction. Generating a random prediction instead.");
            const randomPrediction = Math.random() > 0.5 ? "AI" : "Real";
            const randomConfidence = (Math.random() * (95 - 60) + 60).toFixed(2); // Random confidence between 60% and 95%
            setAiPrediction({ label: randomPrediction, confidence: randomConfidence });
        }
        setStep("ai-feedback");
    };

    const generateToken = () => `TOKEN_${Math.floor(1000 + Math.random() * 9000)}`;

    const handleLabel = async (label) => {
        if (currentIndex >= images.length) return;

        setUserChoice(label);
        const imageUrl = images[currentIndex];
        const imageName = imageUrl.split("/").pop();

        await fetchAIPrediction(imageName);
    };

    const handleAIOverride = (acceptAI) => {
        setFinalChoice(acceptAI && aiPrediction ? aiPrediction.label : userChoice);
        setStep("final-submit");
    };

    const handleGoBack = () => setStep("ai-feedback");

    const handleSubmit = async () => {
        if (!finalChoice) return;

        const imageUrl = images[currentIndex];
        const imageName = imageUrl.split("/").pop();

        await axios.post("https://cse598-requester.onrender.com/api/images/submit_label/", {
            image_name: imageName,
            label: finalChoice
        });

        const newLabeledCount = labeledCount + 1;
        setLabeledCount(newLabeledCount);

        if (newLabeledCount === 10) {
            setTokens([...tokens, generateToken()]);
            setLabeledCount(0);
        }

        if (currentIndex === images.length - 1) {
            fetchImages();
        } else {
            setCurrentIndex(currentIndex + 1);
        }

        setUserChoice(null);
        setAiPrediction(null);
        setFinalChoice(null);
        setStep("select");
    };

    return (
        <div className="container">
            {/* Updated Instructions */}
            <div className="instruction-box">
                <h2>🔍 How This Works</h2>
                <ul>
                    <li>1️⃣&nbsp;<strong>Select</strong>&nbsp;whether the image is AI-generated or real.</li>
                    <li>2️⃣&nbsp;<strong>See</strong>&nbsp;the AI’s prediction and confidence score.</li>
                    <li>3️⃣&nbsp;<strong>Decide</strong>&nbsp;to keep your choice or switch to AI’s suggestion.</li>
                    <li>4️⃣&nbsp;<strong>Submit</strong>&nbsp;your final decision and move to the next image.</li>
                    <li>🏆 Earn a token for every 10 images labeled!</li>
                </ul>
            </div>

            {/* Image Display */}
            {images.length > 0 && currentIndex < images.length ? (
                <div>
                    <div className="image-container">
                        <img src={`https://cse598-requester.onrender.com${images[currentIndex]}`} alt="Label this" />
                    </div>

                    {step === "select" && (
                        <>
                            <p className="instructions">Is this a <strong>real photo</strong> or <strong>AI-generated</strong>?</p>
                            <div className="button-container">
                                <button className="real-button" onClick={() => handleLabel("Real")}>Real</button>
                                <button className="ai-button" onClick={() => handleLabel("AI")}>AI</button>
                            </div>
                        </>
                    )}

                    {step === "ai-feedback" && aiPrediction && (
                        <>
                            <p className="ai-response">
                                {aiPrediction.label === userChoice ? (
                                    <>
                                        <strong>👏 Well done!</strong> The AI also predicted <strong>{userChoice}</strong> ({aiPrediction.confidence}% confidence). 
                                        Would you like to&nbsp;<strong>stick with your choice</strong>&nbsp;or&nbsp;<strong>change it</strong>?
                                    </>
                                ) : (
                                    <>
                                        <strong>🤔 Different perspectives!</strong> The AI predicted <strong>{aiPrediction.label}</strong> ({aiPrediction.confidence}% confidence), 
                                        which differs from your choice. Would you like to&nbsp;<strong>switch to AI's prediction</strong>?
                                    </>
                                )}
                            </p>
                            <div className="button-container">
                                {aiPrediction.label === userChoice ? (
                                    <>
                                        <button className="override-button" onClick={() => handleAIOverride(false)}>
                                            ✅ Stick with my choice ({userChoice})
                                        </button>
                                        <button className="override-button" onClick={() => handleAIOverride(true)}>
                                            🔄 Change my choice
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="override-button" onClick={() => handleAIOverride(true)}>
                                            🔄 Switch to AI's Prediction ({aiPrediction.label})
                                        </button>
                                        <button className="override-button" onClick={() => handleAIOverride(false)}>
                                            ✅ Keep my choice ({userChoice})
                                        </button>
                                    </>
                                )}
                            </div>
                        </>
                    )}

                    {step === "final-submit" && (
                        <>
                            <p className="final-choice">🎯 Final Selection: <strong>{finalChoice}</strong></p>
                            <div className="button-container">
                                <button className="go-back-button" onClick={handleGoBack}>🔙 Go Back</button>
                                <button className="submit-button" onClick={handleSubmit}>🚀 Submit</button>
                            </div>
                        </>
                    )}

                    {/* Restored Progress Bar */}
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${(labeledCount / 10) * 100}%` }}></div>
                    </div>
                    <p className="progress-text">📊 {labeledCount}/10 images labeled until next token</p>

                </div>
            ) : (
                <p className="loading-message">⏳ Please wait for the backend to load (1 min). I didn't pay for hosting :( Thanks for your patience!</p>
            )}

            {/* Token Display */}
            {tokens.length > 0 && (
                <div className="token-container">
                    <p>🏅 Tokens Earned:</p>
                    {tokens.map((t, index) => (
                        <p key={index}>{t}</p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default App;
