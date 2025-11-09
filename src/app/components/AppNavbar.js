'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0';
import LoginLink from './LoginLink';
import LogoutLink from './LogoutLink';
import UserBadge from './UserBadge';
import { useState } from 'react';

const NavLink = ({ href, label }) => {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`btn btn-ghost text-sm font-medium ${active ? 'bg-base-200' : ''}`}
    >
      {label}
    </Link>
  );
};

export default function AppNavbar() {
  const { user } = useUser();
  return (
    <nav className="sticky top-0 z-30 border-b border-base-300 bg-base-100/80 backdrop-blur">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="text-xl font-semibold">
            Nirbhaya <span className="text-primary">Setu</span>
          </Link>
          <div className="flex items-center gap-3">
            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-1">
              <NavLink href="/dashboard" label="Home" />
              <NavLink href="/community" label="Community" />
              <NavLink href="/report" label="Report" />
              <NavLink href="/campus" label="Campus" />
              <NavLink href="/profile" label="Profile" />
            </div>
            {/* Mobile shows only user + auth (routes via bottom dock) */}
            <UserBadge />
            {!user ? <LoginLink returnTo="/dashboard" /> : <LogoutLink />}
          </div>
        </div>
      </div>
    </nav>
  );
}
