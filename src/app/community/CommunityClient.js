"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import GMap from '../components/GMap';
import { MapPin, ThumbsUp, ThumbsDown, X, ChatsCircle, Siren } from '../components/PhosphorIcons';
import { useLocation } from "../components/LocationProvider";

export default function CommunityClient() {
  // State
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [highlightedId, setHighlightedId] = useState(null);
  const { location } = useLocation();
  const center = location || { lat: 28.6129, lng: 77.2089 }; // fallback coords

  const circles = feedbackList.map((f) => ({
    center: { lat: f.location[0], lng: f.location[1] },
    radius: 90,
    color: f.likes > f.dislikes * 2 ? '#22c55e' : f.dislikes > f.likes ? '#ef4444' : '#f59e0b',
  }));

  const feedbackMarkers = feedbackList.map((f, idx) => ({
    lat: f.location[0],
    lng: f.location[1],
    label: String((idx + 1) % 100), // simple index label
    title: `${f.location[0].toFixed(5)}, ${f.location[1].toFixed(5)}`,
  }));

  const commentLabels = feedbackList.map((f) => ({
    id: f._id,
    lat: f.location[0],
    lng: f.location[1],
    text: f.comment,
    color: f.likes > f.dislikes * 2 ? '#22c55e' : f.dislikes > f.likes ? '#ef4444' : '#f59e0b',
  }));

  function handleMarkerClick(id) {
    setHighlightedId(id);
    // Scroll to the item in the side list
    setTimeout(() => {
      const element = document.getElementById(`feedback-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  async function handleVote(id, type) {
    // determine action based on current state
    const target = feedbackList.find(f => f._id === id);
    const current = target?.userVote;
    const action = current === type ? (type === 'like' ? 'unlike' : 'undislike') : type;
    // optimistic update
    setFeedbackList(prev => prev.map(f => {
      if (f._id !== id) return f;
      let { likes, dislikes, userVote } = f;
      if (userVote === 'like') likes--;
      if (userVote === 'dislike') dislikes--;
      if (current === type) {
        userVote = null;
      } else {
        userVote = type;
        if (type === 'like') likes++;
        if (type === 'dislike') dislikes++;
      }
      return { ...f, likes, dislikes, userVote };
    }));
    try {
      await fetch('/api/community/feedback', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) });
    } catch {/* ignore */}
  }

  async function addFeedback() {
    if (!newComment.trim()) return;
    const loc = selectedLocation || [center.lat, center.lng];
    try {
      const res = await fetch('/api/community/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment: newComment.trim(), location: loc, displayName }) });
      if (res.ok) {
        localStorage.setItem('communityDisplayName', displayName);
        await loadFeedback();
        setNewComment('');
        setShowAddForm(false);
        setSelectedLocation(null);
      }
    } catch {/* ignore */}
  }

  function displayNameFromUserId(_userId) {
    return 'Anonymous';
  }

  async function loadFeedback() {
    setLoading(true);
    try {
      const lat = center.lat; const lng = center.lng;
      const res = await fetch(`/api/community/feedback?lat=${lat}&lng=${lng}&radius=2500`);
      const data = await res.json();
      if (Array.isArray(data.feedback)) {
        const seen = new Set();
        const list = [];
        for (const f of data.feedback) {
          if (!f || !f._id) continue;
          const key = String(f._id);
          if (seen.has(key)) continue;
          seen.add(key);
          list.push({
            ...f,
            user: f.displayName || 'Anonymous',
            userVote: null,
            timestamp: formatAgo(f.createdAt)
          });
        }
        setFeedbackList(list);
      }
    } catch {/* ignore */}
    setLoading(false);
  }

  useEffect(() => {
    // Load persisted name
    const saved = localStorage.getItem('communityDisplayName');
    if (saved) setDisplayName(saved);
    loadFeedback();
  }, [center.lat, center.lng]);

  function formatAgo(ts) {
    try {
      const d = new Date(ts);
      const diff = Date.now() - d.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${mins || 1}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    } catch { return 'Just now'; }
  }

  return (
    <div className="w-full min-h-screen bg-base-100 pt-4 pb-24">
      <div className="mx-auto w-full max-w-[1300px] px-3 md:px-6 lg:grid lg:grid-cols-12 lg:gap-8">
        {/* LEFT COLUMN (MAP BIGGER) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
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
                <ChatsCircle className="w-5 h-5" /> Add Feedback
              </button>
              <Link href="/sos" className="btn btn-ghost btn-sm text-error flex items-center gap-2">
                <Siren className="w-4 h-4" /> SOS
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
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                className="input input-bordered w-full mb-3 text-sm"
                placeholder="Display name (optional)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={40}
              />
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

          {/* Large Map */}
          <div className="rounded-xl overflow-hidden shadow border border-base-300 bg-base-100 relative" style={{ height: 520 }}>
            <GMap
              center={center}
              zoom={14}
              markers={[...(location ? [{ ...center, label: 'You' }] : []), ...feedbackMarkers]}
              circles={circles}
              commentLabels={commentLabels}
              onCommentVote={(id, type) => handleVote(id, type)}
              onMarkerClick={(markerIdx) => {
                // markerIdx includes "You" marker, so adjust
                const feedbackIdx = location ? markerIdx - 1 : markerIdx;
                if (feedbackIdx >= 0 && feedbackIdx < feedbackList.length) {
                  handleMarkerClick(feedbackList[feedbackIdx]._id);
                }
              }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px]">
            <LegendDot color="#22c55e" label="Safe" />
            <LegendDot color="#f59e0b" label="Caution" />
            <LegendDot color="#ef4444" label="Unsafe" />
          </div>
          <div className="bg-error/10 border border-error/20 rounded-lg p-3 flex items-start gap-3">
            <Siren className="w-5 h-5 text-error" />
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
        </div>

        {/* RIGHT COLUMN (Messages List) */}
        <aside className="mt-10 lg:mt-0 lg:col-span-4 xl:col-span-3 space-y-6">
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">Community Reports</h2>
                <p className="text-xs text-base-content/60 mt-0.5">
                  {feedbackList.length} {feedbackList.length === 1 ? 'report' : 'reports'} nearby
                </p>
              </div>
            </div>
            <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
              {loading && <div className="text-xs text-base-content/50">Loading feedback...</div>}
              {!loading && feedbackList.length === 0 && <div className="text-xs text-base-content/50 italic">No feedback yet.</div>}
              {feedbackList.map((f) => (
                <article 
                  key={f._id} 
                  id={`feedback-${f._id}`}
                  className={`bg-base-100 border rounded-xl p-4 shadow-sm hover:shadow-md transition-all ${
                    highlightedId === f._id ? 'border-primary border-2 ring-2 ring-primary/20' : 'border-base-300'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="avatar placeholder shrink-0">
                      <div className="bg-primary/10 text-primary rounded-full w-9 flex items-center justify-center">
                        <span className="text-xs font-bold">{f.user[0]}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs leading-tight">{f.user}</p>
                      <p className="text-[10px] text-base-content/50">{f.timestamp}</p>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed mb-3 pl-11">{f.comment}</p>
                  <div className="flex items-center gap-2 mb-3 pl-11">
                    <MapPin className="w-3.5 h-3.5 text-base-content/40" />
                    <span className="text-[10px] text-base-content/50 font-mono">
                      {f.location[0].toFixed(4)}, {f.location[1].toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pl-11">
                    <button
                      onClick={() => handleVote(f._id, 'like')}
                      className={`btn btn-2xs gap-1.5 flex-1 ${f.userVote === 'like' ? 'btn-success' : 'btn-ghost'}`}
                      style={{ height: '28px', minHeight: '28px' }}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span className="font-semibold text-[10px]">{f.likes}</span>
                    </button>
                    <button
                      onClick={() => handleVote(f._id, 'dislike')}
                      className={`btn btn-2xs gap-1.5 flex-1 ${f.userVote === 'dislike' ? 'btn-error' : 'btn-ghost'}`}
                      style={{ height: '28px', minHeight: '28px' }}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span className="font-semibold text-[10px]">{f.dislikes}</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <footer className="text-center text-[10px] text-base-content/50">
            <p>Community module • Shared safety intelligence</p>
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
      <span className="font-medium" style={{ fontSize: '10px' }}>{label}</span>
    </div>
  );
}
