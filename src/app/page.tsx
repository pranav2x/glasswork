"use client";

import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../convex/_generated/api";
import { CheckCircle2 } from "lucide-react";

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function WaitlistPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/app");
    }
  }, [isAuthenticated, isLoading, router]);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [joined, setJoined] = useState<{ position: number; alreadyJoined: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const joinWaitlist = useMutation(api.waitlist.join);
  const waitlistCount = useQuery(api.waitlist.getCount);

  const handleSubmit = useCallback(async () => {
    if (!validateEmail(email)) {
      setError("Enter a valid email address");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await joinWaitlist({ email, name: name || undefined });
      setJoined(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }, [email, name, joinWaitlist]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo + Brand */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <img src="/logo.png" alt="Glasswork" className="h-10 w-10 rounded-xl object-contain" />
          <h1 className="font-myflora text-[2rem] font-semibold text-warm-900">Glasswork</h1>
          <p className="text-center font-body text-[14px] text-warm-500">
            See through the work. Coming soon.
          </p>
          {(waitlistCount ?? 0) > 0 && (
            <span className="font-body text-[13px] text-warm-400">
              <span className="font-medium text-warm-700">{waitlistCount}</span> people already waiting
            </span>
          )}
        </div>

        {/* Form / Success */}
        <AnimatePresence mode="wait">
          {!joined ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="font-body text-[13px] font-medium text-warm-700">Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full rounded-xl border border-warm-200 bg-white px-4 py-3 font-body text-[14px] text-warm-800 placeholder:text-warm-300 focus:border-warm-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="font-body text-[13px] font-medium text-warm-700">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  onKeyDown={handleKeyDown}
                  className="w-full rounded-xl border border-warm-200 bg-white px-4 py-3 font-body text-[14px] text-warm-800 placeholder:text-warm-300 focus:border-warm-500 focus:outline-none transition-colors"
                />
              </div>

              {error && (
                <p className="font-body text-[12px] text-red-500">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || !email.trim()}
                className="mt-1 w-full rounded-xl bg-warm-900 py-3 font-body text-[14px] font-semibold text-white transition-all duration-200 hover:bg-warm-800 disabled:opacity-40 active:scale-[0.98]"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Joining…
                  </span>
                ) : (
                  "Join Waitlist"
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#404040]/10">
                <CheckCircle2 className="h-6 w-6 text-[#404040]" />
              </div>
              <h2 className="font-myflora text-[1.5rem] text-warm-900">
                {joined.alreadyJoined ? "Already in!" : "You're in."}
              </h2>
              <p className="font-body text-[14px] text-warm-500">
                You&apos;re <span className="font-semibold text-warm-800">#{joined.position}</span> on the waitlist.
                We&apos;ll reach out when we launch.
              </p>
              <button
                onClick={() => setJoined(null)}
                className="mt-2 font-body text-[12px] text-warm-400 underline underline-offset-2 hover:text-warm-600 transition-colors"
              >
                Add another email
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Owner access — subtle, won't be noticed */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => signIn("google", { redirectTo: "/app" })}
            className="font-body text-[11px] text-warm-200 hover:text-warm-400 transition-colors"
          >
            ·
          </button>
        </div>
      </motion.div>
    </div>
  );
}
