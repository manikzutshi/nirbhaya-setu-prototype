"use client";
import { useUser } from "@auth0/nextjs-auth0";

export default function UserBadge() {
  const { user, isLoading } = useUser();
  if (isLoading) return <span className="loading loading-dots loading-sm" />;
  if (!user) return null;
  return (
    <div className="flex items-center gap-2">
      {user.picture && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.picture} alt={user.name} className="h-8 w-8 rounded-full" />
      )}
      <span className="text-sm font-medium">{user.name}</span>
    </div>
  );
}
