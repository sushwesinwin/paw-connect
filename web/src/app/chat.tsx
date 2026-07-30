"use client";

import { FormEvent, useState } from "react";
import { Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gooeyToast } from "@/components/ui/goey-toaster";
import { ChatCitation, sendChatMessage } from "@/lib/api";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: ChatCitation[];
};

const starterMessages: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Ask me about pet products, vet care, grooming, adoption, or lost and found pets.",
  },
];

export function Chat() {
  const [sessionId, setSessionId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>(starterMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();
    if (!message || isSending) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await sendChatMessage({ sessionId, message });
      setSessionId(response.sessionId);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.answer,
          citations: response.citations,
        },
      ]);
    } catch {
      gooeyToast.error("Could not get an answer", {
        description: "Check that the API is running.",
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="flex min-h-[620px] flex-col overflow-hidden rounded-3xl border bg-white/90 shadow-xl shadow-sky-950/5 backdrop-blur md:min-h-[680px]">
      <div className="flex items-center justify-between gap-3 border-b bg-card/80 px-4 py-3 md:px-5 md:py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
            <Bot className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-heading text-xl font-semibold tracking-normal text-primary md:text-2xl">
              Milo
            </h2>
            <p className="text-sm text-zinc-600">
              Products, vet care, grooming, adoption, lost and found.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          Online
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,white,oklch(0.98_0.012_220))] px-4 py-4 md:px-5 md:py-5">
        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <div
              key={message.id}
              className={`flex items-start gap-2 ${isUser ? "justify-end" : ""}`}
            >
              {!isUser ? (
                <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Bot className="size-4" aria-hidden="true" />
                </span>
              ) : null}
              <article
                className={`max-w-[calc(100%-2.5rem)] break-words rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm md:max-w-[82%] ${
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "border bg-white text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.citations?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.citations.map((citation) => (
                      <span
                        key={`${citation.title}-${citation.category}`}
                        className="rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground"
                      >
                        {citation.title}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            </div>
          );
        })}

        {isSending ? (
          <p className="text-sm text-zinc-500">Thinking...</p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="border-t bg-white/95 p-3 md:p-4">
        <div className="flex items-center gap-2 rounded-full border bg-background p-1.5">
          <input
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask Milo to do something..."
            aria-label="Pet care question"
          />
          <Button
            className="size-10 shrink-0 rounded-full p-0 sm:h-11 sm:w-auto sm:px-7"
            disabled={!input.trim() || isSending}
            aria-label="Send message"
            type="submit"
          >
            <Send className="size-4 sm:hidden" aria-hidden="true" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </div>
      </form>
    </section>
  );
}
