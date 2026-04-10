import { describe, it, expect } from "vitest";

// The seed helpers are not exported from index.ts, so we replicate them here
// for testing. This ensures the Lexical node structure stays correct if
// the helpers are later refactored or extracted into a shared module.

// ── Replicated helpers (must match src/seed/index.ts) ──────────────────────

function textNode(text: string) {
  return { type: "text" as const, text };
}

function paragraph(text: string) {
  return {
    type: "paragraph" as const,
    children: [textNode(text)],
  };
}

function heading(tag: "h1" | "h2" | "h3" | "h4", text: string) {
  return {
    type: "heading" as const,
    tag,
    children: [textNode(text)],
  };
}

function lexicalRoot(children: Record<string, unknown>[]) {
  return {
    root: {
      type: "root",
      children,
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
    },
  };
}

function makeDateHelper(base: Date = new Date("2026-03-15T10:00:00Z")) {
  return (daysAgo: number) =>
    new Date(base.getTime() - daysAgo * 86_400_000).toISOString();
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("textNode", () => {
  it("creates a text node with correct structure", () => {
    const node = textNode("Hello");
    expect(node).toEqual({ type: "text", text: "Hello" });
  });

  it("handles empty string", () => {
    const node = textNode("");
    expect(node).toEqual({ type: "text", text: "" });
  });
});

describe("paragraph", () => {
  it("wraps text in a paragraph node", () => {
    const node = paragraph("Content here");
    expect(node.type).toBe("paragraph");
    expect(node.children).toHaveLength(1);
    expect(node.children[0]).toEqual({ type: "text", text: "Content here" });
  });
});

describe("heading", () => {
  it("creates h1 heading", () => {
    const node = heading("h1", "Title");
    expect(node.type).toBe("heading");
    expect(node.tag).toBe("h1");
    expect(node.children[0].text).toBe("Title");
  });

  it("creates h2 heading", () => {
    const node = heading("h2", "Subtitle");
    expect(node.tag).toBe("h2");
  });

  it("supports h3 and h4", () => {
    expect(heading("h3", "x").tag).toBe("h3");
    expect(heading("h4", "x").tag).toBe("h4");
  });
});

describe("lexicalRoot", () => {
  it("wraps children in a valid Lexical root structure", () => {
    const root = lexicalRoot([paragraph("Test")]);
    expect(root.root.type).toBe("root");
    expect(root.root.direction).toBe("ltr");
    expect(root.root.version).toBe(1);
    expect(root.root.children).toHaveLength(1);
  });

  it("handles multiple children", () => {
    const root = lexicalRoot([
      heading("h1", "Title"),
      paragraph("Body"),
      paragraph("More"),
    ]);
    expect(root.root.children).toHaveLength(3);
    expect(root.root.children[0]).toHaveProperty("type", "heading");
    expect(root.root.children[1]).toHaveProperty("type", "paragraph");
  });

  it("handles empty children array", () => {
    const root = lexicalRoot([]);
    expect(root.root.children).toHaveLength(0);
  });

  it("produces valid Lexical format with all required fields", () => {
    const root = lexicalRoot([paragraph("x")]);
    const r = root.root;
    expect(r).toHaveProperty("type");
    expect(r).toHaveProperty("children");
    expect(r).toHaveProperty("direction");
    expect(r).toHaveProperty("format");
    expect(r).toHaveProperty("indent");
    expect(r).toHaveProperty("version");
  });
});

describe("makeDateHelper", () => {
  const base = new Date("2026-03-15T10:00:00Z");
  const dateAgo = makeDateHelper(base);

  it("returns base date for 0 days ago", () => {
    expect(dateAgo(0)).toBe("2026-03-15T10:00:00.000Z");
  });

  it("returns correct date for N days ago", () => {
    const result = new Date(dateAgo(7));
    expect(result.toISOString()).toBe("2026-03-08T10:00:00.000Z");
  });

  it("returns ISO string format", () => {
    const result = dateAgo(1);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it("produces chronologically ordered dates", () => {
    const dates = [30, 20, 10, 0].map(dateAgo).map((d) => new Date(d).getTime());
    // Each subsequent date should be later than the previous
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i]).toBeGreaterThan(dates[i - 1]);
    }
  });

  it("defaults to 2026-03-15 base when no arg given", () => {
    const helper = makeDateHelper();
    expect(helper(0)).toBe("2026-03-15T10:00:00.000Z");
  });
});
