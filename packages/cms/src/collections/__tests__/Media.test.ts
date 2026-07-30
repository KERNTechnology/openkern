import { describe, it, expect } from "vitest";
import { Media } from "../Media";

const mimeTypes = (Media.upload as { mimeTypes?: string[] }).mimeTypes ?? [];

describe("Media collection upload.mimeTypes (SVG XSS mitigation)", () => {
  it("does not include the image/* wildcard", () => {
    expect(mimeTypes).not.toContain("image/*");
  });

  it("does not include image/svg+xml", () => {
    expect(mimeTypes).not.toContain("image/svg+xml");
  });

  it("includes image/jpeg", () => {
    expect(mimeTypes).toContain("image/jpeg");
  });

  it("includes image/png", () => {
    expect(mimeTypes).toContain("image/png");
  });

  it("includes image/webp", () => {
    expect(mimeTypes).toContain("image/webp");
  });

  it("includes image/gif", () => {
    expect(mimeTypes).toContain("image/gif");
  });

  it("includes image/avif", () => {
    expect(mimeTypes).toContain("image/avif");
  });

  it("includes application/pdf", () => {
    expect(mimeTypes).toContain("application/pdf");
  });

  it("contains exactly the expected types and nothing else", () => {
    expect(mimeTypes.slice().sort()).toEqual(
      [
        "application/pdf",
        "image/avif",
        "image/gif",
        "image/jpeg",
        "image/png",
        "image/webp",
      ].sort(),
    );
  });
});
