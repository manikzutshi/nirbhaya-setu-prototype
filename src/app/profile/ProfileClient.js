"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IdentificationCard, NotePencil, Copy, X } from '../components/PhosphorIcons';

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

  // Fetch report history from Mongo (first page)
  useEffect(() => {
    const uid = user?.sub || 'anonymous';
    fetch(`/api/profile/reports?userId=${encodeURIComponent(uid)}&page=1&pageSize=20`)
      .then((r) => r.json())
      .then((data) => setReports(data.reports || []))
      .catch(() => {})
      .finally(() => setLoadingReports(false));
  }, [user?.sub]);

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

  // Removed external blockchain explorer; show local receipt hash only.

  return (
    <div className="w-full min-h-screen bg-base-100 flex flex-col">
      {/* Sticky compact header for mobile */}
      <div className="sticky top-0 z-30 backdrop-blur bg-base-100/90 border-b border-base-300 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight">Profile</h1>
          <p className="text-[11px] text-base-content/60">Contacts & report receipts</p>
        </div>
        {user ? (
          <div className="text-[11px] text-base-content/60 truncate">
            <span className="font-medium">{user.name || user.email}</span>
          </div>
        ) : (
          <div className="text-[11px]">
            <Link href="/auth/login?returnTo=/profile" className="link link-primary">Login</Link>
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 pt-4 pb-28 space-y-6">
        {/* Contacts Section */}
        <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
          <details open className="group">
            <summary className="cursor-pointer list-none select-none px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <IdentificationCard className="w-5 h-5" />
                <h2 className="text-sm sm:text-base font-semibold">Trusted Contacts</h2>
              </div>
              <span className="text-[11px] text-base-content/50 group-open:hidden">Tap to expand</span>
              <span className="text-[11px] text-base-content/50 hidden group-open:inline">Tap to collapse</span>
            </summary>
            <div className="px-4 pb-4">
              <p className="text-[11px] text-base-content/60 mb-3">Add people you'll alert during emergencies. Stored locally.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="input input-bordered w-full text-sm"
                />
                <input
                  type="tel"
                  placeholder="Phone (+91...)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  className="input input-bordered w-full text-sm"
                />
                <button
                  onClick={addContact}
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                  <IdentificationCard className="w-4 h-4" />
                  <span className="text-sm">Add</span>
                </button>
              </div>
              <div className="space-y-2">
                {contacts.length === 0 && (
                  <div className="text-[11px] text-base-content/50 italic">No contacts yet.</div>
                )}
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="border border-base-300 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-base-400 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="text-[11px] text-base-content/60">{c.phone}</p>
                    </div>
                    <button
                      onClick={() => removeContact(c.id)}
                      className="btn btn-xs btn-ghost text-error flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </details>
        </div>

        {/* Reports Section */}
        <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
          <details className="group" open>
            <summary className="cursor-pointer list-none select-none px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <NotePencil className="w-5 h-5" />
                <h2 className="text-sm sm:text-base font-semibold">My Report History</h2>
              </div>
              <span className="text-[11px] text-base-content/50 group-open:hidden">Tap to expand</span>
              <span className="text-[11px] text-base-content/50 hidden group-open:inline">Tap to collapse</span>
            </summary>
            <div className="px-4 pb-4">
              <p className="text-[11px] text-base-content/60 mb-3">Receipts with local hash. {reports.length > 0 && <span className="font-medium">{reports.length} total</span>}</p>
              {loadingReports && (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse h-14 rounded-xl bg-base-200" />
                  ))}
                </div>
              )}
              {!loadingReports && reports.length === 0 && (
                <div className="text-[11px] text-base-content/50 italic">No reports yet.</div>
              )}
              <div className="space-y-3">
                {reports.map((r) => (
                  <div
                    key={r.id || r.hash}
                    className="border border-base-300 rounded-xl p-3 sm:p-4 flex flex-col gap-2 hover:border-base-400 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{r.summary}</p>
                        <p className="text-[11px] text-base-content/60 mt-0.5">
                          {formatTime(r.timestamp || r.createdAt)} • Hash: <span className="font-mono text-[10px]">{(r.hash || '').slice(0, 10)}…</span>
                        </p>
                      </div>
                      <button
                        onClick={() => copyHash(r.hash)}
                        className="btn btn-xs btn-ghost flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        {showHashCopied === r.hash ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </details>
        </div>

        <footer className="pt-2 pb-10 text-center text-[10px] text-base-content/50">
          <p>Profile • Mobile-first layout</p>
        </footer>
      </div>

      {/* Sticky bottom helper (mobile) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden px-4 pb-4">
        <div className="rounded-2xl bg-base-200/80 backdrop-blur border border-base-300 p-3 flex items-center justify-between gap-3">
          <div className="text-[11px] flex-1">Quick add contact</div>
          <button
            onClick={addContact}
            disabled={!name.trim() || !phone.trim()}
            className="btn btn-primary btn-sm flex items-center gap-1 disabled:opacity-40"
          >
            <IdentificationCard className="w-3 h-3" />
            Save
          </button>
        </div>
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
