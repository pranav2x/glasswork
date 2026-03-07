"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  PenLine,
  GraduationCap,
  ArrowUp,
  Trash2,
  AtSign,
  ChevronUp,
  Infinity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useChatMessages,
  GEMINI_MODELS,
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
  const { messages, isStreaming, activeTool, activeModel, sendMessage, clearChat, toggleTool, setActiveModel } =
    useChatMessages();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const agentDropdownRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userScrolled) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, userScrolled]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        agentDropdownRef.current &&
        !agentDropdownRef.current.contains(e.target as Node)
      ) {
        setAgentDropdownOpen(false);
      }
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(e.target as Node)
      ) {
        setModelDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const activeToolLabel = activeTool
    ? TOOLS.find((t) => t.id === activeTool)?.label ?? "Agent"
    : "Agent";

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

      {/* Input area — ChatGPT-style */}
      <div className="px-4 pb-4">
        <div className="rounded-2xl border border-warm-200/80 bg-warm-50/30 transition-all focus-within:border-warm-300 focus-within:bg-white">
          {/* Top section: @ Add Context + textarea */}
          <div className="px-4 pt-3">
            <button className="mb-2 flex items-center gap-1.5 rounded-lg border border-warm-200/80 bg-white px-2.5 py-1 text-[12px] font-medium text-warm-500 transition-colors hover:border-warm-300 hover:text-warm-700">
              <AtSign className="h-3 w-3" />
              Add Context
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Imagine, plan, write anything..."
              disabled={isStreaming}
              rows={1}
              className="w-full resize-none bg-transparent text-[13px] text-warm-900 placeholder:text-warm-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
              style={{ minHeight: "24px", maxHeight: "120px" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "24px";
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
              }}
            />
          </div>

          {/* Bottom row: pills + send */}
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
            <div className="flex items-center gap-1.5">
              {/* Agent mode pill with dropdown */}
              <div ref={agentDropdownRef} className="relative">
                <button
                  onClick={() => setAgentDropdownOpen((o) => !o)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-all",
                    activeTool
                      ? "bg-warm-800 text-white"
                      : "bg-warm-100 text-warm-600 hover:bg-warm-200"
                  )}
                >
                  <Infinity className="h-3.5 w-3.5" />
                  <span>{activeToolLabel}</span>
                  <ChevronUp
                    className={cn(
                      "h-3 w-3 transition-transform",
                      agentDropdownOpen ? "rotate-0" : "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {agentDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-0 z-50 mb-1.5 w-48 rounded-xl border border-warm-200 bg-white p-1 shadow-lg"
                    >
                      {/* None / default option */}
                      <button
                        onClick={() => {
                          if (activeTool) toggleTool(activeTool);
                          setAgentDropdownOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-medium transition-colors",
                          !activeTool
                            ? "bg-warm-100 text-warm-800"
                            : "text-warm-500 hover:bg-warm-50 hover:text-warm-700"
                        )}
                      >
                        <Infinity className="h-3.5 w-3.5" />
                        Default
                      </button>
                      {TOOLS.map((tool) => {
                        const Icon = tool.icon;
                        const isActive = activeTool === tool.id;
                        return (
                          <button
                            key={tool.id}
                            onClick={() => {
                              toggleTool(tool.id);
                              setAgentDropdownOpen(false);
                            }}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-medium transition-colors",
                              isActive
                                ? "bg-warm-100 text-warm-800"
                                : "text-warm-500 hover:bg-warm-50 hover:text-warm-700"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {tool.label}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Model pill with dropdown */}
              <div ref={modelDropdownRef} className="relative">
                <button
                  onClick={() => setModelDropdownOpen((o) => !o)}
                  className="flex items-center gap-1.5 rounded-full bg-warm-100 px-3 py-1 text-[12px] font-medium text-warm-600 transition-colors hover:bg-warm-200"
                >
                  <span>{GEMINI_MODELS.find((m) => m.id === activeModel)?.label ?? "Gemini 2.0 Flash"}</span>
                  <ChevronUp
                    className={cn(
                      "h-3 w-3 transition-transform",
                      modelDropdownOpen ? "rotate-0" : "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {modelDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-0 z-50 mb-1.5 w-48 rounded-xl border border-warm-200 bg-white p-1 shadow-lg"
                    >
                      {GEMINI_MODELS.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            setActiveModel(model.id);
                            setModelDropdownOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center rounded-lg px-3 py-2 text-left text-[12px] font-medium transition-colors",
                            activeModel === model.id
                              ? "bg-warm-100 text-warm-800"
                              : "text-warm-500 hover:bg-warm-50 hover:text-warm-700"
                          )}
                        >
                          {model.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all",
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
