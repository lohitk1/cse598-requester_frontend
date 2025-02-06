import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [token, setToken] = useState("");

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        const response = await axios.get("http://127.0.0.1:8000/api/images/get_images/");
        setImages(response.data.images);
        setCurrentIndex(0);
    };

    const handleLabel = async (label) => {
        if (currentIndex >= images.length) return;

        const imageUrl = images[currentIndex];
        const imageName = imageUrl.split("/").pop(); // Extract filename from URL

        const response = await axios.post("http://127.0.0.1:8000/api/images/submit_label/", {
            image_name: imageName,
            label
        });

        if (response.data.token) {
            setToken(response.data.token);
        }

        if (currentIndex === images.length - 1) {
            fetchImages();  // Load next batch
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    };

    return (
        <div className="p-4 max-w-lg mx-auto">
            <h1 className="text-xl font-bold text-center">Label Images</h1>

            {images.length > 0 && currentIndex < images.length ? (
                <div className="text-center">
                    <img src={`http://127.0.0.1:8000${images[currentIndex]}`} alt="Label" className="w-full h-64 object-cover mb-4" />
                    <p className="text-gray-600">Label this image:</p>
                    <button className="bg-green-500 text-white px-4 py-2 mx-2" onClick={() => handleLabel("Real")}>
                        Real
                    </button>
                    <button className="bg-red-500 text-white px-4 py-2" onClick={() => handleLabel("AI")}>
                        AI
                    </button>
                </div>
            ) : (
                <p className="text-center">No images available</p>
            )}

            {token && <p className="text-green-500 text-center mt-4">You've earned a token: {token}</p>}
        </div>
    );
};

export default App;
