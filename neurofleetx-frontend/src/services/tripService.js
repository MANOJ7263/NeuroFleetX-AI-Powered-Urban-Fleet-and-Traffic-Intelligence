import axios from "axios";
import { getToken } from "../utils/auth";

const API_URL = "http://localhost:9090/api/trips";

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const getPendingTrips = async () => {
  const res = await axios.get(`${API_URL}/pending`, authHeader());
  return res.data;
};

export const getActiveTrips = async () => {
  const res = await axios.get(`${API_URL}/active`, authHeader());
  return res.data;
};

export const assignTrip = async (tripId, payload) => {
  const res = await axios.post(
    `${API_URL}/${tripId}/assign`,
    payload,
    authHeader()
  );
  return res.data;
};

export const requestTrip = async (tripData) => {
  const res = await axios.post(`${API_URL}/request`, tripData, authHeader());
  return res.data;
};



export const getCurrentDriverTrip = async () => {
  const res = await axios.get(`${API_URL}/driver/current`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });
  return res.data;
};

// --- Trip Offers (Driver / Customer Search) ---

export const createTripOffer = async (offerData) => {
  const res = await axios.post(`http://localhost:9090/api/offers`, offerData, authHeader());
  return res.data;
};

export const searchTripOffers = async (source, destination) => {
  // api/offers/search?source=X&destination=Y
  const res = await axios.get(`http://localhost:9090/api/offers/search`, {
    ...authHeader(),
    params: { source, destination }
  });
  return res.data;
};

// --- Bookings (Customer / Manager) ---

export const createBooking = async (bookingData) => {
  const res = await axios.post(`http://localhost:9090/api/bookings`, bookingData, authHeader());
  return res.data;
};

export const getMyBookings = async () => {
  const res = await axios.get(`http://localhost:9090/api/bookings/my`, authHeader());
  return res.data;
};

export const getDriverRequests = async () => {
  const res = await axios.get(`http://localhost:9090/api/bookings/driver/requests`, authHeader());
  return res.data;
};

export const getPendingBookings = async () => {
  const res = await axios.get(`http://localhost:9090/api/bookings/pending`, authHeader());
  return res.data;
};

export const confirmBooking = async (bookingId) => {
  const res = await axios.post(`http://localhost:9090/api/bookings/${bookingId}/confirm`, {}, authHeader());
  return res.data;
};

export const getDriverConfirmedBookings = async () => {
  const res = await axios.get(`http://localhost:9090/api/bookings/driver/confirmed`, authHeader());
  return res.data;
};

export const cancelBooking = async (bookingId) => {
  const res = await axios.post(`http://localhost:9090/api/bookings/${bookingId}/cancel`, {}, authHeader());
  return res.data;
};

export const getTripRecommendations = async (query) => {
  const res = await axios.get(`${API_URL}/recommendations`, {
    ...authHeader(),
    params: { query }
  });
  return res.data;
};

export const getOptimizedRoute = async (origin, destination) => {
  const res = await axios.post(`${API_URL}/optimize`, { origin, destination }, authHeader());
  return res.data;
};
