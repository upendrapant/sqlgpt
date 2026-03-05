"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SchemaOption, SqlResult, QueryResult } from "@/lib/types";
import { schemas } from "@/lib/schemas";
import ChatMessage, { ChatMsg } from "@/components/ChatMessage";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Database, ChevronDown, Send, Plus } from "lucide-react";

export default function Home() {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [selectedSchema, setSelectedSchema] = useState<SchemaOption | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 160) + "px";
    }
  }, [input]);

  // ─── Submit handler ─────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (questionText?: string) => {
    const question = (questionText || input).trim();
    if (!selectedSchema || !question || isLoading) return;

    const userMsgId = Date.now().toString();
    const assistantMsgId = (Date.now() + 1).toString();

    // Add user message + loading assistant message
    const userMsg: ChatMsg = { id: userMsgId, role: "user", content: question };
    const loadingMsg: ChatMsg = { id: assistantMsgId, role: "assistant", content: "", isLoading: true };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // 1. Generate SQL
      const genRes = await fetch("/api/generate-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, schemaId: selectedSchema.id }),
      });
      const genData = await genRes.json();

      if (!genRes.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, isLoading: false, error: genData.error || "Failed to generate SQL." }
              : m
          )
        );
        setIsLoading(false);
        return;
      }

      const sqlResult = genData as SqlResult;

      // Check if SQL is an error comment
      if (sqlResult.sql.trimStart().startsWith("--")) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, isLoading: false, sqlResult, content: sqlResult.explanation }
              : m
          )
        );
        setIsLoading(false);
        return;
      }

      // 2. Auto-execute the query
      const execRes = await fetch("/api/execute-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: sqlResult.sql, schemaId: selectedSchema.id }),
      });
      const execData = await execRes.json();

      if (!execRes.ok) {
        // Show SQL but with execution error
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                ...m,
                isLoading: false,
                sqlResult,
                error: `Query generated but execution failed: ${execData.error || "Unknown error"}`,
              }
              : m
          )
        );
        setIsLoading(false);
        return;
      }

      const queryResult = execData as QueryResult;

      // 3. Update with full results
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, isLoading: false, sqlResult, queryResult, content: sqlResult.explanation }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, isLoading: false, error: "Network error. Please check your connection." }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, selectedSchema, isLoading]);

  // ─── New conversation ───────────────────────────────────────────────────────
  const handleNewChat = () => {
    setMessages([]);
    setInput("");
  };

  // Get example questions for selected schema
  const examples = selectedSchema?.exampleQuestions ?? [];
  const showWelcome = messages.length === 0;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Left: Logo + Schema dropdown */}
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Database className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sm hidden sm:inline">QueryCraft</span>
            </div>

            {/* Schema dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                  <Database className="w-3.5 h-3.5" />
                  {selectedSchema ? selectedSchema.name : "Select Schema"}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Database Schemas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {schemas.map((schema) => (
                  <DropdownMenuItem
                    key={schema.id}
                    onClick={() => setSelectedSchema(schema)}
                    className="cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-medium">{schema.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {schema.description}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right: New chat + Theme toggle */}
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs h-8"
                onClick={handleNewChat}
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Chat</span>
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Chat Area ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div ref={scrollRef} className="h-full overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-6">
              {showWelcome ? (
                /* ── Welcome State ──────────────────────────────────────────── */
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                      What can I help you with?
                    </h1>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                      {selectedSchema
                        ? `Ask questions about your ${selectedSchema.name} database in plain English.`
                        : "Select a database schema above to get started."}
                    </p>
                  </div>

                  {/* Example tiles */}
                  {selectedSchema && examples.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
                      {examples.map((q) => (
                        <button
                          key={q}
                          onClick={() => setInput(q)}
                          disabled={isLoading}
                          className="px-4 py-2.5 text-sm rounded-xl border bg-card hover:bg-accent hover:text-accent-foreground transition-colors text-left max-w-[250px] disabled:opacity-50"
                        >
                          <span className="line-clamp-2">{q}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* ── Message History ────────────────────────────────────────── */
                <div className="space-y-6 pb-4">
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* ── Input Area (sticky bottom) ────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-background">
        <div className="max-w-3xl mx-auto px-4 py-3">

          <div className="relative flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder={
                  selectedSchema
                    ? "Ask a question about your data…"
                    : "Select a schema to start querying…"
                }
                disabled={!selectedSchema || isLoading}
                rows={2}
                className="w-full resize-none overflow-hidden rounded-xl border bg-card px-4 py-3 pr-12 text-sm
                  placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring
                  disabled:opacity-50 disabled:cursor-not-allowed
                  min-h-[64px] max-h-[160px]"
              />
            </div>
            <Button
              size="icon"
              className="h-[64px] w-[64px] rounded-xl flex-shrink-0"
              onClick={() => handleSubmit()}
              disabled={!selectedSchema || !input.trim() || isLoading}
            >
              <Send className="w-6 h-6" />
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground text-center mt-2">
            QueryCraft generates read-only SQL queries. Always verify results.
          </p>
        </div>
      </div>
    </div>
  );
}
