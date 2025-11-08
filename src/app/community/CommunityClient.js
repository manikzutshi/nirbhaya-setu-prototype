"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import GMap from '../components/GMap';

const Icon = ({ path, className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const ICONS = {
  add: 'M12 5 V19 M5 12 H19',
  warn: 'M12 2 L2 22 H22 L12 2 M12 16 V12 M12 20 H12.01',
  location: 'M12 2 C8 2 5 5 5 9 C5 14.25 12 22 12 22 C12 22 19 14.25 19 9 C19 5 16 2 12 2 Z M12 12 A3 3 0 1 1 12 6 A3 3 0 0 1 12 12 Z',
  thumbUp: 'M14 9 V5 A3 3 0 0 0 11 2 L7 11 V20 H17 L20 11 V9 H14',
  thumbDown: 'M10 15 V19 A3 3 0 0 1 13 22 L17 13 V4 H7 L4 13 V15 H10',
  close: 'M6 6 L18 18 M6 18 L18 6',
};

export default function CommunityClient() {
  // State
  const [feedbackList, setFeedbackList] = useState([
    {
      id: 1,
      location: [28.615, 77.205],
      user: 'Priya S.',
      comment: 'Well-lit area, feels safe even at night',
      timestamp: '2 hours ago',
      likes: 12,
      dislikes: 1,
      userVote: null,
    },
    {
      id: 2,
      location: [28.612, 77.215],
      user: 'Anonymous',
      comment: 'Crowded market, be careful with belongings',
      timestamp: '5 hours ago',
      likes: 8,
      dislikes: 2,
      userVote: null,
    },
    {
      id: 3,
      location: [28.607, 77.208],
      user: 'Kavya M.',
      comment: 'Dark alley, avoid after 8 PM',
      timestamp: '1 day ago',
      likes: 24,
      dislikes: 0,
      userVote: null,
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [location, setLocation] = useState(null);
  const center = location || { lat: 28.6129, lng: 77.2089 }; // fallback coords

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation(null),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  const circles = feedbackList.map((f) => ({
    center: { lat: f.location[0], lng: f.location[1] },
    radius: 60,
    color: f.likes > f.dislikes * 2 ? '#22c55e' : f.dislikes > f.likes ? '#ef4444' : '#f59e0b',
  }));

  function handleVote(id, type) {
    setFeedbackList((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        let { likes, dislikes, userVote } = f;
        if (userVote === 'like') likes--;
        if (userVote === 'dislike') dislikes--;
        if (userVote === type) {
          userVote = null; // toggle off
        } else {
          userVote = type;
          if (type === 'like') likes++;
          if (type === 'dislike') dislikes++;
        }
        return { ...f, likes, dislikes, userVote };
      })
    );
  }

  function addFeedback() {
    if (!newComment.trim()) return;
    const loc = selectedLocation || [center.lat, center.lng];
    const entry = {
      id: Date.now(),
      location: loc,
      user: 'You',
      comment: newComment,
      timestamp: 'Just now',
      likes: 0,
      dislikes: 0,
      userVote: null,
    };
    setFeedbackList((prev) => [entry, ...prev]);
    setNewComment('');
    setShowAddForm(false);
    setSelectedLocation(null);
  }

  return (
    <div className="w-full min-h-screen bg-base-100 pt-4 pb-24">
      <div className="mx-auto w-full max-w-[1100px] px-3 md:px-6 lg:grid lg:grid-cols-12 lg:gap-10">
        {/* LEFT COLUMN */}
  <div className="lg:col-span-7 xl:col-span-8">
          <header className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Share Your Experience</h1>
            <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-base-content/70">
              Contribute real observations so others can make safer decisions.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <button
                className="btn btn-primary shadow-md flex items-center gap-2"
                onClick={() => {
                  setSelectedLocation([center.lat, center.lng]);
                  setShowAddForm(true);
                }}
              >
                <Icon path={ICONS.add} className="w-5 h-5" /> Add Feedback
              </button>
              <Link href="/sos" className="btn btn-ghost btn-sm text-error flex items-center gap-2">
                <Icon path={ICONS.warn} className="w-4 h-4" /> SOS
              </Link>
            </div>
          </header>

          {showAddForm && (
            <div className="mb-8 bg-base-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base">Add Your Feedback</h3>
                <button
                  className="btn btn-circle btn-ghost btn-xs"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewComment('');
                  }}
                >
                  <Icon path={ICONS.close} className="w-4 h-4" />
                </button>
              </div>
              <textarea
                className="textarea textarea-bordered w-full h-28 resize-none text-sm"
                placeholder="What should others know about this area?"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex gap-2 mt-4">
                <button
                  className="btn btn-ghost flex-1"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewComment('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary flex-1 shadow-md"
                  onClick={addFeedback}
                  disabled={!newComment.trim()}
                >
                  Post
                </button>
              </div>
            </div>
          )}

          <section>
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">Community Reports</h2>
                <p className="text-xs text-base-content/60 mt-0.5">
                  {feedbackList.length} {feedbackList.length === 1 ? 'report' : 'reports'} nearby
                </p>
              </div>
            </div>
      <div className="space-y-4">
              {feedbackList.map((f) => (
        <article key={f.id} className="bg-base-100 border border-base-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="avatar placeholder shrink-0">
                      <div className="bg-primary/10 text-primary rounded-full w-10 flex items-center justify-center">
                        <span className="text-sm font-bold">{f.user[0]}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{f.user}</p>
                      <p className="text-[10px] text-base-content/50">{f.timestamp}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed mb-4 pl-[52px] max-w-[50ch] md:max-w-[60ch]">{f.comment}</p>
                  <div className="flex items-center gap-2 mb-4 pl-[52px]">
                    <Icon path={ICONS.location} className="w-4 h-4 text-base-content/40" />
                    <span className="text-[10px] text-base-content/50 font-mono">
                      {f.location[0].toFixed(4)}, {f.location[1].toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pl-[52px]">
                    <button
                      onClick={() => handleVote(f.id, 'like')}
                      className={`btn btn-xs gap-1.5 flex-1 ${f.userVote === 'like' ? 'btn-success' : 'btn-ghost'}`}
                    >
                      <Icon path={ICONS.thumbUp} className="w-4 h-4" />
                      <span className="font-semibold text-[11px]">{f.likes}</span>
                    </button>
                    <button
                      onClick={() => handleVote(f.id, 'dislike')}
                      className={`btn btn-xs gap-1.5 flex-1 ${f.userVote === 'dislike' ? 'btn-error' : 'btn-ghost'}`}
                    >
                      <Icon path={ICONS.thumbDown} className="w-4 h-4" />
                      <span className="font-semibold text-[11px]">{f.dislikes}</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <footer className="mt-12 text-center text-[10px] text-base-content/50">
            <p>Community module • Shared safety intelligence</p>
          </footer>
        </div>

        {/* RIGHT COLUMN (Map & context) */}
        <aside className="mt-8 lg:mt-0 lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="rounded-xl overflow-hidden shadow border border-base-300 bg-base-100" style={{ height: 240 }}>
            <GMap
              center={center}
              zoom={14}
              markers={location ? [{ ...center, label: 'You' }] : []}
              circles={circles}
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px]">
            <LegendDot color="#22c55e" label="Safe" />
            <LegendDot color="#f59e0b" label="Caution" />
            <LegendDot color="#ef4444" label="Unsafe" />
          </div>
          <div className="bg-error/10 border border-error/20 rounded-lg p-3 flex items-start gap-3">
            <Icon path={ICONS.warn} className="w-5 h-5 text-error" />
            <span className="text-xs text-base-content/80 leading-relaxed max-w-[42ch]">
              In danger? <Link href="/sos" className="font-bold text-error hover:underline">Trigger SOS</Link> to alert contacts & authorities.
            </span>
          </div>
          <div className="bg-base-200 rounded-xl p-3 text-xs text-base-content/70 leading-relaxed space-y-2">
            <p className="font-semibold text-base-content">Tips for helpful feedback:</p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Describe lighting & crowd density.</li>
              <li>Note specific recurring issues.</li>
              <li>Keep tone factual & concise.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="font-medium" style={{ fontSize: '10px' }}>{label}</span>
    </div>
  );
}
