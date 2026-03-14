"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../../convex/_generated/api";
import { GlassPanel } from "@/components/GlassPanel";
import { PageTransition } from "@/components/PageTransition";
import { getInitials } from "@/lib/formatters";
import { Mail, Link2, LogOut, Sparkles, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getCurrentUser);
  const seedDemoData = useMutation(api.analyses.seedDemoData);
  const clearDemoData = useMutation(api.analyses.clearDemoData);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  if (user === undefined) {
    return (
      <div className="space-y-6 mx-auto max-w-2xl">
        <div className="h-10 w-48 rounded-xl bg-white/[0.04] shimmer-bg" />
        <div className="h-[200px] rounded-2xl bg-white/[0.04] shimmer-bg" />
        <div className="h-[160px] rounded-2xl bg-white/[0.04] shimmer-bg" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="hero-fade-in">
          <p className="text-[13px] font-medium text-warm-500">
            Manage your account and preferences
          </p>
          <h1 className="mt-0.5 text-[28px] font-bold tracking-tight text-warm-900">
            Settings
          </h1>
        </div>

        {/* Profile Section */}
        <GlassPanel className="hero-fade-in" style={{ animationDelay: "0.04s" }}>
          <div className="p-6">
            <h2 className="text-[15px] font-semibold text-warm-800">Profile</h2>
            <div className="mt-5 flex items-center gap-4">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/[0.06]">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name ?? "Profile"}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-[18px] font-bold text-warm-600">
                    {getInitials(user?.name)}
                  </span>
                )}
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-surface" />
              </div>
              <div className="min-w-0">
                <p className="text-[18px] font-semibold text-warm-900">
                  {user?.name ?? "User"}
                </p>
                {user?.email && (
                  <div className="mt-1 flex items-center gap-1.5 text-[13px] text-warm-500">
                    <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                    <span>{user.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* Connected Accounts Section */}
        <GlassPanel className="hero-fade-in" style={{ animationDelay: "0.08s" }}>
          <div className="p-6">
            <h2 className="text-[15px] font-semibold text-warm-800">Connected Accounts</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-white/[0.08] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-warm-800">Google</p>
                    <p className="text-[11px] text-warm-500">{user?.email ?? "Connected"}</p>
                  </div>
                </div>
                <span className="rounded-full bg-solid/10 px-2.5 py-1 text-[10px] font-bold text-solid">
                  Connected
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/[0.08] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                    <Link2 className="h-5 w-5 text-brand" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-warm-800">Google Docs Access</p>
                    <p className="text-[11px] text-warm-500">Analyze Google Docs for contribution data</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (user as Record<string, any>)?.googleAccessToken
                    ? "bg-solid/10 text-solid"
                    : "bg-amber-400/10 text-amber-400"
                }`}>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(user as Record<string, any>)?.googleAccessToken ? "Active" : "Needs Auth"}
                </span>
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* Demo Data Section */}
        <GlassPanel className="hero-fade-in" style={{ animationDelay: "0.12s" }}>
          <div className="p-6">
            <h2 className="text-[15px] font-semibold text-warm-800">Developer</h2>
            <p className="mt-1 text-[12px] text-warm-500">
              Load realistic demo analyses for showcasing the app.
            </p>
            <div className="mt-4 space-y-2">
              <button
                onClick={async () => {
                  setIsSeeding(true);
                  await seedDemoData({});
                  setIsSeeding(false);
                }}
                disabled={isSeeding || isClearing}
                className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] p-4 text-left transition-colors hover:border-white/[0.14] hover:bg-white/[0.04] disabled:opacity-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                  <Sparkles className="h-5 w-5 text-brand" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-warm-800">
                    {isSeeding ? "Loading demo data..." : "Load Demo Data"}
                  </p>
                  <p className="text-[11px] text-warm-500">
                    Inserts 6 sample analyses (safe to click multiple times)
                  </p>
                </div>
              </button>
              <button
                onClick={async () => {
                  setIsClearing(true);
                  await clearDemoData({});
                  setIsClearing(false);
                }}
                disabled={isSeeding || isClearing}
                className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] p-4 text-left transition-colors hover:border-danger/30 hover:bg-danger/5 disabled:opacity-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10">
                  <Trash2 className="h-5 w-5 text-danger" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-warm-800">
                    {isClearing ? "Removing demo data..." : "Unload Demo Data"}
                  </p>
                  <p className="text-[11px] text-warm-500">
                    Removes all 6 sample analyses and their contributors
                  </p>
                </div>
              </button>
            </div>
          </div>
        </GlassPanel>

        {/* Account Actions */}
        <GlassPanel className="hero-fade-in" style={{ animationDelay: "0.16s" }}>
          <div className="p-6">
            <h2 className="text-[15px] font-semibold text-warm-800">Account</h2>
            <div className="mt-4 space-y-3">
              <button
                onClick={() => void signOut()}
                className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] p-4 text-left transition-colors hover:border-danger/30 hover:bg-danger/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10">
                  <LogOut className="h-5 w-5 text-danger" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-warm-800">Sign Out</p>
                  <p className="text-[11px] text-warm-500">
                    Sign out of your Glasswork account
                  </p>
                </div>
              </button>
            </div>
          </div>
        </GlassPanel>
      </div>
    </PageTransition>
  );
}
