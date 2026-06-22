import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import MainPages from './components/HosDashboard';
import BottomNav from './components/BottomNav';
import SignInGate from './components/SignInGate';
import ProfileMenu from './components/ProfileMenu';
import { useAuth } from './context/AuthContext';
import { planTrip } from './utils/api';
import { getDriverProfile, saveTripRecord, getTripRecords, optimizeTrip } from './api/client';
import { isFirebaseConfigured } from './firebase';

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
  const { currentUser, idToken } = useAuth();
  const [currentPage, setCurrentPage] = useState('planner');
  const [theme, setTheme] = useState(() => localStorage.getItem('openeld-theme') || 'dark');
  const logoSrc = '/logo.png';
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
  const [optimizerData, setOptimizerData] = useState(null);
  const [optimizerLoading, setOptimizerLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (currentUser && isFirebaseConfigured && idToken) {
      localStorage.removeItem('openeld-history');
      getTripRecords(idToken).then((records) => {
        const trips = records.results || records || [];
        if (trips.length) setHistory(trips.map(summarizeTripRecord));
        else setHistory([]);
      }).catch(() => setHistory([]));
    }
  }, [currentUser, idToken]);

  useEffect(() => {
    if (currentUser && idToken && isFirebaseConfigured) {
      getDriverProfile(idToken).then((profile) => {
        if (!profile) return;
        setFormData((prev) => ({
          ...prev,
          driver_name: profile.name || prev.driver_name,
          hos_rules: profile.ruleset || prev.hos_rules,
          cycle_hours_used: profile.cycle_used_hours ?? prev.cycle_hours_used,
        }));
      }).catch(() => {});
    }
  }, [currentUser, idToken]);

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
    if (!currentUser) writeStorage('openeld-history', history.slice(0, HISTORY_LIMIT).map(summarizeTrip));
  }, [history, currentUser]);

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

  const planWithFormData = async (data) => {
    setLoading(true);
    setOptimizerLoading(true);
    setError('');
    setFieldErrors({});
    try {
      const [plan, optimizeResp] = await Promise.all([
        planTrip(data),
        idToken && optimizeTrip(idToken, {
          current_location: data.start_location,
          pickup_location: data.pickup_location,
          dropoff_location: data.end_location,
          current_cycle_hours: data.cycle_hours_used,
          driver_name: data.driver_name,
          start_time: data.start_time,
          hos_rules: data.hos_rules,
        }).catch(() => null),
      ]);
      setOptimizerData(optimizeResp || null);
      const storedPlan = {
        ...plan,
        form: { ...data },
        created_at: new Date().toISOString(),
        status: plan.compliance_status === 'VIOLATION' ? 'ERR' : plan.warnings?.length ? 'WARN' : 'OK',
      };
      setTripPlan(storedPlan);
      setHistory((prev) => [storedPlan, ...prev.filter((trip) => trip.trip_id !== storedPlan.trip_id)].slice(0, HISTORY_LIMIT));
      if (currentUser && idToken && isFirebaseConfigured) {
        saveTripRecord(idToken, tripToRecord(plan, data)).then((saved) => {
          if (saved && saved.id) {
            storedPlan.trip_id = saved.id;
            storedPlan.db_id = saved.id;
          }
        }).catch(() => {});
      }
      setSelectedHistoryId(storedPlan.trip_id);
      setPlannerTab('overview');
      setCurrentPage('planner');
      setSidebarOpen(false);
    } catch (err) {
      const payload = err.response?.data;
      if (payload?.field) {
        setFieldErrors({ [fieldNameForApi(payload.field)]: payload.message });
      } else if (payload?.fields) {
        setFieldErrors(Object.fromEntries(payload.fields.map((field) => [fieldNameForApi(field), 'Required'])));
      } else {
        setError(payload?.message || payload?.detail || 'Unable to plan this trip. Check the backend server and try again.');
      }
    } finally {
      setLoading(false);
      setOptimizerLoading(false);
    }
  };

  const handlePlanTrip = async (event) => {
    event.preventDefault();
    await planWithFormData(formData);
  };

  const handleUseOptimizerTime = async (startTime) => {
    const updated = { ...formData, start_time: startTime };
    setFormData(updated);
    await planWithFormData(updated);
  };

  const handleHistorySelect = (plan) => {
    if (selectedHistoryId === plan.trip_id) {
      setSelectedHistoryId(null);
      return;
    }
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

  if (isFirebaseConfigured && !currentUser) {
    return <SignInGate />;
  }
  if (!isFirebaseConfigured) {
    console.warn('[OpenELD] Firebase not configured — sign-in gate is disabled, running unauthenticated.');
  }

  return (
    <div className="app-frame" data-theme={theme}>
      <header className="top-nav">
        <div className="nav-brand">
          <button className="hamburger" type="button" onClick={() => setSidebarOpen((open) => !open)} aria-label="Toggle sidebar">Menu</button>
          <img src={logoSrc} alt="OpenELD" className="nav-logo-mark" />
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
          <ProfileMenu user={currentUser} />
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
            optimizerData={optimizerData}
            optimizerLoading={optimizerLoading}
            onUseDeparture={handleUseDeparture}
            onUseOptimizerTime={handleUseOptimizerTime}
            onPlanNew={() => {
              handleClearActiveTrip();
              setSidebarOpen(true);
            }}
            onPageChange={setCurrentPage}
            logoSrc={logoSrc}
            onDeleteTrip={(id) => {
              setHistory((prev) => prev.filter((t) => t.trip_id !== id && t.db_id !== id));
              setSelectedHistoryId((prev) => prev === id ? null : prev);
            }}
          />
        </main>
      </div>
      <button className="mobile-sheet-button" type="button" onClick={() => setSidebarOpen(true)}>Plan Trip</button>
      <BottomNav currentPage={currentPage} onPageChange={setCurrentPage} />
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
  }
}

function tripToRecord(plan, form) {
  const risk = plan.compliance_status === 'VIOLATION' ? 'HIGH' : plan.warnings?.length ? 'MEDIUM' : 'LOW';
  const stops = (plan.route?.waypoints || plan.summary?.planned_stops || []).map((s) => ({
    location: s.location || s.name || '',
    type: s.type || 'stop',
    duration_hours: s.duration_hours || s.duration || 0,
    arrival: s.arrival || s.eta || '',
  }));
  return {
    origin: plan.start_location || form.start_location,
    pickup: plan.pickup_location || form.pickup_location || '',
    destination: plan.dropoff_location || form.end_location,
    start_time: plan.start_time || form.start_time,
    ruleset: plan.hos_rules || form.hos_rules,
    cycle_used_at_start: form.cycle_hours_used || plan.current_cycle_hours || 0,
    total_miles: plan.total_distance_miles || 0,
    estimated_drive_hours: plan.total_driving_hours || 0,
    stops: stops,
    daily_logs: plan.daily_logs || [],
    violation_risk: risk,
  };
}

function summarizeTripRecord(record) {
  const risk = record.violation_risk || '';
  return {
    trip_id: record.id,
    db_id: record.id,
    trip_title: `${record.origin} \u2192 ${record.pickup || record.destination} \u2192 ${record.destination}`,
    start_location: record.origin,
    pickup_location: record.pickup,
    dropoff_location: record.destination,
    driver_name: '',
    total_distance_miles: record.total_miles || 0,
    total_driving_hours: record.estimated_drive_hours || 0,
    status: risk === 'HIGH' ? 'ERR' : risk === 'MEDIUM' ? 'WARN' : 'OK',
    compliance_status: risk === 'HIGH' ? 'VIOLATION' : risk === 'MEDIUM' ? 'WARNING' : 'COMPLIANT',
    created_at: record.created_at,
    start_time: record.start_time,
    violation_risk: risk,
    summary: {
      eta: '',
      planned_stops: record.stops || [],
    },
    form: {},
    log_summaries: (record.daily_logs || []).map((log) => ({
      day: log.day,
      date: log.date,
      hos_summary: log.hos_summary,
      shift_drive_breakdown: log.shift_drive_breakdown,
    })),
    daily_logs: record.daily_logs || [],
  };
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
    violation_risk: trip.violation_risk || '',
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
