"use client";

import { FormEvent, useState } from "react";
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
    <section className="flex min-h-[calc(100vh-10rem)] flex-col rounded-lg border bg-card">
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold">Pet assistant</h2>
        <p className="text-sm text-zinc-600">
          Products, vet care, grooming, adoption, lost and found.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.map((message) => (
          <article
            key={message.id}
            className={`max-w-[82%] rounded px-4 py-3 text-sm leading-6 ${
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

      <form onSubmit={handleSubmit} className="border-t p-4">
        {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
        <div className="flex gap-3">
          <input
            className="min-w-0 flex-1 rounded-md border bg-background px-4 py-3 text-sm outline-none focus:border-ring"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="How often should I groom a Persian cat?"
            aria-label="Pet care question"
          />
          <Button disabled={!input.trim() || isSending} size="lg" type="submit">
            Send
          </Button>
        </div>
      </form>
    </section>
  );
}
