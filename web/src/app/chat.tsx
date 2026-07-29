"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [error, setError] = useState("");
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
    setError("");
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
      setError("Could not get an answer. Check that the API is running.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="flex min-h-[560px] flex-col overflow-hidden rounded-2xl border bg-card/95 shadow-xl shadow-sky-950/5 md:min-h-[640px]">
      <div className="border-b px-4 py-3 md:px-5 md:py-4">
        <h2 className="font-heading text-xl font-semibold tracking-normal text-primary md:text-2xl">
          Pet assistant
        </h2>
        <p className="text-sm text-zinc-600">
          Products, vet care, grooming, adoption, lost and found.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 md:px-5 md:py-5">
        {messages.map((message) => (
          <article
            key={message.id}
            className={`max-w-[92%] break-words rounded-lg px-4 py-3 text-sm leading-6 md:max-w-[82%] ${
              message.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
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
        ))}

        {isSending ? (
          <p className="text-sm text-zinc-500">Thinking...</p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="border-t p-3 md:p-4">
        {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
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
