import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const Auth = ({ setUser }) => {
    const handleSuccess = async (credentialResponse) => {
        const { credential } = credentialResponse;
        const response = await axios.post("http://127.0.0.1:8000/api/auth/social/login/", { token: credential });
        setUser(response.data.user);
    };

    return (
        <GoogleOAuthProvider clientId="868801804420-jck4qbo7p48ltau3ssqb5mr060m2hlmc.apps.googleusercontent.com">
            <div className="text-center mt-20">
                <h1 className="text-xl font-bold mb-4">Login to Start Labeling</h1>
                <GoogleLogin onSuccess={handleSuccess} onError={() => console.log("Login Failed")} />
            </div>
        </GoogleOAuthProvider>
    );
};

export default Auth;
