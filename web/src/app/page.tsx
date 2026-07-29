import { Chat } from "./chat";
import { AppNav } from "./nav";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <AppNav />
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-8">
        <div id="chat">
          <Chat />
        </div>
      </section>
    </main>
  );
}
