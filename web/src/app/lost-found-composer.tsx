"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ImagePlus, MapPin, PawPrint, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { gooeyToast } from "@/components/ui/goey-toaster";
import { Input } from "@/components/ui/input";
import { createListing, ListingType } from "@/lib/api";
import { cn } from "@/lib/utils";

type FormState = {
  type: ListingType;
  petName: string;
  petType: string;
  breed: string;
  location: string;
  description: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  imageUrl: string;
};

const emptyForm: FormState = {
  type: "LOST",
  petName: "",
  petType: "",
  breed: "",
  location: "",
  description: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  imageUrl: "",
};

export function LostFoundComposer() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  function update(name: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      gooeyToast.error("Upload an image file");
      return;
    }

    if (file.size > 750_000) {
      gooeyToast.error("Image is too large", {
        description: "Use an image under 750 KB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => update("imageUrl", String(reader.result));
    reader.readAsDataURL(file);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !form.petType.trim() ||
      !form.location.trim() ||
      !form.description.trim() ||
      !form.imageUrl ||
      !form.contactName.trim() ||
      (!form.contactPhone.trim() && !form.contactEmail.trim())
    ) {
      gooeyToast.error("Missing post details", {
        description:
          "Add an image, species, location, description, name, and one contact.",
      });
      return;
    }

    try {
      setSaving(true);
      await createListing({
        type: form.type,
        petName: optional(form.petName),
        petType: form.petType,
        breed: optional(form.breed),
        location: form.location,
        description: form.description,
        contactName: form.contactName,
        contactPhone: optional(form.contactPhone),
        contactEmail: optional(form.contactEmail),
        imageUrl: optional(form.imageUrl),
      });
      gooeyToast.success("Post created");
      setForm(emptyForm);
      setOpen(false);
      router.refresh();
    } catch (error) {
      gooeyToast.error("Could not create post", {
        description: error instanceof Error ? error.message : "Check the API and try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button className="h-10 rounded-full px-4" onClick={() => setOpen(true)}>
        <PawPrint className="size-4" aria-hidden="true" />
        Create post
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/45 px-2 pb-2 sm:place-items-center sm:px-4 sm:pb-0">
          <form
            className="max-h-[92svh] w-full max-w-xl overflow-y-auto rounded-3xl bg-zinc-950 text-white shadow-2xl"
            onSubmit={submit}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-zinc-950/95 px-4 py-3 backdrop-blur">
              <div className="w-9" />
              <h2 className="font-heading text-xl font-medium">Create post</h2>
              <button
                className="grid size-9 place-items-center rounded-full bg-white/10 text-zinc-300 hover:bg-white/15"
                type="button"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" aria-hidden="true" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            <div className="space-y-3 px-4 py-4">
              <div className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                  <PawPrint className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <Input
                    className="h-10 rounded-full border-white/10 bg-white/10 text-white placeholder:text-zinc-500"
                    placeholder="Your name"
                    value={form.contactName}
                    onChange={(event) => update("contactName", event.target.value)}
                  />
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex h-10 w-full justify-between rounded-full border border-white/10 bg-white/10 px-4 text-sm text-white hover:bg-white/15">
                        {form.type === "LOST" ? "Lost pet" : "Found pet"}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="left-0 right-auto w-full min-w-40 border-white/10 bg-zinc-900">
                        {(["LOST", "FOUND"] as ListingType[]).map((type) => (
                          <DropdownMenuItem
                            key={type}
                            className="text-white hover:bg-white/10"
                            onClick={(event) => {
                              event.currentTarget
                                .closest("details")
                                ?.removeAttribute("open");
                              update("type", type);
                            }}
                          >
                            {type === "LOST" ? "Lost pet" : "Found pet"}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Input
                      className="h-10 rounded-full border-white/10 bg-white/10 text-white placeholder:text-zinc-500"
                      placeholder="Species"
                      value={form.petType}
                      onChange={(event) => update("petType", event.target.value)}
                    />
                  </div>
                </div>
              </div>

              <textarea
                className="min-h-24 w-full resize-none bg-transparent text-xl leading-8 outline-none placeholder:text-zinc-500"
                placeholder="What happened?"
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
              />

              {form.imageUrl ? (
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-white/10">
                  <Image
                    src={form.imageUrl}
                    alt="Post preview"
                    fill
                    sizes="(min-width: 768px) 640px, 100vw"
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/55 text-white"
                    type="button"
                    onClick={() => update("imageUrl", "")}
                  >
                    <X className="size-4" aria-hidden="true" />
                    <span className="sr-only">Remove image</span>
                  </button>
                </div>
              ) : null}

              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  className="h-10 rounded-full border-white/10 bg-white/10 text-white placeholder:text-zinc-500"
                  placeholder="Pet name"
                  value={form.petName}
                  onChange={(event) => update("petName", event.target.value)}
                />
                <Input
                  className="h-10 rounded-full border-white/10 bg-white/10 text-white placeholder:text-zinc-500"
                  placeholder="Breed"
                  value={form.breed}
                  onChange={(event) => update("breed", event.target.value)}
                />
                <Input
                  className="h-10 rounded-full border-white/10 bg-white/10 text-white placeholder:text-zinc-500"
                  placeholder="Phone"
                  value={form.contactPhone}
                  onChange={(event) => update("contactPhone", event.target.value)}
                />
                <Input
                  className="h-10 rounded-full border-white/10 bg-white/10 text-white placeholder:text-zinc-500"
                  placeholder="Email"
                  type="email"
                  value={form.contactEmail}
                  onChange={(event) => update("contactEmail", event.target.value)}
                />
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="font-medium">Add to your post</p>
                  <div className="flex items-center gap-2">
                    <label className="grid size-10 cursor-pointer place-items-center rounded-full text-emerald-400 hover:bg-white/10">
                      <ImagePlus className="size-5" aria-hidden="true" />
                      <input
                        accept="image/*"
                        className="sr-only"
                        type="file"
                        onChange={uploadImage}
                      />
                    </label>
                    <MapPin className="size-5 text-primary" aria-hidden="true" />
                  </div>
                </div>
                <Input
                  className="h-10 rounded-full border-white/10 bg-white/10 text-white placeholder:text-zinc-500"
                  placeholder="Last seen / found location"
                  value={form.location}
                  onChange={(event) => update("location", event.target.value)}
                />
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-white/10 bg-zinc-950/95 p-4 backdrop-blur">
              <button
                className={cn(buttonVariants(), "h-11 w-full rounded-full text-base")}
                disabled={saving}
                type="submit"
              >
                {saving ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

function optional(value: string) {
  return value.trim() || undefined;
}
