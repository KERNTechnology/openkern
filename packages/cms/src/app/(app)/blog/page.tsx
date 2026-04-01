import React from "react";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";

export const metadata: Metadata = {
  title: "Blog",
  description: "Neuigkeiten und Artikel rund um OpenKERN, Payload CMS und moderne Web-Architektur.",
};

async function getPosts() {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "posts",
      sort: "-publishedAt",
      limit: 20,
    });
    return result.docs;
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main className="light-section section">
      <div className="container" style={{ maxWidth: "800px" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: 700, letterSpacing: "-0.025em", marginBottom: "0.5rem" }}>
          Blog
        </h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "3rem" }}>
          Neuigkeiten und Artikel rund um den Stack.
        </p>

        {posts.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>Noch keine Beiträge vorhanden.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {posts.map((post) => (
              <a
                key={post.id}
                href={`/blog/${post.slug}`}
                style={{
                  display: "block",
                  padding: "1.5rem",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--color-border)",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}
                className="post-card"
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>{post.title}</h2>
                  {post.category && (
                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      padding: "0.125rem 0.5rem",
                      borderRadius: "9999px",
                      background: "var(--color-primary)",
                      color: "#fff",
                    }}>
                      {post.category}
                    </span>
                  )}
                </div>
                {post.excerpt && (
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                    {post.excerpt}
                  </p>
                )}
                {post.publishedAt && (
                  <time style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: "0.75rem", display: "block" }}>
                    {new Date(post.publishedAt).toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" })}
                  </time>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
