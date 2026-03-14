"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GlassPanel } from "@/components/GlassPanel";
import { PageTransition } from "@/components/PageTransition";

export default function SectionPage() {
  const params = useParams();
  const sectionKey = params.section as string;

  return (
    <PageTransition>
      <div className="mx-auto max-w-lg py-16">
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-warm-500 transition-colors hover:text-warm-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          Dashboard
        </Link>

        <GlassPanel className="mt-8 p-10 text-center">
          <h1 className="text-[24px] font-bold tracking-tight text-warm-900 capitalize">
            {sectionKey}
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-warm-500">
            This page is under development.
          </p>
          <Link
            href="/app"
            className="mt-6 inline-block rounded-xl bg-brand px-5 py-2.5 text-[13px] font-semibold text-white shadow-glow-brand transition-all hover:bg-brand-light active:scale-[0.97]"
          >
            Back to Dashboard
          </Link>
        </GlassPanel>
      </div>
    </PageTransition>
  );
}
