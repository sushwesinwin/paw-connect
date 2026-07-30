import Image from "next/image";
import { PawPrint } from "lucide-react";
import { PetListing } from "@/lib/api";
import { SharePostButton } from "./share-post-button";

export function LostFoundFeed({ posts }: { posts: PetListing[] }) {
  if (!posts.length) {
    return (
      <div className="rounded-2xl border border-dashed bg-white/70 px-4 py-8 text-center">
        <p className="font-heading text-lg font-medium">No posts yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create the first lost or found report.
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[640px] snap-y snap-mandatory space-y-4 overflow-y-auto rounded-2xl pr-1 [-webkit-overflow-scrolling:touch]">
      {posts.map((post) => (
        <article
          key={post.id}
          className="snap-start overflow-hidden rounded-2xl border bg-white shadow-lg shadow-sky-950/5"
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <PawPrint className="size-5" aria-hidden="true" />
              </span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-heading text-base font-semibold">
                PawConnect Lost & Found
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {post.type === "LOST" ? "Lost" : "Found"}
            </span>
          </div>

          {post.imageUrl ? (
            <div className="relative aspect-[16/10] bg-muted">
              <Image
                src={post.imageUrl}
                alt={post.petName ?? `${post.type.toLowerCase()} pet`}
                fill
                sizes="(min-width: 768px) 960px, 100vw"
                className="object-cover"
                unoptimized
              />
            </div>
          ) : null}

          <div className="px-4 pb-4">
            <h4 className="mt-4 font-heading text-2xl font-normal leading-tight">
              {post.petName ?? post.petType}
            </h4>
            <p className="mt-2 text-sm text-muted-foreground">
              {post.petType}
              {post.breed ? ` · ${post.breed}` : ""}
            </p>
            <p className="mt-3 text-sm leading-6 text-foreground">
              {post.description}
            </p>
            <div className="mt-4 rounded-xl border bg-muted/60 px-3 py-2.5">
              <p className="text-xs text-muted-foreground">Last seen / found at</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                {post.location}
              </p>
            </div>
          </div>

          <div className="border-t px-3 py-2">
            <SharePostButton
              text={`${post.type === "LOST" ? "Lost" : "Found"} ${post.petName ?? post.petType} near ${post.location}`}
            />
          </div>
        </article>
      ))}
      <p className="pb-1 text-center text-xs text-muted-foreground">
        Scroll for more posts
      </p>
    </div>
  );
}
