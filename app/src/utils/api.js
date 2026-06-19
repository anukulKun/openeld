import axios from 'axios';
import { supabase } from '../lib/supabase';
import { riskScore } from './tripPresentation';

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000/api'
    : '/api');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

export const saveTripToSupabase = async (tripPlan, user) => {
  if (!supabase || !user || !tripPlan) return null;
  const risk = riskScore(tripPlan);
  const { data, error } = await supabase.from('trips').insert({
    user_id: user.id,
    route_title: tripPlan.trip_title,
    origin: tripPlan.start_location,
    pickup: tripPlan.pickup_location,
    destination: tripPlan.dropoff_location,
    start_time: tripPlan.start_time,
    hos_rules: tripPlan.hos_rules,
    total_miles: tripPlan.total_distance_miles,
    drive_hours: tripPlan.total_driving_hours,
    risk_level: risk.label,
    plan_payload: tripPlan,
  }).select().single();
  if (error) throw error;
  return data;
};

export const fetchSupabaseTrips = async (user, limit = 12) => {
  if (!supabase || !user) return [];
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map((row) => ({
    ...(row.plan_payload || {}),
    trip_id: row.id,
    created_at: row.created_at,
    trip_title: row.route_title,
    start_location: row.origin,
    pickup_location: row.pickup,
    dropoff_location: row.destination,
    total_distance_miles: row.total_miles,
    total_driving_hours: row.drive_hours,
  }));
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
