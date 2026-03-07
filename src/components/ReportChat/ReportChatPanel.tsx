"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  PenLine,
  GraduationCap,
  ArrowUp,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useChatMessages,
  type ReportContext,
  type ToolType,
} from "./useChatMessages";

const TOOLS: { id: ToolType; label: string; icon: typeof Search }[] = [
  { id: "deep_research", label: "Deep Research", icon: Search },
  { id: "canvas", label: "Canvas", icon: PenLine },
  { id: "guided_learning", label: "Guided Learning", icon: GraduationCap },
];

const SUGGESTED_PROMPTS = [
  "Who's the strongest contributor?",
  "Summarize this report",
  "What should the team improve?",
  "Compare top and bottom performers",
];

export function ReportChatPanel({
  reportContext,
}: {
  reportContext: ReportContext;
}) {
  const { messages, isStreaming, activeTool, sendMessage, clearChat, toggleTool } =
    useChatMessages();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);

  useEffect(() => {
    if (!userScrolled) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, userScrolled]);

  const handleScroll = () => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setUserScrolled(!isAtBottom);
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput("");
    setUserScrolled(false);
    sendMessage(trimmed, reportContext);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col rounded-2xl border border-warm-200/60 bg-white shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5">
        <span className="text-[14px] font-semibold text-warm-900">
          {reportContext.title}
        </span>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="rounded-lg p-1.5 text-warm-300 transition-colors hover:bg-warm-50 hover:text-warm-500"
            title="Clear chat"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-5"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center pb-8">
            <p className="text-[15px] font-medium text-warm-800">
              Chat with your report
            </p>
            <p className="mt-1.5 text-center text-[13px] text-warm-400">
              Ask questions about contributors, scores, and performance
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setUserScrolled(false);
                    sendMessage(prompt, reportContext);
                  }}
                  className="rounded-xl border border-warm-200/80 bg-warm-50/50 px-3 py-2.5 text-left text-[12px] text-warm-600 transition-all hover:border-warm-300 hover:bg-warm-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-warm-100 px-3.5 py-2.5 text-[13px] leading-relaxed text-warm-800">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div className="text-[13px] leading-relaxed text-warm-700">
                    {msg.content || (
                      isStreaming && (
                        <span className="flex items-center gap-1 py-1">
                          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-warm-300" />
                          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-warm-300 [animation-delay:0.2s]" />
                          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-warm-300 [animation-delay:0.4s]" />
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-4 pb-4">
        <div className="rounded-2xl border border-warm-200/80 bg-warm-50/30 transition-all focus-within:border-warm-300 focus-within:bg-white">
          {/* Text input */}
          <div className="px-4 pt-3 pb-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Imagine, plan, write anything..."
              disabled={isStreaming}
              className="w-full bg-transparent text-[13px] text-warm-900 placeholder:text-warm-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
            />
          </div>

          {/* Bottom row: tools + send */}
          <div className="flex items-center justify-between px-3 pb-2.5">
            <div className="flex items-center gap-1">
              {TOOLS.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => toggleTool(tool.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium transition-all",
                      isActive
                        ? "bg-warm-200/60 text-warm-800"
                        : "text-warm-400 hover:bg-warm-100 hover:text-warm-600"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    <span className="hidden min-[400px]:inline">{tool.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all",
                input.trim() && !isStreaming
                  ? "bg-warm-900 text-white"
                  : "bg-warm-200/60 text-warm-400"
              )}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
