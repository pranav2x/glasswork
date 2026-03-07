"use client";

import { useState, useCallback, useRef } from "react";

export type ToolType = "deep_research" | "canvas" | "guided_learning";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
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

export function useChatMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string, reportContext: ReportContext) => {
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
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
          }),
          signal: abortController.signal,
        });

        if (!res.ok) {
          throw new Error("Chat request failed");
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
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: "Sorry, something went wrong. Please try again." }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, activeTool]
  );

  const clearChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setIsStreaming(false);
  }, []);

  const toggleTool = useCallback((tool: ToolType) => {
    setActiveTool((prev) => (prev === tool ? null : tool));
  }, []);

  return { messages, isStreaming, activeTool, sendMessage, clearChat, toggleTool };
}
