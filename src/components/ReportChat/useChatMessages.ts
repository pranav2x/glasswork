"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export type ToolType = "deep_research" | "canvas" | "guided_learning";

export type GeminiModel = "gemini-3-flash-preview" | "gemini-3-pro-preview" | "gemini-3.1-pro-preview";

export const GEMINI_MODELS: { id: GeminiModel; label: string }[] = [
  { id: "gemini-3-flash-preview", label: "Gemini 3 Flash" },
  { id: "gemini-3-pro-preview", label: "Gemini 3 Pro" },
  { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro" },
];

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  displayContent?: string; // original text with @mentions (before expansion)
};

export type Conversation = {
  id: string;
  preview: string;
  createdAt: number;
  messages: ChatMessage[];
};

export type ReportContext = {
  title: string;
  sourceType: string;
  summary: string;
  contributors: {
    name: string;
    score: number;
    tier: string;
    rawStats: Record<string, number>;
    strengths: string[];
    improvements: string[];
  }[];
  teamAvgScore: number;
  carryCount: number;
  ghostCount: number;
};

function storageKey(reportTitle: string) {
  return `glasswork-chats-${reportTitle.replace(/\s+/g, "-").toLowerCase()}`;
}

function loadConversations(reportTitle: string): Conversation[] {
  try {
    const raw = localStorage.getItem(storageKey(reportTitle));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveConversations(reportTitle: string, convos: Conversation[]) {
  try {
    localStorage.setItem(storageKey(reportTitle), JSON.stringify(convos.slice(0, 20)));
  } catch {
    // localStorage full — silently fail
  }
}

export function useChatMessages(reportTitle: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [activeModel, setActiveModel] = useState<GeminiModel>("gemini-3-flash-preview");
  const abortRef = useRef<AbortController | null>(null);

  // Load conversations from localStorage on mount / title change
  useEffect(() => {
    const loaded = loadConversations(reportTitle);
    setConversations(loaded);
    setActiveConvoId(null);
    setMessages([]);
  }, [reportTitle]);

  // Persist messages to the active conversation whenever they change
  useEffect(() => {
    if (!activeConvoId || messages.length === 0 || isStreaming) return;
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === activeConvoId
          ? { ...c, messages, preview: messages.find((m) => m.role === "user")?.content || c.preview }
          : c
      );
      saveConversations(reportTitle, updated);
      return updated;
    });
  }, [messages, activeConvoId, isStreaming, reportTitle]);

  const sendMessage = useCallback(
    async (content: string, reportContext: ReportContext, displayContent?: string) => {
      // Auto-create conversation on first message
      let convoId = activeConvoId;
      if (!convoId) {
        convoId = crypto.randomUUID();
        const newConvo: Conversation = {
          id: convoId,
          preview: content,
          createdAt: Date.now(),
          messages: [],
        };
        setActiveConvoId(convoId);
        setConversations((prev) => {
          const updated = [newConvo, ...prev];
          saveConversations(reportTitle, updated);
          return updated;
        });
      }

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        displayContent: displayContent || content,
      };

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      const abortController = new AbortController();
      abortRef.current = abortController;

      try {
        const allMessages = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/report-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: allMessages,
            reportContext,
            tool: activeTool,
            model: activeModel,
          }),
          signal: abortController.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || "Chat request failed");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: m.content + chunk }
                : m
            )
          );
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const errorMessage = (err as Error).message || "Something went wrong. Please try again.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: errorMessage }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, activeTool, activeModel, activeConvoId, reportTitle]
  );

  const newChat = useCallback(() => {
    abortRef.current?.abort();
    setActiveConvoId(null);
    setMessages([]);
    setIsStreaming(false);
  }, []);

  const loadConversation = useCallback((convoId: string) => {
    const convo = conversations.find((c) => c.id === convoId);
    if (convo) {
      abortRef.current?.abort();
      setActiveConvoId(convo.id);
      setMessages(convo.messages);
      setIsStreaming(false);
    }
  }, [conversations]);

  const deleteConversation = useCallback((convoId: string) => {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== convoId);
      saveConversations(reportTitle, updated);
      return updated;
    });
    if (activeConvoId === convoId) {
      setActiveConvoId(null);
      setMessages([]);
    }
  }, [activeConvoId, reportTitle]);

  const toggleTool = useCallback((tool: ToolType) => {
    setActiveTool((prev) => (prev === tool ? null : tool));
  }, []);

  return {
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
  };
}
