"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import CampusMap from './CampusMap';

// Simple SVG icon helpers (keep inline to avoid external font loads)
const Icon = ({ path, className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const icons = {
  sos: 'M12 2 L19 21 H5 L12 2',
  check: 'M20 6 L9 17 L4 12',
  add: 'M12 5 V19 M5 12 H19',
  phone: 'M3 5 C3 4 4 3 5 3 H8 L10 7 L8.5 8.5 C9.5 10.5 11.5 12.5 13.5 13.5 L15 12 L19 14 V19 C19 20 18 21 17 21 C9.82 20.93 3.07 14.18 3 7 C3 6 3 5 3 5 Z',
  forum: 'M3 5 H21 V15 H6 L3 18 V5',
  report: 'M12 2 L2 7 V17 L12 22 L22 17 V7 L12 2 M12 11 V7 M12 17 V13',
};

export default function CampusSecureClient({ user }) {
  const [latePassStatus, setLatePassStatus] = useState('Approved until 22:00');
  const [applying, setApplying] = useState(false);
  const [location, setLocation] = useState(null);

  // Grab user geolocation (best-effort)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation(null),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Mock campus zones (approximate lat/lng around a sample campus center)
  const zones = [
    { label: 'Hostel Zone', color: '#22c55e', radius: 110, cx: 38, cy: 120 },
    { label: 'Library (Closes 21:00)', color: '#f59e0b', radius: 80, cx: 150, cy: 70 },
    { label: 'Restricted Area', color: '#ef4444', radius: 60, cx: 220, cy: 160 },
  ];

  const startApplyFlow = () => {
    setApplying(true);
    setTimeout(() => {
      setLatePassStatus('Pending review');
      setApplying(false);
    }, 1500);
  };

  return (
    <div className="w-full min-h-screen bg-base-100 px-4 pt-6 pb-10">
      <div className="mx-auto max-w-md">
        <header className="mb-4">
          <h1 className="text-xl font-bold tracking-tight">Campus Secure</h1>
          <p className="text-xs text-base-content/60">Student safety & permissions</p>
        </header>

        {/* SOS Button */}
        <Link
          href="/sos"
          className="btn btn-error btn-lg w-full my-5 text-lg shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
        >
          <Icon path={icons.sos} className="w-6 h-6" />
          <span>Emergency SOS to Warden</span>
        </Link>

        {/* Status Card */}
        <div className="bg-success/10 border border-success/30 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center shrink-0">
              <Icon path={icons.check} className="w-7 h-7 text-success-content" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold mb-1">Current Status</h3>
              {latePassStatus ? (
                <p className="text-sm text-base-content/80">
                  Late Pass: <span className="font-bold text-success">{latePassStatus}</span>
                </p>
              ) : (
                <p className="text-sm text-base-content/60">No active permissions</p>
              )}
            </div>
          </div>
        </div>

        {/* Geofence Map */}
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-bold">Campus Geofence</h2>
            <p className="text-sm text-base-content/60">Safe zones & restricted areas</p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg" style={{ height: 260 }}>
            <CampusMap zones={zones} location={location} />
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 p-3 bg-base-200 rounded-lg">
            <LegendDot color="#22c55e" label="Hostel" />
            <LegendDot color="#f59e0b" label="Library" />
            <LegendDot color="#ef4444" label="Restricted" />
          </div>
        </section>

        {/* Permissions */}
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-bold">Permissions</h2>
            <p className="text-sm text-base-content/60">Manage campus access</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              disabled={applying}
              onClick={startApplyFlow}
              className="bg-base-100 border border-base-300 rounded-xl p-4 hover:shadow-md hover:border-primary/40 disabled:opacity-60 transition flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon path={icons.add} className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">Apply</p>
                <p className="text-xs text-base-content/60">Late pass</p>
              </div>
            </button>
            <Link
              href="tel:+10000000000"
              className="bg-base-100 border border-base-300 rounded-xl p-4 hover:shadow-md hover:border-primary/40 transition flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center">
                <Icon path={icons.phone} className="w-7 h-7 text-info" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">Contact</p>
                <p className="text-xs text-base-content/60">Warden</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Safety Tools */}
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-bold">Safety Tools</h2>
            <p className="text-sm text-base-content/60">Report & share info</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/community"
              className="bg-base-100 border border-base-300 rounded-xl p-4 hover:shadow-md hover:border-primary/40 transition flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon path={icons.forum} className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">Community</p>
                <p className="text-xs text-base-content/60">Safety reports</p>
              </div>
            </Link>
            <Link
              href="/report"
              className="bg-base-100 border border-base-300 rounded-xl p-4 hover:shadow-md hover:border-primary/40 transition flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Icon path={icons.report} className="w-7 h-7 text-warning" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">Report</p>
                <p className="text-xs text-base-content/60">Share incident</p>
              </div>
            </Link>
          </div>
        </section>

        <footer className="mt-10 text-center text-[10px] text-base-content/50">
          <p>Campus Secure • Student module</p>
        </footer>
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
