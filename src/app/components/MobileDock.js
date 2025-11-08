'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, ChatsCircle, Siren, GraduationCap, NotePencil } from './PhosphorIcons';

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
          <House size={20} className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </Link>
        <Link href="/community" className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg hover:bg-base-200 ${tab('/community') ? 'bg-base-200' : ''}`}>
          <ChatsCircle size={20} className="w-5 h-5" />
          <span className="text-[10px]">Community</span>
        </Link>
        <Link href="/sos" className="flex flex-col items-center relative -mt-6">
          <div className={`w-16 h-16 rounded-full bg-error shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${tab('/sos') ? 'ring-4 ring-error ring-offset-2' : ''}`}>
            <Siren size={28} className="w-7 h-7 text-error-content" />
          </div>
          <span className="text-[10px] mt-1 text-error font-semibold">SOS</span>
        </Link>
        <Link href="/campus" className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg hover:bg-base-200 ${tab('/campus') ? 'bg-base-200' : ''}`}>
          <GraduationCap size={20} className="w-5 h-5" />
          <span className="text-[10px]">Campus</span>
        </Link>
        <Link href="/report" className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg hover:bg-base-200 ${tab('/report') ? 'bg-base-200' : ''}`}>
          <NotePencil size={20} className="w-5 h-5" />
          <span className="text-[10px]">Report</span>
        </Link>
      </div>
    </div>
  );
}
