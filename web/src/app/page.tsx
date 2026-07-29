import { getHealth } from "@/lib/api";

export default async function Home() {
  let apiStatus = "offline";

  try {
    const health = await getHealth();
    apiStatus = `${health.status}, database ${health.database}`;
  } catch {
    apiStatus = "offline";
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-8 text-zinc-950">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col gap-8">
        <header className="flex items-center justify-between border-b border-zinc-200 pb-5">
          <div>
            <p className="text-sm font-medium text-emerald-700">Paw Connect</p>
            <h1 className="text-3xl font-semibold tracking-normal">
              Pet care assistant
            </h1>
          </div>
          <p className="text-sm text-zinc-600">API: {apiStatus}</p>
        </header>

        <div className="grid flex-1 place-items-center rounded border border-dashed border-zinc-300 bg-white p-8 text-center">
          <div className="max-w-md">
            <h2 className="text-xl font-semibold">Web foundation ready</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Next step is the chat interface connected to the backend RAG
              endpoint.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
