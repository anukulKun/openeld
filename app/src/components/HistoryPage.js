import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { deleteTripRecord } from '../api/client';
import { formatHours } from '../utils/tripPresentation';

function HistoryPage({ history, selectedHistoryId, onHistorySelect, onDeleteTrip }) {
  const { idToken } = useAuth();
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [error, setError] = useState('');

  const handleDelete = useCallback(async (trip, e) => {
    e.stopPropagation();
    if (deletingIds.has(trip.trip_id)) return;
    const id = trip.db_id || trip.trip_id;
    if (!id) return;
    setDeletingIds((s) => new Set(s).add(trip.trip_id));
    try {
      await deleteTripRecord(idToken, id);
      if (onDeleteTrip) onDeleteTrip(id);
    } catch {
      setError('Failed to delete trip');
      setDeletingIds((s) => { const n = new Set(s); n.delete(trip.trip_id); return n; });
    }
  }, [idToken, onDeleteTrip, deletingIds]);

  const selected = selectedHistoryId ? history.find((trip) => trip.trip_id === selectedHistoryId) : null;

  return (
    <section className="page-stack">
      <div className="page-kicker">Records</div>
      <div className="history-header">
        <h1>Log History</h1>
        {history.length > 0 && (
          <button type="button" onClick={() => downloadAllJson(history)}>Download All JSON</button>
        )}
      </div>
      <div className="history-grid">
        <section className="history-panel">
          <div className="section-title">Trips</div>
          {error && <div className="error-banner">{error}</div>}
          {history.length === 0 && !error && <div className="empty-state compact">No saved trips yet.</div>}
          {history.map((trip) => {
            const isDeleting = deletingIds.has(trip.trip_id);
            const risk = trip.violation_risk || '';
            return (
              <article key={trip.trip_id} className={`history-trip-card ${isDeleting ? 'deleting' : ''}`}>
                <button className={selected?.trip_id === trip.trip_id ? 'history-trip active' : 'history-trip'} type="button" onClick={() => !isDeleting && onHistorySelect(trip)} disabled={isDeleting}>
                  <div>
                    <strong>{trip.trip_title || `${trip.start_location} -> ${trip.pickup_location} -> ${trip.dropoff_location}`}</strong>
                    <span>{new Date(trip.created_at || trip.start_time).toLocaleDateString()} | {Math.round(trip.total_distance_miles || 0)} mi | {formatHours(trip.total_driving_hours)}</span>
                  </div>
                  <div className="history-trip-right">
                    {risk && <b className={`risk-badge ${risk.toLowerCase()}`}>{risk}</b>}
                    <b className={`status-pill ${trip.status?.toLowerCase() || 'ok'}`}>{trip.status || 'OK'}</b>
                    <button className="delete-btn" type="button" onClick={(e) => handleDelete(trip, e)} disabled={isDeleting} title="Delete trip">Delete</button>
                  </div>
                </button>
                {selected?.trip_id === trip.trip_id && (
                  <div className="history-log-mobile">
                    {(trip.daily_logs || trip.log_summaries || []).map((log) => (
                      <article className="history-log" key={log.day}>
                        <strong>{new Date(log.date).toLocaleDateString()}</strong>
                        <span>{log.drive_label || ''} | On duty {log.hos_summary?.on_duty_hours || 0}h | Sleeper {hoursFor(log, 'SLEEPER_BERTH')}h</span>
                        <button type="button" disabled={isDeleting} onClick={() => downloadLogSvg(trip, log)}>Download Log</button>
                      </article>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </div>
    </section>
  );
}

function hoursFor(log, status) {
  const totals = log.hos_summary?.totals || log.totals || {};
  return Number(totals[status] || 0).toFixed(1);
}

function downloadAllJson(history) {
  const data = history.map((trip) => ({
    id: trip.trip_id,
    title: trip.trip_title,
    start_location: trip.start_location,
    pickup_location: trip.pickup_location,
    dropoff_location: trip.dropoff_location,
    start_time: trip.start_time,
    total_distance_miles: trip.total_distance_miles,
    total_driving_hours: trip.total_driving_hours,
    status: trip.status,
    compliance_status: trip.compliance_status,
    violation_risk: trip.violation_risk || '',
    created_at: trip.created_at,
    daily_logs: trip.daily_logs || [],
    stops: trip.summary?.planned_stops || [],
  }));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `openeld-trips-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function renderLogSvg(log) {
  const W = 760;
  const GRAPH_LEFT = 130;
  const GRAPH_RIGHT = 710;
  const GRAPH_W = GRAPH_RIGHT - GRAPH_LEFT;
  const TOTAL_COL_X = 730;
  const ROW_H = 31;
  const GRAPH_TOP = 218;
  const ROWS = ['1. Off Duty', '2. Sleeper Berth', '3. Driving', '4. On Duty (Not Driving)'];
  const STATUS_KEYS = ['off_duty', 'sleeper', 'driving', 'on_duty'];
  const statusToRow = { off_duty: 0, sleeper: 1, driving: 2, on_duty: 3, pc: 0, ym: 3 };
  const hx = (h) => GRAPH_LEFT + (Math.max(0, Math.min(24, Number(h) || 0)) / 24) * GRAPH_W;
  const rowY = (r) => GRAPH_TOP + r * ROW_H;
  const rowMidY = (r) => rowY(r) + ROW_H / 2;
  const totals = log.totals || {};
  const grandTotal = STATUS_KEYS.reduce((sum, key) => sum + Number(totals[key] || 0), 0);
  const totalOk = Math.abs(grandTotal - 24) < 0.1;
  const hourLabel = (h) => (h === 0 || h === 24 ? 'M' : h === 12 ? 'N' : String(h));
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const fmt = (v) => {
    if (v == null || v === '') return '-';
    const n = Number(v);
    return Number.isFinite(n) ? (Number.isInteger(n) ? String(n) : n.toFixed(1)) : String(v);
  };
  const F = (x) => fmt(x);

  const hourLabels = Array.from({ length: 25 }, (_, i) => {
    const x = hx(i).toFixed(1);
    return `<text x="${x}" y="${GRAPH_TOP - 5}" text-anchor="middle" font-size="9" fill="#000">${esc(hourLabel(i))}</text>`;
  }).join('');

  const gridRects = ROWS.map((_, ri) => {
    const y = rowY(ri);
    const fill = ri % 2 === 0 ? '#FAFAFA' : '#F3F3F3';
    return `<rect x="${GRAPH_LEFT}" y="${y}" width="${GRAPH_W}" height="${ROW_H}" fill="${fill}"/>`;
  }).join('');

  const gridLines = Array.from({ length: 25 }, (_, i) => {
    const x = hx(i).toFixed(1);
    const stroke = i % 6 === 0 ? '#888' : '#D0D0D0';
    const sw = i % 6 === 0 ? 1 : 0.5;
    return `<line x1="${x}" y1="${GRAPH_TOP}" x2="${x}" y2="${rowY(ROWS.length)}" stroke="${stroke}" stroke-width="${sw}"/>`;
  }).join('');

  const gridRowLabels = ROWS.map((label, ri) => {
    const y = rowMidY(ri) + 4;
    return `<text x="${GRAPH_LEFT - 4}" y="${y}" text-anchor="end" font-size="10" fill="#000">${esc(label)}</text>`;
  }).join('');

  const gridRowLines = ROWS.map((_, ri) => {
    const y = rowY(ri);
    return `<line x1="10" y1="${y}" x2="${GRAPH_RIGHT + 40}" y2="${y}" stroke="#000" stroke-width="0.75"/>`;
  }).join('');

  const events = (log.events || []).map((event, i) => {
    const row = statusToRow[event.status];
    if (row === undefined) return '';
    const x1 = hx(isoToH(event.start)).toFixed(1);
    const x2 = hx(isoToH(event.end, log.date)).toFixed(1);
    const y = rowMidY(row).toFixed(1);
    const prev = (log.events || [])[i - 1];
    const prevRow = prev ? statusToRow[prev.status] : null;
    const prevY = prevRow != null ? rowMidY(prevRow).toFixed(1) : null;
    let lines = `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#000" stroke-width="2.5" stroke-linecap="square"/>`;
    if (prevY != null && prevRow !== row) {
      lines += `<line x1="${x1}" y1="${prevY}" x2="${x1}" y2="${y}" stroke="#000" stroke-width="2.5" stroke-linecap="square"/>`;
    }
    return lines;
  }).join('');

  const totalsTexts = STATUS_KEYS.map((key, ri) => {
    const y = rowMidY(ri) + 4;
    return `<text x="${TOTAL_COL_X}" y="${y}" text-anchor="middle" font-size="10" font-weight="600" fill="#000">${Number(totals[key] || 0).toFixed(2)}h</text>`;
  }).join('');

  const remarks = (log.remarks || []).slice(0, 7).map((r, i) => {
    const ry = 406 + i * 14;
    return (
      `<g key="${esc(r.time)}-${i}">` +
      `<text x="12" y="${ry}" font-size="10" font-family="monospace" fill="#333">${esc(r.time)}</text>` +
      `<text x="75" y="${ry}" font-size="10" font-weight="600" fill="#000">${esc(r.location)}</text>` +
      `<text x="260" y="${ry}" font-size="10" fill="#444">${esc(r.text)}</text>` +
      `<text x="${W - 12}" y="${ry}" font-size="10" font-family="monospace" fill="#555" text-anchor="end">${F(r.odometer_miles)} mi</text>` +
      `<line x1="10" y1="${ry + 3}" x2="${W - 10}" y2="${ry + 3}" stroke="#E0E0E0" stroke-width="0.4"/>` +
      `</g>`
    );
  }).join('');

  return (
    `<svg viewBox="0 0 ${W} 580" xmlns="http://www.w3.org/2000/svg" style="width:100%;font-family:Arial,sans-serif;background:#fff">` +
    `<rect x="0" y="0" width="${W}" height="580" fill="#fff"/>` +
    `<text x="10" y="28" font-size="16" font-weight="700" fill="#000">Driver's Daily Log</text>` +
    `<text x="10" y="42" font-size="10" fill="#555">(24 hours)</text>` +
    `<line x1="280" y1="38" x2="500" y2="38" stroke="#000" stroke-width="0.8"/>` +
    `<text x="282" y="35" font-size="11" fill="#000">${esc(log.date)}</text>` +
    `<text x="282" y="46" font-size="8" fill="#888">(Month) (Day) (Year)</text>` +
    `<text x="510" y="22" font-size="8" fill="#555">Original - File at home terminal.</text>` +
    `<text x="510" y="33" font-size="8" fill="#555">Duplicate - Driver retains possession for 8 days.</text>` +
    `<text x="510" y="44" font-size="8" fill="#555">All times shown in home terminal timezone (${esc(log.timezone || 'UTC')}).</text>` +
    `<text x="10" y="65" font-size="9" fill="#666">From:</text>` +
    `<line x1="40" y1="66" x2="360" y2="66" stroke="#000" stroke-width="0.8"/>` +
    `<text x="42" y="63" font-size="11" fill="#000">${esc(log.from || '')}</text>` +
    `<text x="370" y="65" font-size="9" fill="#666">To:</text>` +
    `<line x1="388" y1="66" x2="750" y2="66" stroke="#000" stroke-width="0.8"/>` +
    `<text x="390" y="63" font-size="11" fill="#000">${esc(log.to || '')}</text>` +
    `<rect x="10" y="75" width="140" height="34" fill="none" stroke="#000" stroke-width="0.8"/>` +
    `<text x="80" y="89" font-size="13" font-weight="600" fill="#000" text-anchor="middle">${F(log.daily_miles)}</text>` +
    `<text x="80" y="103" font-size="8" fill="#777" text-anchor="middle">Total Miles Driving Today</text>` +
    `<rect x="155" y="75" width="140" height="34" fill="none" stroke="#000" stroke-width="0.8"/>` +
    `<text x="225" y="89" font-size="13" font-weight="600" fill="#000" text-anchor="middle">${F(log.total_mileage)}</text>` +
    `<text x="225" y="103" font-size="8" fill="#777" text-anchor="middle">Total Mileage Today</text>` +
    `<text x="310" y="83" font-size="9" fill="#666">Name of Carrier or Carriers</text>` +
    `<line x1="310" y1="92" x2="750" y2="92" stroke="#000" stroke-width="0.8"/>` +
    `<text x="312" y="90" font-size="11" fill="#000">${esc(log.carrier || 'OpenELD')}</text>` +
    `<text x="10" y="120" font-size="9" fill="#666">Truck/Tractor and Trailer Numbers or License Plate(s)/State</text>` +
    `<line x1="10" y1="130" x2="300" y2="130" stroke="#000" stroke-width="0.8"/>` +
    `<text x="12" y="128" font-size="11" fill="#000">${esc(log.tractor || 'TRK-1042')} / ${esc(log.trailer || 'TRL-2208')}</text>` +
    `<text x="310" y="112" font-size="9" fill="#666">Main Office Address</text>` +
    `<line x1="310" y1="121" x2="750" y2="121" stroke="#000" stroke-width="0.8"/>` +
    `<text x="312" y="119" font-size="11" fill="#000">${esc(log.main_office || '123 Dispatch Ave, Chicago, IL 60601')}</text>` +
    `<text x="310" y="135" font-size="9" fill="#666">Home Terminal Address</text>` +
    `<line x1="310" y1="144" x2="750" y2="144" stroke="#000" stroke-width="0.8"/>` +
    `<text x="312" y="142" font-size="11" fill="#000">${esc(log.home_terminal || 'Home Terminal, New York, NY 10001')}</text>` +
    hourLabels +
    `<text x="${TOTAL_COL_X}" y="${GRAPH_TOP - 12}" text-anchor="middle" font-size="8" fill="#000">TOTAL</text>` +
    `<text x="${TOTAL_COL_X}" y="${GRAPH_TOP - 4}" text-anchor="middle" font-size="8" fill="#000">HOURS</text>` +
    gridRects +
    gridLines +
    gridRowLabels +
    gridRowLines +
    `<line x1="10" y1="${rowY(ROWS.length)}" x2="${GRAPH_RIGHT + 40}" y2="${rowY(ROWS.length)}" stroke="#000" stroke-width="1"/>` +
    events +
    totalsTexts +
    `<text x="${TOTAL_COL_X}" y="${rowY(ROWS.length) + 16}" text-anchor="middle" font-size="10" font-weight="700" fill="${totalOk ? '#000' : '#CC0000'}">${grandTotal.toFixed(2)}h</text>` +
    (totalOk ? '' : `<text x="${GRAPH_RIGHT - 5}" y="${rowY(ROWS.length) + 16}" text-anchor="end" font-size="9" fill="#CC0000">Must equal 24.00h</text>`) +
    `<rect x="10" y="360" width="${W - 20}" height="20" fill="#EFEFEF" stroke="#000" stroke-width="0.8"/>` +
    `<text x="16" y="374" font-size="11" font-weight="700" fill="#000">REMARKS</text>` +
    `<text x="10" y="392" font-size="8" fill="#666" font-style="italic">Enter place reported/released and where each duty status changed. Use home terminal time standard.</text>` +
    `<line x1="10" y1="396" x2="${W - 10}" y2="396" stroke="#AAA" stroke-width="0.5"/>` +
    remarks +
    `<text x="10" y="510" font-size="9" fill="#666">Shipper &amp; Commodity / DVL or Manifest No.:</text>` +
    `<line x1="230" y1="510" x2="500" y2="510" stroke="#000" stroke-width="0.8"/>` +
    `<text x="232" y="508" font-size="10" fill="#000">${esc(log.shipping_documents || '-')}</text>` +
    `<line x1="10" y1="518" x2="${W - 10}" y2="518" stroke="#000" stroke-width="1"/>` +
    `<text x="10" y="532" font-size="9" font-weight="700" fill="#000">Recap: Complete at end of day</text>` +
    [
      { label: 'A. On-duty hours today (lines 3 & 4)', value: log.recap?.on_duty_today },
      { label: 'B. Available tomorrow', value: log.recap?.available_tomorrow },
      { label: 'C. On-duty last cycle incl. today', value: log.recap?.cycle_used },
    ].map((item, i) =>
      `<g>` +
      `<text x="${10 + i * 250}" y="548" font-size="8" fill="#555">${esc(item.label)}</text>` +
      `<rect x="${10 + i * 250}" y="551" width="60" height="16" fill="none" stroke="#000" stroke-width="0.8"/>` +
      `<text x="${10 + i * 250 + 30}" y="563" text-anchor="middle" font-size="11" font-weight="700" fill="#000">${F(item.value)}</text>` +
      `</g>`
    ).join('') +
    `<text x="10" y="578" font-size="9" font-style="italic" fill="#555">I certify that these entries are true and correct.</text>` +
    `<line x1="400" y1="575" x2="700" y2="575" stroke="#000" stroke-width="0.8"/>` +
    `<text x="402" y="573" font-size="11" font-style="italic" fill="#000">${esc(log.driver_name || 'John Doe')}</text>` +
    `<text x="550" y="578" font-size="8" fill="#888" text-anchor="middle">Driver's Signature in Full</text>` +
    `</svg>`
  );
}

function buildLog(dayData, form, tripPlan) {
  const hasTotals = dayData.totals && Object.keys(dayData.totals).length > 0;
  return {
    ...dayData,
    totals: hasTotals ? dayData.totals : {
      off_duty: dayData.hos_summary?.off_duty_hours || 0,
      sleeper: dayData.hos_summary?.sleeper_berth_hours || 0,
      driving: dayData.hos_summary?.driving_hours || 0,
      on_duty: dayData.hos_summary?.on_duty_hours || 0,
    },
    driver_name: dayData.driver_name || form?.driver_name || tripPlan?.driver_name || 'Driver',
    from: dayData.from || tripPlan?.start_location || '',
    to: dayData.to || tripPlan?.dropoff_location || '',
    daily_miles: dayData.daily_miles || dayData.hos_summary?.daily_miles || 0,
    total_mileage: dayData.total_mileage || dayData.hos_summary?.total_mileage || 0,
  };
}

function downloadLogSvg(tripPlan, log) {
  const dayData = tripPlan.daily_logs?.find((item) => item.day === log.day)
    || tripPlan.log_summaries?.find((item) => item.day === log.day)
    || log;
  if (!dayData) return;
  const logData = buildLog(dayData, tripPlan.form || { driver_name: tripPlan.driver_name }, tripPlan);
  const svg = renderLogSvg(logData);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `openeld-log-${logData.date}.svg`;
  link.click();
  URL.revokeObjectURL(url);
}

function isoToH(iso, logDate) {
  if (!iso) return 0;
  const d = new Date(iso);
  if (logDate && d.toISOString().slice(0, 10) > logDate) return 24;
  return d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600;
}

export default HistoryPage;