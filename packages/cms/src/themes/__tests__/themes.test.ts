import { describe, it, expect } from "vitest";
import { getThemeComponents, isValidTheme } from "../index";

describe("isValidTheme", () => {
  it("accepts 'minimal'", () => {
    expect(isValidTheme("minimal")).toBe(true);
  });

  it("accepts 'bold'", () => {
    expect(isValidTheme("bold")).toBe(true);
  });

  it("accepts 'corporate'", () => {
    expect(isValidTheme("corporate")).toBe(true);
  });

  it("rejects unknown theme names", () => {
    expect(isValidTheme("dark")).toBe(false);
    expect(isValidTheme("")).toBe(false);
    expect(isValidTheme("MINIMAL")).toBe(false);
  });

  it("rejects undefined and null", () => {
    expect(isValidTheme(undefined)).toBe(false);
    expect(isValidTheme(null)).toBe(false);
  });
});

describe("getThemeComponents", () => {
  const ALL_COMPONENT_KEYS = [
    "Header",
    "Footer",
    "Hero",
    "Services",
    "Portfolio",
    "Testimonials",
    "CTA",
    "BlogCard",
    "PageLayout",
  ] as const;

  it("returns all required components for 'minimal'", () => {
    const components = getThemeComponents("minimal");
    for (const key of ALL_COMPONENT_KEYS) {
      expect(components[key]).toBeDefined();
      expect(typeof components[key]).toBe("function");
    }
  });

  it("returns all required components for 'bold'", () => {
    const components = getThemeComponents("bold");
    for (const key of ALL_COMPONENT_KEYS) {
      expect(components[key]).toBeDefined();
      expect(typeof components[key]).toBe("function");
    }
  });

  it("returns all required components for 'corporate'", () => {
    const components = getThemeComponents("corporate");
    for (const key of ALL_COMPONENT_KEYS) {
      expect(components[key]).toBeDefined();
      expect(typeof components[key]).toBe("function");
    }
  });

  it("returns different component sets for each theme", () => {
    const minimal = getThemeComponents("minimal");
    const bold = getThemeComponents("bold");
    const corporate = getThemeComponents("corporate");

    // At least Hero should differ between themes
    expect(minimal.Hero).not.toBe(bold.Hero);
    expect(bold.Hero).not.toBe(corporate.Hero);
  });

  it("falls back to minimal for unknown theme names", () => {
    const minimal = getThemeComponents("minimal");
    // Force an invalid name through the type system
    const fallback = getThemeComponents("nonexistent" as "minimal");
    expect(fallback).toBe(minimal);
  });
});
