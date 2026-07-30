import { Chat } from "../chat";
import { AppNav } from "../nav";

export default function AssistantPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_70%_20%,oklch(0.9_0.08_210),transparent_34%),linear-gradient(90deg,white,oklch(0.98_0.012_220)_45%,white)] text-foreground">
      <AppNav />
      <section className="mx-auto flex max-w-4xl flex-col gap-5 px-4 pb-8 pt-6 md:px-6 md:pt-10">
        <div className="text-center">
          <p className="mb-2 text-sm font-medium text-primary">Pet assistant</p>
          <h1 className="font-heading text-3xl font-normal leading-tight md:text-4xl">
            Ask PawConnect
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
            Get help with products, vet care, grooming, adoption, and lost pets.
          </p>
        </div>
        <Chat />
      </section>
    </main>
  );
}
