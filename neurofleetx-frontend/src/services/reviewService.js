import axios from "axios";
import { getToken } from "../utils/auth";

const API_URL = "http://localhost:9090/api/reviews";

const authHeader = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`,
    },
});

export const submitReview = async (reviewData) => {
    // reviewData: { vehicleId, rating, content }
    const res = await axios.post(API_URL, reviewData, authHeader());
    return res.data;
};

export const getReviews = async (vehicleId) => {
    const res = await axios.get(`${API_URL}/vehicle/${vehicleId}`, authHeader());
    return res.data;
};
