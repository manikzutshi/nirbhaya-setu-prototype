"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import GMap from '../components/GMap';
import { Siren, Check, IdentificationCard, Phone, ChatsCircle, NotePencil } from '../components/PhosphorIcons';
import { useLocation } from "../components/LocationProvider";

export default function CampusSecureClient({ user }) {
  const [latePassStatus, setLatePassStatus] = useState('Approved until 22:00');
  const [applying, setApplying] = useState(false);
  const { location } = useLocation();

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
    <div className="w-full min-h-screen bg-base-100 pt-6 pb-24">
      <div className="mx-auto w-full max-w-[1100px] px-4 md:px-6 lg:grid lg:grid-cols-12 lg:gap-10">
        <header className="mb-4 lg:col-span-12">
          <h1 className="text-xl font-bold tracking-tight">Campus Secure</h1>
          <p className="text-xs text-base-content/60">Student safety & permissions</p>
        </header>
        {/* LEFT: Actions & permissions */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8">
          <Link
            href="/sos"
            className="btn btn-error btn-lg w-full text-lg shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
          >
            <Siren className="w-6 h-6" />
            <span>Emergency SOS</span>
          </Link>

          <div className="bg-success/10 border border-success/30 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center shrink-0">
                <Check className="w-7 h-7 text-success-content" />
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

          <section>
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
                  <IdentificationCard className="w-7 h-7 text-primary" />
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
                  <Phone className="w-7 h-7 text-info" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">Contact</p>
                  <p className="text-xs text-base-content/60">Warden</p>
                </div>
              </Link>
            </div>
          </section>

          <section>
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
                  <ChatsCircle className="w-7 h-7 text-primary" />
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
                  <NotePencil className="w-7 h-7 text-warning" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">Report</p>
                  <p className="text-xs text-base-content/60">Share incident</p>
                </div>
              </Link>
            </div>
          </section>
        </div>

        {/* RIGHT: Map */}
        <aside className="mt-10 lg:mt-0 lg:col-span-7 xl:col-span-8">
          <div className="mb-4">
            <h2 className="text-lg font-bold">Campus Geofence</h2>
            <p className="text-sm text-base-content/60">Safe zones & restricted areas</p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg" style={{ height: 320 }}>
            <GMap
              center={{ lat: location?.lat ?? 28.6139, lng: location?.lng ?? 77.2090 }}
              markers={location ? [{ ...location, label: 'You' }] : []}
              circles={zones.map((z) => ({ center: { lat: 28.61 + z.cy/1000, lng: 77.20 + z.cx/1000 }, radius: z.radius, color: z.color }))}
            />
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 p-3 bg-base-200 rounded-lg text-[11px]">
            <LegendDot color="#22c55e" label="Hostel" />
            <LegendDot color="#f59e0b" label="Library" />
            <LegendDot color="#ef4444" label="Restricted" />
          </div>
          <footer className="mt-10 text-center text-[10px] text-base-content/50">
            <p>Campus Secure • Student module</p>
          </footer>
        </aside>
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
