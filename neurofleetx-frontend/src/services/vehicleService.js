import axios from "axios";
import { getToken } from "../utils/auth";

const API_URL = "http://localhost:9090/api/vehicles";

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getVehicles = async () => {
  const res = await axios.get(API_URL, authHeader());
  return res.data;
};

export const addVehicle = async (vehicle) => {
  const res = await axios.post(API_URL, vehicle, authHeader());
  return res.data;
};

export const deactivateVehicle = async (id) => {
  await axios.delete(`${API_URL}/${id}`, authHeader());
};

export const updateVehicle = async (id, vehicle) => {
  const res = await axios.put(`${API_URL}/${id}`, vehicle, authHeader());
  return res.data;
};

export const approveVehicle = async (id) => {
  await axios.post(`${API_URL}/${id}/approve`, {}, authHeader());
};

export const denyVehicle = async (id) => {
  await axios.post(`${API_URL}/${id}/deny`, {}, authHeader());
};

export const getPendingVehicles = async () => {
  const res = await axios.get(`${API_URL}/pending`, authHeader());
  return res.data;
};

export const getApprovedVehicles = async () => {
  const res = await axios.get(`${API_URL}/approved`, authHeader());
  return res.data;
};

export const toggleVehicleApproval = async (id) => {
  const res = await axios.put(`${API_URL}/${id}/toggle-approval`, {}, authHeader());
  return res.data;
};

