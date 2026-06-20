import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import MainPages from './components/HosDashboard';
import BottomNav from './components/BottomNav';
import AuthModal from './components/AuthModal';
import { fetchSupabaseTrips, planTrip, saveTripToSupabase } from './utils/api';
import { supabase } from './lib/supabase';

const DEFAULT_START_TIME = '2026-05-08T18:11';
const LOADING_MESSAGES = [
  'Calculating route with OSRM...',
  'Applying FMCSA HOS rules...',
  'Generating daily log sheets...',
  'Building stop plan...',
];
const HISTORY_LIMIT = 12;

function App() {
  migrateLegacyStorage();
  const [currentPage, setCurrentPage] = useState('planner');
  const [theme, setTheme] = useState(() => localStorage.getItem('openeld-theme') || 'dark');
  const [plannerTab, setPlannerTab] = useState('overview');
  const [formData, setFormData] = useState({
    driver_name: 'John Doe',
    hos_rules: '70-hour/8-day',
    start_location: 'New York, NY',
    pickup_location: 'Chicago, IL',
    end_location: 'Los Angeles, CA',
    start_time: DEFAULT_START_TIME,
    cycle_hours_used: 14,
  });
  const [tripPlan, setTripPlan] = useState(() => readStorage('openeld-last-plan', null));
  const [history, setHistory] = useState(() => readStorage('openeld-history', []).map(summarizeTrip));
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(null);

  const activePlan = useMemo(() => {
    if (currentPage === 'history' && selectedHistoryId) {
      return history.find((trip) => trip.trip_id === selectedHistoryId) || tripPlan;
    }
    return tripPlan;
  }, [currentPage, history, selectedHistoryId, tripPlan]);

  useEffect(() => {
    if (tripPlan) writeStorage('openeld-last-plan', tripPlan);
    else localStorage.removeItem('openeld-last-plan');
  }, [tripPlan]);

  useEffect(() => {
    if (!user) writeStorage('openeld-history', history.slice(0, HISTORY_LIMIT).map(summarizeTrip));
  }, [history, user]);

  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchSupabaseTrips(user, HISTORY_LIMIT)
      .then((trips) => {
        setHistory(trips);
        if (trips[0]) {
          setTripPlan(trips[0]);
          setSelectedHistoryId(trips[0].trip_id);
        }
      })
      .catch(() => setError('Signed in, but saved trips could not be loaded. Local trips are still available.'));
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('openeld-theme', theme);
  }, [theme]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'cycle_hours_used' ? Number(value) : value,
    }));
  };

  const handlePlanTrip = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});
    try {
      const plan = await planTrip(formData);
      const storedPlan = {
        ...plan,
        form: { ...formData },
        created_at: new Date().toISOString(),
        status: plan.compliance_status === 'VIOLATION' ? 'ERR' : plan.warnings?.length ? 'WARN' : 'OK',
      };
      setTripPlan(storedPlan);
      setHistory((prev) => [storedPlan, ...prev.filter((trip) => trip.trip_id !== storedPlan.trip_id)].slice(0, HISTORY_LIMIT));
      setSelectedHistoryId(storedPlan.trip_id);
      setPlannerTab('overview');
      setCurrentPage('planner');
      setSidebarOpen(false);
      if (user) {
        saveTripToSupabase(storedPlan, user).catch(() => setError('Trip planned, but it could not be saved to your account.'));
      }
    } catch (err) {
      const payload = err.response?.data;
      // FIX 7.5: surface API validation inline next to the relevant input.
      if (payload?.field) {
        setFieldErrors({ [fieldNameForApi(payload.field)]: payload.message });
      } else if (payload?.fields) {
        setFieldErrors(Object.fromEntries(payload.fields.map((field) => [fieldNameForApi(field), 'Required'])));
      } else {
        setError(payload?.message || payload?.detail || 'Unable to plan this trip. Check the backend server and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHistorySelect = (plan) => {
    setSelectedHistoryId(plan.trip_id);
    if (plan.route && plan.daily_logs) setTripPlan(plan);
    else setCurrentPage('history');
  };

  const handleClearActiveTrip = () => {
    setTripPlan(null);
    setSelectedHistoryId(null);
    setPlannerTab('overview');
    localStorage.removeItem('openeld-last-plan');
  };

  const handleUseDeparture = (startTime) => {
    setFormData((prev) => ({ ...prev, start_time: startTime }));
    setSidebarOpen(true);
  };

  const handleAuthClick = async () => {
    if (user && supabase) {
      await supabase.auth.signOut();
      setUser(null);
      setHistory(readStorage('openeld-history', []).map(summarizeTrip));
      return;
    }
    setAuthOpen(true);
  };

  return (
    <div className="app-frame" data-theme={theme}>
      {/* FIX UI-2: restore all primary destinations with a clear active state and theme control. */}
      <header className="top-nav">
        <div className="nav-brand">
          <button className="hamburger" type="button" onClick={() => setSidebarOpen((open) => !open)} aria-label="Toggle sidebar">Menu</button>
          <img src="/logo-light.png" alt="OpenELD" className="nav-logo-light" />
          <img src="/logo-dark.png" alt="OpenELD" className="nav-logo-dark" />
        </div>
        <nav className="nav-links" aria-label="Primary views">
          {[
            ['planner', 'Trip Planner'],
            ['dashboard', 'HOS Dashboard'],
            ['history', 'Log History'],
          ].map(([id, label]) => (
            <button key={id} className={currentPage === id ? 'nav-link active' : 'nav-link'} type="button" onClick={() => setCurrentPage(id)}>
              {label}
              {currentPage === id && <span className="nav-link-dot" />}
            </button>
          ))}
        </nav>
        <div className="nav-actions">
          <button className="auth-button" type="button" onClick={handleAuthClick}>{user ? user.email : 'Sign In'}</button>
          <button className="theme-toggle" type="button" onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>
      <div className={`app-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <button className="sidebar-overlay" type="button" aria-label="Close trip panel" onClick={() => setSidebarOpen(false)} />
        <Sidebar
          formData={formData}
          loading={loading}
          tripPlan={tripPlan}
          history={history}
          onFormChange={handleFormChange}
          onSubmit={handlePlanTrip}
          onPageChange={setCurrentPage}
          onPlannerTabChange={setPlannerTab}
          onHistorySelect={handleHistorySelect}
          onClearActiveTrip={handleClearActiveTrip}
          fieldErrors={fieldErrors}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="workspace">
          {error && <div className="error-banner">{error}</div>}
          {loading && <LoadingState />}
          <MainPages
            page={currentPage}
            plannerTab={plannerTab}
            onPlannerTabChange={setPlannerTab}
            formData={activePlan?.form || formData}
            liveFormData={formData}
            onFormChange={handleFormChange}
            onSubmit={handlePlanTrip}
            fieldErrors={fieldErrors}
            tripPlan={activePlan}
            history={history}
            selectedHistoryId={selectedHistoryId}
            onHistorySelect={handleHistorySelect}
            loading={loading}
            onUseDeparture={handleUseDeparture}
            onPlanNew={() => {
              handleClearActiveTrip();
              setSidebarOpen(true);
            }}
            onPageChange={setCurrentPage}
          />
        </main>
      </div>
      <button className="mobile-sheet-button" type="button" onClick={() => setSidebarOpen(true)}>Plan Trip</button>
      <BottomNav currentPage={currentPage} onPageChange={setCurrentPage} onAuthClick={handleAuthClick} user={user} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuth={setUser} />
    </div>
  );
}

function LoadingState() {
  const [index, setIndex] = useState(0);
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => setIndex((current) => (current + 1) % LOADING_MESSAGES.length), 1500);
    const slowTimer = setTimeout(() => setSlow(true), 8000);
    return () => {
      clearInterval(timer);
      clearTimeout(slowTimer);
    };
  }, []);
  return (
    <div className="loading-panel">
      <div className="spinner" />
      <strong>{LOADING_MESSAGES[index]}</strong>
      {slow && <span>Route calculation is taking longer than expected. OSRM may be slow - please wait.</span>}
    </div>
  );
}

function fieldNameForApi(field) {
  return {
    current_location: 'start_location',
    start_location: 'start_location',
    dropoff_location: 'end_location',
    cycle_hours_used: 'cycle_hours_used',
  }[field] || field;
}

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    if (error?.name === 'QuotaExceededError') {
      localStorage.removeItem(key);
      return false;
    }
    throw error;
  }
}

function migrateLegacyStorage() {
  if (migrateLegacyStorage.done) return;
  migrateLegacyStorage.done = true;
  copyAndRemoveStorage('routeguard-last-plan', 'openeld-last-plan');
  copyAndRemoveStorage('routeguard-history', 'openeld-history');
}

function copyAndRemoveStorage(oldKey, newKey) {
  try {
    const existing = localStorage.getItem(oldKey);
    if (existing && !localStorage.getItem(newKey)) localStorage.setItem(newKey, existing);
    if (existing) localStorage.removeItem(oldKey);
  } catch {
    // Storage migration should never block app startup.
  }
}

function summarizeTrip(trip) {
  if (!trip) return {};
  return {
    trip_id: trip.trip_id,
    trip_title: trip.trip_title,
    start_location: trip.start_location,
    pickup_location: trip.pickup_location,
    dropoff_location: trip.dropoff_location,
    driver_name: trip.driver_name,
    total_distance_miles: trip.total_distance_miles,
    total_driving_hours: trip.total_driving_hours,
    status: trip.status,
    compliance_status: trip.compliance_status,
    created_at: trip.created_at,
    start_time: trip.start_time,
    summary: {
      eta: trip.summary?.eta,
      planned_stops: trip.summary?.planned_stops,
    },
    form: trip.form,
    log_summaries: (trip.daily_logs || trip.log_summaries || []).map((log) => ({
      day: log.day,
      date: log.date,
      hos_summary: log.hos_summary,
      shift_drive_breakdown: log.shift_drive_breakdown,
    })),
  };
}

export default App;
