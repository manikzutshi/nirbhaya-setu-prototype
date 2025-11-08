"use client";

export default function LoginLink({ returnTo = "/dashboard" }) {
  const href = returnTo ? `/auth/login?returnTo=${encodeURIComponent(returnTo)}` : "/auth/login";
  return (
    <a href={href} className="btn btn-primary">
      Log In
    </a>
  );
}
