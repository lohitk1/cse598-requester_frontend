import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [token, setToken] = useState("");
    const [labeledCount, setLabeledCount] = useState(0);
    const [tokens, setTokens] = useState([]);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        const response = await axios.get("https://cse598-requester.onrender.com/api/images/get_images/");
        console.log(`Number of images returned: ${response.data.images.length}`);
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
            setLabeledCount(0); // Reset labeled count after generating a token
        }

        if (currentIndex === images.length - 1) {
            fetchImages();
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    };

    return (
        <div className="p-4 max-w-lg mx-auto">
            <h1 className="text-xl font-bold text-center">Label Images</h1>

            {images.length > 0 && currentIndex < images.length ? (
                <div className="text-center">
                    <img src={`https://cse598-requester.onrender.com${images[currentIndex]}`} alt="Label" className="w-full h-[30vh] object-cover mb-4" style={{ maxWidth: '100%', height: '30vh', objectFit: 'cover' }} />
                    <p className="text-gray-600">Label this image:</p>
                    <button className="bg-green-500 text-white px-4 py-2 mx-2" onClick={() => handleLabel("Real")}>
                        Real
                    </button>
                    <button className="bg-red-500 text-white px-4 py-2" onClick={() => handleLabel("AI")}>
                        AI
                    </button>
                </div>
            ) : (
                <p className="text-center">Please wait for the backend to load (1 min). I didn't pay for hosting :(</p>
            )}

            {tokens.length > 0 && (
                <div className="text-green-500 text-center mt-4">
                    <p>You've earned tokens:</p>
                    {tokens.map((t, index) => (
                        <p key={index}>{t}</p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default App;
