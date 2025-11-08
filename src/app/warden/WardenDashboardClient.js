"use client";
import { useEffect, useState, useRef } from 'react';

// Inline icons via SVG paths (no external font load)
const Icon = ({ path, className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const ICONS = {
  sos: 'M12 2 L19 21 H5 L12 2',
  alert: 'M12 2 L2 22 H22 L12 2 M12 16 V12 M12 20 H12.01',
  check: 'M20 6 L9 17 L4 12',
  deny: 'M18 6 L6 18 M6 6 L18 18',
  clock: 'M12 2 A10 10 0 1 0 12 22 A10 10 0 1 0 12 2 M12 6 V12 L16 14',
  zone: 'M3 12 A9 9 0 1 0 21 12 A9 9 0 1 0 3 12',
  pass: 'M4 4 H20 V20 H4 V4 M8 8 H16',
};

export default function WardenDashboardClient({ user }) {
  const [sosAlerts, setSosAlerts] = useState([]);
  const [breachAlerts, setBreachAlerts] = useState([]);
  const [latePassRequests, setLatePassRequests] = useState([]);
  const [loadingPasses, setLoadingPasses] = useState(true);
  const sosTimer = useRef(null);
  const breachTimer = useRef(null);

  // Initial fetch of pending passes
  useEffect(() => {
    let active = true;
    fetch('/api/warden/passes')
      .then((r) => r.json())
      .then((data) => {
        if (active) setLatePassRequests(data.pending || []);
      })
      .catch(() => {})
      .finally(() => active && setLoadingPasses(false));
    return () => {
      active = false;
    };
  }, []);

  // Simulate incoming SOS alerts periodically
  useEffect(() => {
    sosTimer.current = setInterval(() => {
      setSosAlerts((prev) => [
        {
          id: crypto.randomUUID(),
          student: randomName(),
          time: new Date().toISOString(),
          location: randomLocation(),
          status: 'OPEN',
        },
        ...prev,
      ]);
    }, 10000); // every 10s
    return () => clearInterval(sosTimer.current);
  }, []);

  // Simulate geofence breach alerts
  useEffect(() => {
    breachTimer.current = setInterval(() => {
      if (Math.random() < 0.5) {
        setBreachAlerts((prev) => [
          {
            id: crypto.randomUUID(),
            student: randomName(),
            zone: 'Restricted Area',
            time: new Date().toISOString(),
            severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          },
          ...prev,
        ]);
      }
    }, 15000); // every 15s potential
    return () => clearInterval(breachTimer.current);
  }, []);

  const updatePass = (id, action) => {
    setLatePassRequests((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: action === 'approve' ? 'APPROVED' : 'DENIED' } : p))
    );
    // Fire-and-forget to stub API
    fetch('/api/warden/passes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, action }),
    }).catch(() => {});
  };

  return (
    <div className="w-full min-h-screen bg-base-100 pt-6 pb-24">
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 lg:grid lg:grid-cols-12 lg:gap-10">
        <header className="mb-6 lg:col-span-12">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Icon path={ICONS.alert} className="w-7 h-7" /> Warden Dashboard
          </h1>
          <p className="text-xs text-base-content/60">Monitoring live student safety signals</p>
        </header>
        {/* LEFT: Alerts */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-10">
          <section>
            <SectionHeader title="Live SOS Alerts" subtitle="Latest emergency requests" icon={<Icon path={ICONS.sos} className="w-5 h-5" />} />
            <div className="space-y-3">
              {sosAlerts.length === 0 && <EmptyState text="No SOS alerts yet" />}
              {sosAlerts.map((a) => (
                <div key={a.id} className="border border-error/30 bg-error/10 rounded-lg p-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{a.student} • <span className="font-normal">{formatTime(a.time)}</span></p>
                    <p className="text-xs text-base-content/70">Location: {a.location}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-error text-error-content">{a.status}</span>
                </div>
              ))}
            </div>
          </section>
          <section>
            <SectionHeader title="Geofence Breaches" subtitle="Restricted zone entries" icon={<Icon path={ICONS.zone} className="w-5 h-5" />} />
            <div className="space-y-3">
              {breachAlerts.length === 0 && <EmptyState text="No breaches detected" />}
              {breachAlerts.map((b) => (
                <div key={b.id} className="border border-warning/30 bg-warning/10 rounded-lg p-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{b.student} • <span className="font-normal">{formatTime(b.time)}</span></p>
                    <p className="text-xs text-base-content/70">Zone: {b.zone}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${severityClass(b.severity)}`}>{b.severity.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT: Pass requests */}
        <aside className="mt-10 lg:mt-0 lg:col-span-5 xl:col-span-4">
          <section>
            <SectionHeader title="Late Pass Requests" subtitle="Approve or deny" icon={<Icon path={ICONS.pass} className="w-5 h-5" />} />
            {loadingPasses && <div className="text-xs text-base-content/50">Loading...</div>}
            <div className="space-y-3 mt-2">
              {!loadingPasses && latePassRequests.length === 0 && <EmptyState text="No pending requests" />}
              {latePassRequests.map((p) => (
                <div key={p.id} className="border rounded-lg p-3 bg-base-100 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.student}</p>
                    <p className="text-xs text-base-content/70">Requested until {p.until} • {formatTime(p.created)}</p>
                    {p.reason && <p className="text-[11px] text-base-content/60 mt-0.5">{p.reason}</p>}
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    {p.status === 'PENDING' ? (
                      <>
                        <button onClick={() => updatePass(p.id, 'approve')} className="btn btn-xs btn-success flex items-center gap-1">
                          <Icon path={ICONS.check} className="w-3 h-3" /> Approve
                        </button>
                        <button onClick={() => updatePass(p.id, 'deny')} className="btn btn-xs btn-error flex items-center gap-1">
                          <Icon path={ICONS.deny} className="w-3 h-3" /> Deny
                        </button>
                      </>
                    ) : (
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${p.status === 'APPROVED' ? 'bg-success text-success-content' : 'bg-error text-error-content'}`}>{p.status}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <footer className="mt-10 text-center text-[10px] text-base-content/50">
            <p>Warden module • Operational view</p>
          </footer>
        </aside>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, icon }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold flex items-center gap-2">{icon} {title}</h2>
        <p className="text-xs text-base-content/60">{subtitle}</p>
      </div>
      <span className="text-[10px] text-base-content/50 font-medium tracking-wide">LIVE</span>
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="text-xs text-base-content/50 italic">{text}</div>; }

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return ts;
  }
}

function severityClass(s) {
  switch (s) {
    case 'high':
      return 'bg-error text-error-content';
    case 'medium':
      return 'bg-warning text-warning-content';
    default:
      return 'bg-info text-info-content';
  }
}

function randomName() {
  const first = ['Aarav', 'Priya', 'Rohan', 'Nisha', 'Kunal', 'Isha'];
  const last = ['S.', 'K.', 'T.', 'V.', 'M.', 'P.'];
  return first[Math.floor(Math.random() * first.length)] + ' ' + last[Math.floor(Math.random() * last.length)];
}

function randomLocation() {
  const spots = ['North Gate', 'Central Lawn', 'Hostel A', 'Library', 'Cafeteria'];
  return spots[Math.floor(Math.random() * spots.length)];
}
