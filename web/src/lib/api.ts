const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function getHealth() {
  const response = await fetch(`${apiUrl}/health`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("API health check failed");
  }

  return response.json() as Promise<{ status: string; database: string }>;
}

export type ChatCitation = {
  title: string;
  category: string;
};

export type ChatResponse = {
  sessionId: string;
  answer: string;
  citations: ChatCitation[];
};

export async function sendChatMessage(input: {
  sessionId?: string;
  message: string;
}) {
  const response = await fetch(`${apiUrl}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Chat request failed");
  }

  return response.json() as Promise<ChatResponse>;
}
