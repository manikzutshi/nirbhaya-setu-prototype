"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

// Simple inline icon component
const Icon = ({ path, className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const ICONS = {
  contact: 'M4 4 H20 V20 H4 V4 M8 8 H16 M8 12 H14',
  add: 'M12 5 V19 M5 12 H19',
  delete: 'M3 6 H21 M8 6 V4 H16 V6 M10 11 V17 M14 11 V17 M5 6 L7 20 H17 L19 6',
  report: 'M12 2 L2 7 V17 L12 22 L22 17 V7 L12 2 M12 11 V7 M12 17 V13',
  chain: 'M9 12 A3 3 0 0 1 12 9 L15 6 A3 3 0 0 1 19 10 L16 13 A3 3 0 0 1 13 16 M15 12 A3 3 0 0 1 12 15 L9 18 A3 3 0 0 1 5 14 L8 11 A3 3 0 0 1 11 8',
  copy: 'M8 8 H16 V16 H8 V8 M4 4 H12 V6 H6 V14 H4 V4',
};

export default function ProfileClient({ user }) {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [showHashCopied, setShowHashCopied] = useState(null);

  // Load contacts from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('trustedContacts');
      if (raw) setContacts(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('trustedContacts', JSON.stringify(contacts));
    } catch {}
  }, [contacts]);

  // Fetch mock report history
  useEffect(() => {
    fetch('/api/profile/reports')
      .then((r) => r.json())
      .then((data) => setReports(data.reports || []))
      .catch(() => {})
      .finally(() => setLoadingReports(false));
  }, []);

  const addContact = () => {
    if (!name.trim() || !phone.trim()) return;
    const entry = { id: crypto.randomUUID(), name: name.trim(), phone: phone.trim() };
    setContacts((prev) => [entry, ...prev]);
    setName('');
    setPhone('');
  };

  const removeContact = (id) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const copyHash = (hash) => {
    navigator.clipboard.writeText(hash).then(() => {
      setShowHashCopied(hash);
      setTimeout(() => setShowHashCopied(null), 1500);
    });
  };

  const explorerBase = 'https://explorer.solana.com/tx/';
  const cluster = 'devnet';

  return (
    <div className="w-full min-h-screen bg-base-100 px-4 pt-6 pb-20">
      <div className="mx-auto max-w-md">
        <header className="mb-6">
          <h1 className="text-xl font-bold tracking-tight">Profile & Contacts</h1>
          <p className="text-xs text-base-content/60">Manage trusted safety contacts & view report receipts</p>
          {user ? (
            <p className="mt-2 text-sm text-base-content/70">Signed in as <span className="font-medium">{user.name || user.email}</span></p>
          ) : (
            <p className="mt-2 text-sm">You are not signed in. <Link href="/auth/login?returnTo=/profile" className="link link-primary">Login</Link> to personalize.</p>
          )}
        </header>

        {/* Trusted Contacts Section */}
    <section className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <Icon path={ICONS.contact} className="w-5 h-5" />
            <h2 className="text-lg font-bold">Trusted Contacts</h2>
          </div>
          <p className="text-xs text-base-content/60 mb-3">Numbers used for future AWS SNS safety alerts.</p>
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
        className="input input-bordered w-full"
            />
            <input
              type="tel"
              placeholder="Phone (+91...)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
        className="input input-bordered w-full"
            />
            <button onClick={addContact} className="btn btn-primary sm:w-auto w-full flex items-center gap-1">
              <Icon path={ICONS.add} className="w-4 h-4" /> Add
            </button>
          </div>
      <div className="space-y-2">
            {contacts.length === 0 && (
              <div className="text-xs text-base-content/50 italic">No contacts added yet.</div>
            )}
            {contacts.map((c) => (
        <div key={c.id} className="bg-base-100 border border-base-300 rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{c.name}</p>
                  <p className="text-xs text-base-content/60">{c.phone}</p>
                </div>
                <button onClick={() => removeContact(c.id)} className="btn btn-xs btn-ghost text-error flex items-center gap-1">
                  <Icon path={ICONS.delete} className="w-4 h-4" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Report History Section */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Icon path={ICONS.report} className="w-5 h-5" />
            <h2 className="text-lg font-bold">My Report History</h2>
          </div>
          <p className="text-xs text-base-content/60 mb-3">Immutable blockchain receipts (Solana devnet) showcase trust.</p>
          {loadingReports && <div className="text-xs text-base-content/50">Loading reports...</div>}
      <div className="space-y-3">
            {!loadingReports && reports.length === 0 && (
              <div className="text-xs text-base-content/50 italic">No reports yet.</div>
            )}
            {reports.map((r) => (
        <div key={r.id} className="bg-base-100 border border-base-300 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{r.summary}</p>
                    <p className="text-[11px] text-base-content/60 mt-0.5">{formatTime(r.timestamp)} • Hash: <span className="font-mono text-[10px]">{r.hash.slice(0, 10)}…</span></p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Link
                      href={`${explorerBase}${r.txSignature}?cluster=${cluster}`}
                      target="_blank"
                      className="btn btn-xs btn-outline flex items-center gap-1"
                    >
                      <Icon path={ICONS.chain} className="w-3 h-3" /> Receipt
                    </Link>
                    <button
                      onClick={() => copyHash(r.hash)}
                      className="btn btn-xs btn-ghost flex items-center gap-1"
                    >
                      <Icon path={ICONS.copy} className="w-3 h-3" />
                      {showHashCopied === r.hash ? 'Copied!' : 'Copy hash'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-10 text-center text-[10px] text-base-content/50">
          <p>Profile module • Trusted contacts & blockchain receipts</p>
        </footer>
      </div>
    </div>
  );
}

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
  } catch {
    return ts;
  }
}
