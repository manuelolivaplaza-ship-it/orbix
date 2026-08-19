"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart, type UIMessage } from "ai";
import { ArrowUp, Loader2, Paperclip, Square, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Orb } from "@/components/orb/Orb";
import { useChrome } from "@/components/layout/chrome";
import { ToolCards } from "./ToolCard";
import { compactWorkspace } from "@/lib/ai/snapshot";
import { mutationsFromToolOutput, type AgentMutation } from "@/lib/ai/mutations";
import { parseChatFile, type ChatAttachment } from "@/lib/ai/spreadsheet";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "¿Qué tengo vencido?",
  "Crea una factura de prueba",
  "Avísame de la cobranza",
];

function chatKey(userId: string) {
  return `orbix.chat.v1.${userId}`;
}

function loadMessages(userId: string): UIMessage[] {
  try {
    const raw = window.localStorage.getItem(chatKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UIMessage[];
    return Array.isArray(parsed) ? parsed.slice(-48) : [];
  } catch {
    return [];
  }
}

function saveMessages(userId: string, messages: UIMessage[]) {
  try {
    window.localStorage.setItem(chatKey(userId), JSON.stringify(messages.slice(-48)));
  } catch {
    /* ignore */
  }
}

function textOf(message: UIMessage) {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function OrbChat() {
  const { state, session, applyAgentMutations } = useStore();
  const { setOrbState } = useChrome();
  const userId = session?.userId ?? "anon";
  const appliedRef = useRef(new Set<string>());
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [initial] = useState(() => {
    const saved = loadMessages(userId);
    for (const message of saved) {
      for (const part of message.parts) {
        if (isToolUIPart(part)) appliedRef.current.add(part.toolCallId);
      }
    }
    return saved;
  });
  const workspaceRef = useRef(compactWorkspace(state));
  workspaceRef.current = compactWorkspace(state);
  const filesRef = useRef<ChatAttachment[]>([]);
  const scroller = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({
          workspace: workspaceRef.current,
          attachments: filesRef.current,
        }),
      }),
    [],
  );

  const { messages, sendMessage, status, error, stop, setMessages } = useChat({
    transport,
    messages: initial,
  });

  useEffect(() => {
    fetch("/api/ai/status")
      .then((res) => res.json())
      .then((data: { configured?: boolean }) => setConfigured(Boolean(data.configured)))
      .catch(() => setConfigured(false));
  }, []);

  useEffect(() => {
    if (status === "submitted" || status === "streaming") setOrbState("thinking");
    else if (error) setOrbState("error");
    else setOrbState("idle");
    return () => setOrbState("idle");
  }, [status, error, setOrbState]);

  useEffect(() => {
    saveMessages(userId, messages);
  }, [messages, userId]);

  useEffect(() => {
    const next: AgentMutation[] = [];
    for (const message of messages) {
      if (message.role !== "assistant") continue;
      for (const part of message.parts) {
        if (!isToolUIPart(part) || part.state !== "output-available") continue;
        if (appliedRef.current.has(part.toolCallId)) continue;
        const found = mutationsFromToolOutput(part.output);
        if (!found.length) continue;
        appliedRef.current.add(part.toolCallId);
        next.push(...found);
      }
    }
    if (next.length) applyAgentMutations(next);
  }, [messages, applyAgentMutations]);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, status]);

  const busy = status === "submitted" || status === "streaming";

  async function submit(text?: string) {
    const content = (text ?? input).trim();
    if ((!content && !files.length) || busy) return;
    let attachments: ChatAttachment[] = [];
    if (files.length) {
      attachments = await Promise.all(files.map(parseChatFile));
    }
    filesRef.current = attachments;
    const names = attachments.map((file) => file.name).join(", ");
    const payload = names
      ? `${content || "Revisa este archivo."}\n\nAdjuntos: ${names}`
      : content;
    sendMessage({ text: payload });
    setInput("");
    setFiles([]);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-2 py-1">
        <p className="text-[11px] font-medium text-muted-foreground">Orb</p>
        {messages.length ? (
          <button
            type="button"
            onClick={() => {
              setMessages([]);
              appliedRef.current.clear();
              saveMessages(userId, []);
            }}
            className="text-[11px] text-muted-foreground outline-none hover:text-foreground"
          >
            Nueva
          </button>
        ) : null}
      </div>

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[12rem] flex-col items-center justify-center px-2 text-center">
            <Orb size={44} state={busy ? "thinking" : "idle"} playful />
            <p className="mt-3 text-sm font-medium">Hola, soy Orb.</p>
            <p className="mt-1 max-w-[16rem] text-[12px] leading-snug text-muted-foreground">
              Puedo facturar, leer un Excel, avisar cobranzas y mover la oficina.
            </p>
            {configured === false ? (
              <p className="mt-3 max-w-[16rem] rounded-md border border-sidebar-border bg-sidebar-accent/50 px-2 py-1.5 text-[11px] leading-snug text-muted-foreground">
                Falta <span className="font-medium text-foreground">OPENCODE_API_KEY</span> de
                OpenCode Go en <span className="font-medium text-foreground">.env.local</span>.
              </p>
            ) : (
              <div className="mt-3 flex flex-col gap-1.5">
                {SUGGESTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => void submit(item)}
                    className="rounded-md border border-sidebar-border px-2.5 py-1 text-[11px] text-sidebar-foreground/80 hover:bg-sidebar-accent"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-1">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex flex-col gap-1.5", message.role === "user" && "items-end")}
              >
                {message.role === "assistant" ? <ToolCards message={message} /> : null}
                {textOf(message) ? (
                  <div
                    className={cn(
                      "max-w-[95%] text-[13px] leading-snug whitespace-pre-wrap",
                      message.role === "user"
                        ? "rounded-md bg-sidebar-accent px-2.5 py-1.5 text-sidebar-accent-foreground"
                        : "text-sidebar-foreground",
                    )}
                  >
                    {textOf(message)}
                  </div>
                ) : null}
              </div>
            ))}
            {busy && messages.at(-1)?.role === "user" ? (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                Orb está trabajando…
              </div>
            ) : null}
            {error ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/5 px-2 py-1.5 text-[11px] text-destructive">
                {error.message.includes("503") || error.message.toLowerCase().includes("opencode")
                  ? "Orb no está conectado. Configura OPENCODE_API_KEY (OpenCode Go)."
                  : "No pude completar eso. Inténtalo de nuevo."}
              </p>
            ) : null}
          </div>
        )}
      </div>

      {files.length ? (
        <div className="flex flex-wrap gap-1 px-2 pb-1">
          {files.map((file) => (
            <span
              key={`${file.name}-${file.size}`}
              className="inline-flex items-center gap-1 rounded-md border border-sidebar-border bg-sidebar-accent/50 px-1.5 py-0.5 text-[10px]"
            >
              {file.name}
              <button
                type="button"
                aria-label={`Quitar ${file.name}`}
                onClick={() => setFiles((prev) => prev.filter((item) => item !== file))}
              >
                <X className="size-2.5" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <form
        className="border-t border-sidebar-border p-2"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div className="flex items-end gap-1 rounded-md border border-sidebar-border bg-sidebar p-1">
          <label className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[5px] text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground">
            <Paperclip className="size-3.5" />
            <input
              type="file"
              className="sr-only"
              accept=".xlsx,.xls,.csv,.txt,.json"
              multiple
              onChange={(event) => {
                const next = Array.from(event.target.files ?? []);
                if (next.length) setFiles((prev) => [...prev, ...next].slice(0, 4));
                event.target.value = "";
              }}
            />
          </label>
          <textarea
            value={input}
            rows={1}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void submit();
              }
            }}
            placeholder="Pídele a Orb…"
            disabled={busy && status !== "streaming"}
            className="max-h-24 min-h-7 flex-1 resize-none bg-transparent px-1 py-1.5 text-[13px] outline-none placeholder:text-muted-foreground"
          />
          {busy ? (
            <button
              type="button"
              onClick={() => stop()}
              className="inline-flex size-7 items-center justify-center rounded-[5px] bg-foreground text-background"
              aria-label="Detener"
            >
              <Square className="size-3" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() && !files.length}
              className="inline-flex size-7 items-center justify-center rounded-[5px] bg-foreground text-background disabled:opacity-40"
              aria-label="Enviar"
            >
              <ArrowUp className="size-3.5" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
