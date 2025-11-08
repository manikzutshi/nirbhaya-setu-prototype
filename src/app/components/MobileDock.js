'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Ico = ({ d, className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  home: 'M3 12 L12 3 L21 12 V21 H14 V15 H10 V21 H3 V12',
  forum: 'M3 5 H21 V15 H6 L3 18 V5',
  warn: 'M12 2 L2 22 H22 L12 2 M12 16 V12 M12 20 H12.01',
  campus: 'M4 12 L12 7 L20 12 V20 H4 V12 M8 20 V12 M16 20 V12',
  report: 'M12 2 L2 7 V17 L12 22 L22 17 V7 L12 2 M12 11 V7 M12 17 V13',
};

export default function MobileDock() {
  const pathname = usePathname();
  const tab = (href) => (pathname === href);
  // Hide dock on landing and auth pages to keep focus and avoid blocking login
  const hide = pathname === '/' || pathname?.startsWith('/auth');
  if (hide) return null;
  return (
    <div className="bg-base-100 border-t border-base-300 shadow-lg z-40 md:hidden fixed bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-end justify-around px-2 py-2 relative">
        <Link href="/" className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg hover:bg-base-200 ${tab('/') ? 'bg-base-200' : ''}`}>
          <Ico d={ICONS.home} className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </Link>
        <Link href="/community" className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg hover:bg-base-200 ${tab('/community') ? 'bg-base-200' : ''}`}>
          <Ico d={ICONS.forum} className="w-5 h-5" />
          <span className="text-[10px]">Community</span>
        </Link>
        <Link href="/sos" className="flex flex-col items-center relative -mt-6">
          <div className={`w-16 h-16 rounded-full bg-error shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${tab('/sos') ? 'ring-4 ring-error ring-offset-2' : ''}`}>
            <Ico d={ICONS.warn} className="w-7 h-7 text-error-content" />
          </div>
          <span className="text-[10px] mt-1 text-error font-semibold">SOS</span>
        </Link>
        <Link href="/campus" className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg hover:bg-base-200 ${tab('/campus') ? 'bg-base-200' : ''}`}>
          <Ico d={ICONS.campus} className="w-5 h-5" />
          <span className="text-[10px]">Campus</span>
        </Link>
        <Link href="/report" className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg hover:bg-base-200 ${tab('/report') ? 'bg-base-200' : ''}`}>
          <Ico d={ICONS.report} className="w-5 h-5" />
          <span className="text-[10px]">Report</span>
        </Link>
      </div>
    </div>
  );
}
