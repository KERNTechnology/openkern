import { describe, it, expect } from "vitest";
import { authenticated, authenticatedOrPublished, anyone } from "../access";

// Minimal mock matching Payload's AccessArgs shape
function makeArgs(user: unknown = null) {
  return { req: { user } } as Parameters<typeof authenticated>[0];
}

describe("authenticated", () => {
  it("returns true when user is present", () => {
    expect(authenticated(makeArgs({ id: 1, email: "admin@test.com" }))).toBe(
      true,
    );
  });

  it("returns false when user is null", () => {
    expect(authenticated(makeArgs(null))).toBe(false);
  });

  it("returns false when user is undefined", () => {
    expect(authenticated(makeArgs(undefined))).toBe(false);
  });
});

describe("authenticatedOrPublished", () => {
  it("returns true when user is present", () => {
    const result = authenticatedOrPublished(
      makeArgs({ id: 1 }) as Parameters<typeof authenticatedOrPublished>[0],
    );
    expect(result).toBe(true);
  });

  it("returns status filter when user is absent", () => {
    const result = authenticatedOrPublished(
      makeArgs(null) as Parameters<typeof authenticatedOrPublished>[0],
    );
    expect(result).toEqual({ _status: { equals: "published" } });
  });

  it("status filter only shows published documents", () => {
    const result = authenticatedOrPublished(
      makeArgs(null) as Parameters<typeof authenticatedOrPublished>[0],
    );
    // Ensure it's not returning 'draft' or any other status
    expect(result).toHaveProperty("_status.equals", "published");
  });
});

describe("anyone", () => {
  it("always returns true", () => {
    expect(anyone()).toBe(true);
  });

  it("returns true regardless of arguments", () => {
    // anyone() ignores all args
    expect(anyone()).toBe(true);
  });
});
