'use client';

import { useEffect, useState } from 'react';

export default function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (!show || !deferred) return null;
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-base-200 border border-base-300 shadow-lg rounded-xl p-3 z-50 w-[92%] max-w-sm">
      <div className="text-sm font-semibold mb-2">Install Nirbhaya Setu?</div>
      <div className="flex gap-2 justify-end">
        <button className="btn btn-sm" onClick={() => setShow(false)}>Later</button>
        <button className="btn btn-primary btn-sm" onClick={async () => {
          const e = deferred; setDeferred(null); setShow(false);
          try { await e.prompt(); await e.userChoice; } catch {}
        }}>Install</button>
      </div>
    </div>
  );
}
