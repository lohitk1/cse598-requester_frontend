import axios from "axios";

const API_URL = "https://cse598-requester.onrender.com/api/images/";

export const getImages = () => axios.get(API_URL);
export const labelImage = (id, label) => axios.patch(`${API_URL}${id}/`, { label });
export const uploadImage = (formData) => axios.post(API_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" }
});
