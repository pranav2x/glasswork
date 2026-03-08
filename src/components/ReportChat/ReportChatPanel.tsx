"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Search,
  PenLine,
  GraduationCap,
  ArrowUp,
  Trash2,
  AtSign,
  ChevronUp,
  ChevronDown,
  Infinity,
  Plus,
  MessageSquare,
  User,
  FileText,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useChatMessages,
  CLAUDE_MODELS,
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

type MentionItem = {
  id: string;
  label: string;
  type: "contributor" | "report";
  detail?: string;
};

function buildMentionItems(ctx: ReportContext): MentionItem[] {
  const items: MentionItem[] = [
    {
      id: `report:${ctx.title}`,
      label: ctx.title,
      type: "report",
      detail: `${ctx.contributors.length} contributors · avg ${ctx.teamAvgScore}`,
    },
    ...ctx.contributors.map((c) => ({
      id: `contributor:${c.name}`,
      label: c.name,
      type: "contributor" as const,
      detail: `Score ${c.score} · ${c.tier === "carry" ? "Locked In" : c.tier === "solid" ? "Mid" : "Selling"}`,
    })),
  ];
  return items;
}

function expandMentions(text: string, ctx: ReportContext): string {
  let expanded = text;

  // Expand @ReportTitle → inject report summary context
  if (expanded.includes(`@${ctx.title}`)) {
    expanded = expanded.replace(
      `@${ctx.title}`,
      `[Report: "${ctx.title}" — ${ctx.sourceType === "google_doc" ? "Google Doc" : "GitHub Repo"}, ${ctx.contributors.length} contributors, avg score ${ctx.teamAvgScore}, summary: ${ctx.summary || "N/A"}]`
    );
  }

  // Expand @ContributorName → inject their full stats
  for (const c of ctx.contributors) {
    if (expanded.includes(`@${c.name}`)) {
      const tierLabel = c.tier === "carry" ? "LOCKED IN" : c.tier === "solid" ? "MID" : "SELLING";
      expanded = expanded.replace(
        `@${c.name}`,
        `[Contributor: ${c.name}, Score: ${c.score}/100, Tier: ${tierLabel}, Stats: ${JSON.stringify(c.rawStats)}, Strengths: ${c.strengths.join(", ") || "none"}, Improvements: ${c.improvements.join(", ") || "none"}]`
      );
    }
  }

  return expanded;
}

function renderWithMentions(text: string): React.ReactNode {
  // Match @Name patterns — capture just the @Name portion as a blue link
  const parts = text.split(/(@[A-Z][a-zA-Z]*(?:\s[A-Z][a-zA-Z]*)*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      return (
        <span key={i} className="font-semibold text-blue-600">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function ReportChatPanel({
  reportContext,
}: {
  reportContext: ReportContext;
}) {
  const {
    messages,
    isStreaming,
    activeTool,
    activeModel,
    conversations,
    activeConvoId,
    sendMessage,
    newChat,
    loadConversation,
    deleteConversation,
    toggleTool,
    setActiveModel,
  } = useChatMessages(reportContext.title);

  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [convoDropdownOpen, setConvoDropdownOpen] = useState(false);
  const agentDropdownRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const convoDropdownRef = useRef<HTMLDivElement>(null);

  // Mention state
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);
  const mentionRef = useRef<HTMLDivElement>(null);
  const [rubricText, setRubricText] = useState<string | null>(null);
  const [rubricName, setRubricName] = useState<string | null>(null);
  const rubricInputRef = useRef<HTMLInputElement>(null);

  const allMentionItems = useMemo(() => buildMentionItems(reportContext), [reportContext]);

  const filteredMentions = useMemo(() => {
    if (!mentionQuery) return allMentionItems;
    const q = mentionQuery.toLowerCase();
    return allMentionItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.detail && item.detail.toLowerCase().includes(q))
    );
  }, [allMentionItems, mentionQuery]);

  useEffect(() => {
    if (!userScrolled) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, userScrolled]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (agentDropdownRef.current && !agentDropdownRef.current.contains(e.target as Node)) {
        setAgentDropdownOpen(false);
      }
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
      if (convoDropdownRef.current && !convoDropdownRef.current.contains(e.target as Node)) {
        setConvoDropdownOpen(false);
      }
      if (mentionRef.current && !mentionRef.current.contains(e.target as Node)) {
        setMentionOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset mention index when filtered list changes
  useEffect(() => {
    setMentionIndex(0);
  }, [filteredMentions.length]);

  const handleScroll = () => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setUserScrolled(!isAtBottom);
  };

  const handleRubricUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRubricText(text);
      setRubricName(file.name);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    // Expand @mentions into full context before sending to API
    let expanded = expandMentions(trimmed, reportContext);
    // Attach rubric context if uploaded
    if (rubricText) {
      expanded = `${expanded}\n\n[Rubric Context — "${rubricName}":\n${rubricText}]`;
    }
    setInput("");
    setUserScrolled(false);
    setMentionOpen(false);
    // Pass original text as displayContent so user sees clean message
    sendMessage(expanded, reportContext, trimmed);
  };

  const insertMention = (item: MentionItem) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const cursor = ta.selectionStart;
    const text = input;

    // Find the @ that triggered this mention
    let atPos = cursor - 1;
    while (atPos >= 0 && text[atPos] !== "@") {
      atPos--;
    }
    if (atPos < 0) atPos = cursor;

    const before = text.slice(0, atPos);
    const after = text.slice(cursor);
    const mention = `@${item.label} `;
    const newText = before + mention + after;

    setInput(newText);
    setMentionOpen(false);
    setMentionQuery("");

    // Restore cursor position after the mention
    requestAnimationFrame(() => {
      const newPos = before.length + mention.length;
      ta.setSelectionRange(newPos, newPos);
      ta.focus();
    });
  };

  const openMentionFromButton = () => {
    const ta = textareaRef.current;
    if (!ta) return;

    // Insert @ at cursor position and open mention popup
    const cursor = ta.selectionStart;
    const before = input.slice(0, cursor);
    const after = input.slice(cursor);
    setInput(before + "@" + after);
    setMentionOpen(true);
    setMentionQuery("");

    requestAnimationFrame(() => {
      ta.setSelectionRange(cursor + 1, cursor + 1);
      ta.focus();
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setInput(newVal);

    const cursor = e.target.selectionStart;
    // Check if we're in an @mention context
    const textBeforeCursor = newVal.slice(0, cursor);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Only show mention popup if there's no space break (simple heuristic)
      // Allow spaces in names like "Pranav Rapelli"
      const hasNewline = textAfterAt.includes("\n");
      if (!hasNewline && textAfterAt.length <= 30) {
        setMentionOpen(true);
        setMentionQuery(textAfterAt);
        return;
      }
    }
    setMentionOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (mentionOpen && filteredMentions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((i) => (i + 1) % filteredMentions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex((i) => (i - 1 + filteredMentions.length) % filteredMentions.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(filteredMentions[mentionIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMentionOpen(false);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeToolLabel = activeTool
    ? TOOLS.find((t) => t.id === activeTool)?.label ?? "Canvas"
    : "Canvas";

  return (
    <div className="flex h-full flex-col rounded-2xl border border-warm-200/60 bg-white shadow-card">
      {/* Header with conversation switcher */}
      <div className="flex items-center justify-between px-5 py-3.5">
        <div ref={convoDropdownRef} className="relative min-w-0 flex-1">
          <button
            onClick={() => setConvoDropdownOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-lg px-1 py-0.5 transition-colors hover:bg-warm-200/40"
          >
            <span className="truncate text-[14px] font-semibold text-warm-900">
              {reportContext.title}
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-warm-400 transition-transform",
                convoDropdownOpen && "rotate-180"
              )}
            />
          </button>

          <AnimatePresence>
            {convoDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-warm-200 bg-white p-1.5 shadow-lg"
              >
                <button
                  onClick={() => {
                    newChat();
                    setConvoDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] font-medium text-warm-600 transition-colors hover:bg-warm-50 hover:text-warm-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New conversation
                </button>

                {conversations.length > 0 && (
                  <div className="my-1 h-px bg-warm-100" />
                )}

                <div className="max-h-48 overflow-y-auto">
                  {conversations.map((convo) => (
                    <div
                      key={convo.id}
                      className={cn(
                        "group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors",
                        activeConvoId === convo.id
                          ? "bg-warm-100 text-warm-800"
                          : "text-warm-500 hover:bg-warm-50 hover:text-warm-700"
                      )}
                    >
                      <button
                        onClick={() => {
                          loadConversation(convo.id);
                          setConvoDropdownOpen(false);
                        }}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      >
                        <MessageSquare className="h-3 w-3 shrink-0" />
                        <span className="truncate text-[12px] font-medium">
                          {convo.preview}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(convo.id);
                        }}
                        className="shrink-0 rounded p-0.5 text-warm-300 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {messages.length > 0 && (
          <button
            onClick={newChat}
            className="ml-2 rounded-lg p-1.5 text-warm-300 transition-colors hover:bg-warm-200/40 hover:text-warm-500"
            title="New chat"
          >
            <Plus className="h-3.5 w-3.5" />
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
                      {renderWithMentions(msg.displayContent || msg.content)}
                    </div>
                  </div>
                ) : (
                  <div className="text-[13px] leading-relaxed text-warm-700">
                    {msg.content ? (
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:text-warm-900 prose-headings:text-sm prose-strong:text-warm-800">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
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
        <div className="relative rounded-2xl border border-warm-200/80 bg-white/60 transition-all focus-within:border-warm-300 focus-within:bg-white">
          {/* Mention autocomplete popup */}
          <AnimatePresence>
            {mentionOpen && filteredMentions.length > 0 && (
              <motion.div
                ref={mentionRef}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.12 }}
                className="absolute bottom-full left-3 z-50 mb-2 w-[calc(100%-24px)] rounded-xl border border-warm-200 bg-white p-1 shadow-lg"
              >
                <div className="max-h-48 overflow-y-auto">
                  {filteredMentions.map((item, i) => (
                    <button
                      key={item.id}
                      onMouseDown={(e) => {
                        e.preventDefault(); // prevent textarea blur
                        insertMention(item);
                      }}
                      onMouseEnter={() => setMentionIndex(i)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors",
                        i === mentionIndex
                          ? "bg-warm-100 text-warm-800"
                          : "text-warm-600 hover:bg-warm-50"
                      )}
                    >
                      {item.type === "contributor" ? (
                        <User className="h-3.5 w-3.5 shrink-0 text-warm-400" />
                      ) : (
                        <FileText className="h-3.5 w-3.5 shrink-0 text-warm-400" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12px] font-semibold">
                          {item.label}
                        </div>
                        {item.detail && (
                          <div className="truncate text-[10px] text-warm-400">
                            {item.detail}
                          </div>
                        )}
                      </div>
                      <span className="shrink-0 rounded bg-warm-100 px-1.5 py-0.5 text-[9px] font-medium text-warm-400">
                        {item.type === "contributor" ? "person" : "report"}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top section: @ Add Context + Upload Rubric + textarea */}
          <div className="px-4 pt-3">
            <div className="mb-2 flex items-center gap-1.5">
              <button
                onClick={openMentionFromButton}
                className="flex items-center gap-1.5 rounded-lg border border-warm-200/80 bg-white px-2.5 py-1 text-[12px] font-medium text-warm-500 transition-colors hover:border-warm-300 hover:text-warm-700"
              >
                <AtSign className="h-3 w-3" />
                Add Context
              </button>
              <button
                onClick={() => rubricInputRef.current?.click()}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[12px] font-medium transition-colors",
                  rubricText
                    ? "border-docs-accent/30 bg-docs-accent/5 text-docs-accent"
                    : "border-warm-200/80 bg-white text-warm-500 hover:border-warm-300 hover:text-warm-700"
                )}
              >
                <Upload className="h-3 w-3" />
                {rubricText ? rubricName : "Upload Rubric"}
              </button>
              {rubricText && (
                <button
                  onClick={() => { setRubricText(null); setRubricName(null); }}
                  className="flex h-5 w-5 items-center justify-center rounded text-warm-400 hover:text-red-400"
                  title="Remove rubric"
                >
                  <span className="text-[14px] leading-none">&times;</span>
                </button>
              )}
              <input
                ref={rubricInputRef}
                type="file"
                accept=".txt,.md,.pdf,.docx,.csv"
                onChange={handleRubricUpload}
                className="hidden"
              />
            </div>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Imagine, plan, write anything... Type @ to mention"
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
                  <span>{CLAUDE_MODELS.find((m) => m.id === activeModel)?.label ?? "Claude Sonnet 4.6"}</span>
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
                      {CLAUDE_MODELS.map((model) => (
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
