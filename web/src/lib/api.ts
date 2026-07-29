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
