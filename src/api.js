import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/images/";

export const getImages = () => axios.get(API_URL);
export const labelImage = (id, label) => axios.patch(`${API_URL}${id}/`, { label });
export const uploadImage = (formData) => axios.post(API_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" }
});
