import axios from "axios";
import { getToken } from "../utils/auth";

const API_URL = "http://localhost:9090/api/users";

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getDrivers = async () => {
  const res = await axios.get(`${API_URL}/drivers`, authHeader());
  return res.data;
};

export const getUserProfile = async () => {
  const res = await axios.get(`${API_URL}/profile`, authHeader());
  return res.data;
};

export const updateUserProfile = async (profileData) => {
  const res = await axios.put(`${API_URL}/profile`, profileData, authHeader());
  return res.data;
};
