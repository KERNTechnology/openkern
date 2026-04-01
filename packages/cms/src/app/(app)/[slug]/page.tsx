import React from "react";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";

async function getPage(slug: string) {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "pages",
      where: { slug: { equals: slug } },
      limit: 1,
    });
    return result.docs[0] ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  const meta = page.meta as
    | { title?: string | null; description?: string | null }
    | undefined;
  return {
    title: meta?.title ?? page.title,
    description: meta?.description ?? undefined,
  };
}

export default async function PageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Don't handle "home" here — that's the root page.tsx
  if (slug === "home") notFound();

  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <main className="light-section section">
      <div className="container" style={{ maxWidth: "800px" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: 700, letterSpacing: "-0.025em", marginBottom: "1.5rem" }}>
          {page.title}
        </h1>
        {page.content && (
          <div className="rich-text">
            <RichText data={page.content} />
          </div>
        )}
      </div>
    </main>
  );
}
