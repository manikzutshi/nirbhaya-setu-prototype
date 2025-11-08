'use client';

import LoginLink from "./LoginLink";
import LogoutLink from "./LogoutLink";
import UserBadge from "./UserBadge";

export default function Navbar() {
  return (
    <nav className="navbar sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex max-w-7xl items-center justify-between px-4">
        <a href="/" className="text-2xl font-semibold text-gray-900">
          Nirbhaya <span className="text-primary">Setu</span>
        </a>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-4 md:flex">
            <a href="#features" className="btn btn-ghost text-base font-medium text-gray-600 hover:bg-gray-100">Features</a>
            <a href="#impact" className="btn btn-ghost text-base font-medium text-gray-600 hover:bg-gray-100">Impact</a>
            <a href="#campus" className="btn btn-ghost text-base font-medium text-gray-600 hover:bg-gray-100">Campus Secure</a>
          </div>
          <UserBadge />
          <AuthButtons />
        </div>
      </div>
    </nav>
  );
}

function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <LoginLink />
      <LogoutLink />
    </div>
  );
}
