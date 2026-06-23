import axios from 'axios';
import { auth } from '../firebase';

const API_BASE_URL = process.env.REACT_APP_API_URL;
if (!API_BASE_URL) {
  throw new Error('REACT_APP_API_URL is not set. Add it to your .env file.');
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const user = auth?.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const planTrip = async (tripData) => {
  try {
    const response = await apiClient.post('/trips/plan/', {
      current_location: tripData.start_location,
      pickup_location: tripData.pickup_location,
      dropoff_location: tripData.end_location,
      current_cycle_hours: tripData.cycle_hours_used,
      driver_name: tripData.driver_name,
      start_time: tripData.start_time,
      hos_rules: tripData.hos_rules,
    });
    return response.data;
  } catch (error) {
    console.error('Error planning trip:', error);
    throw error;
  }
};

export const getTrips = async () => {
  try {
    const response = await apiClient.get('/trips/');
    return response.data.results || response.data;
  } catch (error) {
    console.error('Error fetching trips:', error);
    throw error;
  }
};

export const getTrip = async (id) => {
  try {
    const response = await apiClient.get(`/trips/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching trip:', error);
    throw error;
  }
};

export const updateTrip = async (id, tripData) => {
  try {
    const response = await apiClient.patch(`/trips/${id}/`, tripData);
    return response.data;
  } catch (error) {
    console.error('Error updating trip:', error);
    throw error;
  }
};

export const deleteTrip = async (id) => {
  try {
    await apiClient.delete(`/trips/${id}/`);
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
};

export const getRecentTrips = async () => {
  try {
    const response = await apiClient.get('/trips/recent/');
    return response.data;
  } catch (error) {
    console.error('Error fetching recent trips:', error);
    throw error;
  }
};

export default apiClient;
