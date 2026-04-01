import React from "react";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";

async function getPost(slug: string) {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "posts",
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
  const post = await getPost(slug);
  if (!post) return {};
  const meta = post.meta as
    | { title?: string | null; description?: string | null }
    | undefined;
  return {
    title: meta?.title ?? post.title,
    description: meta?.description ?? post.excerpt ?? undefined,
  };
}

export default async function PostRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <main className="light-section section">
      <div className="container" style={{ maxWidth: "800px" }}>
        <a href="/blog" style={{ fontSize: "0.875rem", color: "var(--color-primary)", marginBottom: "2rem", display: "inline-block" }}>
          &larr; Alle Beiträge
        </a>

        <h1 style={{ fontSize: "2.25rem", fontWeight: 700, letterSpacing: "-0.025em", marginBottom: "0.75rem" }}>
          {post.title}
        </h1>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "2rem", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          {post.publishedAt && (
            <time>
              {new Date(post.publishedAt).toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" })}
            </time>
          )}
          {post.category && (
            <span style={{
              padding: "0.125rem 0.5rem",
              borderRadius: "9999px",
              background: "var(--color-primary)",
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: 500,
            }}>
              {post.category}
            </span>
          )}
        </div>

        {post.content && (
          <div className="rich-text">
            <RichText data={post.content} />
          </div>
        )}
      </div>
    </main>
  );
}
