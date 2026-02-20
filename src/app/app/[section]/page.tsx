"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Smile,
  Layers,
  Circle,
  SlidersHorizontal,
  Link2,
  ArrowLeft,
} from "lucide-react";

const SECTIONS: Record<
  string,
  { title: string; icon: typeof Search; description: string; detail: string }
> = {
  feedback: {
    title: "Feedback",
    icon: Smile,
    description: "Share your thoughts and help improve Glasswork",
    detail:
      "Submit bug reports, feature requests, and general feedback. Your input shapes the future of Glasswork.",
  },
  collections: {
    title: "Collections",
    icon: Layers,
    description: "Organize your analyses into groups",
    detail:
      "Group related docs and repos together. Create collections for classes, semesters, or teams to keep everything tidy.",
  },
  projects: {
    title: "Projects",
    icon: Circle,
    description: "Manage projects and team access",
    detail:
      "Create projects to track long-running collaborations. Invite team members and set contribution benchmarks.",
  },
  workflows: {
    title: "Workflows",
    icon: SlidersHorizontal,
    description: "Automate your analysis pipelines",
    detail:
      "Set up recurring analyses, auto-analyze new docs, and get notified when contribution patterns change.",
  },
  connections: {
    title: "Connections",
    icon: Link2,
    description: "Link your accounts and services",
    detail:
      "Connect Google Workspace, GitHub organizations, and other platforms to streamline your analysis workflow.",
  },
  integrations: {
    title: "Integrations",
    icon: Layers,
    description: "Connect third-party tools",
    detail:
      "Integrate with Slack, Discord, Notion, and more. Get analysis results delivered where your team already works.",
  },
};

export default function SectionPage() {
  const params = useParams();
  const sectionKey = params.section as string;
  const section = SECTIONS[sectionKey];

  if (!section) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <p className="text-[15px] font-semibold text-warm-800">
          Page not found
        </p>
        <Link
          href="/app"
          className="mt-4 text-[13px] font-medium text-brand hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const Icon = section.icon;

  return (
    <div className="mx-auto max-w-lg py-16">
      <Link
        href="/app"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-warm-400 transition-colors hover:text-warm-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Dashboard
      </Link>

      <div className="mt-8 rounded-2xl border border-warm-200 bg-white p-10 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-100">
          <Icon className="h-6 w-6 text-warm-500" strokeWidth={1.5} />
        </div>

        <h1 className="mt-6 text-[24px] font-bold tracking-tight text-warm-900">
          {section.title}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-warm-500">
          {section.description}
        </p>

        <div className="mt-6 rounded-xl border border-dashed border-warm-300 bg-warm-50/50 p-5">
          <p className="text-[13px] leading-relaxed text-warm-500">
            {section.detail}
          </p>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
            Coming Soon
          </span>
          <span className="text-[12px] text-warm-400">
            This feature is under development
          </span>
        </div>
      </div>
    </div>
  );
}
