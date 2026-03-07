"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Search,
  PenLine,
  GraduationCap,
  Send,
  MessageCircle,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useChatMessages,
  type ReportContext,
  type ToolType,
} from "./useChatMessages";

const TOOLS: { id: ToolType; label: string; icon: typeof Search; desc: string }[] = [
  { id: "deep_research", label: "Deep Research", icon: Search, desc: "Exhaustive analysis" },
  { id: "canvas", label: "Canvas", icon: PenLine, desc: "Draft & edit feedback" },
  { id: "guided_learning", label: "Guided Learning", icon: GraduationCap, desc: "Interactive tutoring" },
];

const SUGGESTED_PROMPTS = [
  "Who's the strongest contributor and why?",
  "Summarize this report in 3 bullet points",
  "What should the team improve on?",
  "Compare the top and bottom performers",
];

export function ReportChatPanel({
  reportContext,
  onClose,
}: {
  reportContext: ReportContext;
  onClose: () => void;
}) {
  const { messages, isStreaming, activeTool, sendMessage, clearChat, toggleTool } =
    useChatMessages();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25 }}
      className="flex h-[calc(100vh-120px)] flex-col rounded-2xl border border-white/[0.25] bg-[#FFF5EB]/[0.15] shadow-glass backdrop-blur-[20px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
          </div>
          <span className="text-[13px] font-semibold text-warm-800">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="rounded-lg p-1.5 text-warm-400 transition-colors hover:bg-warm-100 hover:text-warm-600"
              title="Clear chat"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-warm-400 transition-colors hover:bg-warm-100 hover:text-warm-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tool Buttons */}
      <div className="flex gap-1.5 border-b border-white/10 px-4 py-2.5">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => toggleTool(tool.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200",
                isActive
                  ? "border border-brand/30 bg-brand/10 text-brand"
                  : "border border-warm-200 bg-white/60 text-warm-500 hover:border-warm-300 hover:text-warm-600"
              )}
            >
              <Icon className="h-3 w-3" />
              {tool.label}
            </button>
          );
        })}
      </div>

      {/* Messages */}
      <div
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/10">
              <MessageCircle className="h-5 w-5 text-brand" />
            </div>
            <p className="mt-3 text-[13px] font-semibold text-warm-700">
              Chat with your report
            </p>
            <p className="mt-1 text-center text-[11px] text-warm-400">
              Ask questions about contributors, scores, and performance
            </p>
            <div className="mt-5 flex flex-col gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInput("");
                    setUserScrolled(false);
                    sendMessage(prompt, reportContext);
                  }}
                  className="rounded-xl border border-warm-200 bg-white/60 px-3 py-2 text-left text-[11px] text-warm-600 transition-all hover:border-brand/30 hover:bg-brand/5 hover:text-brand"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap px-3.5 py-2.5 text-[12.5px] leading-relaxed",
                  msg.role === "user"
                    ? "rounded-2xl rounded-br-md bg-brand/10 text-warm-800"
                    : "rounded-2xl rounded-bl-md border border-white/40 bg-white/60 text-warm-700 backdrop-blur-sm"
                )}
              >
                {msg.content ||
                  (isStreaming && (
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand/50" />
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand/50 [animation-delay:0.2s]" />
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand/50 [animation-delay:0.4s]" />
                    </span>
                  ))}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/20 px-4 py-3">
        {activeTool && (
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium text-brand">
            <Sparkles className="h-2.5 w-2.5" />
            {TOOLS.find((t) => t.id === activeTool)?.label} mode active
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this report..."
            disabled={isStreaming}
            className={cn(
              "flex-1 rounded-xl border border-white/40 bg-white/60 px-3.5 py-2.5 text-[12.5px] text-warm-900 backdrop-blur-lg",
              "placeholder:text-warm-400",
              "transition-all duration-200 hover:border-warm-300 focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/10",
              "disabled:cursor-not-allowed disabled:opacity-40"
            )}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
              input.trim() && !isStreaming
                ? "bg-brand text-white shadow-sm hover:bg-brand/90"
                : "bg-warm-100 text-warm-400"
            )}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function FloatingChatFAB({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-layered transition-shadow hover:shadow-glass"
    >
      <MessageCircle className="h-5 w-5" />
    </motion.button>
  );
}
