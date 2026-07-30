import { describe, it, expect, vi } from "vitest";
import {
  authenticated,
  authenticatedOrPublished,
  anyone,
  isAdmin,
  isAdminOrSelf,
} from "../access";
import { Users } from "../collections/Users";

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

// ---------------------------------------------------------------------------
// Helpers shared across isAdmin / isAdminOrSelf tests
// ---------------------------------------------------------------------------

function makeAdminArgs() {
  return { req: { user: { id: 1, role: "admin" } } } as Parameters<
    typeof isAdmin
  >[0];
}

function makeEditorArgs(id = 2) {
  return { req: { user: { id, role: "editor" } } } as Parameters<
    typeof isAdmin
  >[0];
}

function makeAnonArgs() {
  return { req: { user: null } } as Parameters<typeof isAdmin>[0];
}

// ---------------------------------------------------------------------------
// isAdmin
// ---------------------------------------------------------------------------

describe("isAdmin", () => {
  it("returns true for a user with role=admin", () => {
    expect(isAdmin(makeAdminArgs())).toBe(true);
  });

  it("returns false for a user with role=editor", () => {
    expect(isAdmin(makeEditorArgs())).toBe(false);
  });

  it("returns false when user is null (anonymous)", () => {
    expect(isAdmin(makeAnonArgs())).toBe(false);
  });

  it("returns false when user is undefined", () => {
    expect(
      // Double-cast through unknown: { req: { user: undefined } } doesn't
      // match the full PayloadRequest shape, so a direct as-cast is rejected.
      isAdmin(

        { req: { user: undefined } } as unknown as Parameters<typeof isAdmin>[0],
      ),
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isAdminOrSelf
// ---------------------------------------------------------------------------

describe("isAdminOrSelf", () => {
  it("returns true for an admin user", () => {
    expect(isAdminOrSelf(makeAdminArgs())).toBe(true);
  });

  it("returns a query constraint for a non-admin authenticated user", () => {
    const result = isAdminOrSelf(makeEditorArgs(42));
    // Payload applies this constraint at the DB level: only own record matches.
    expect(result).toEqual({ id: { equals: 42 } });
  });

  it("the query constraint uses the user's own id", () => {
    const result = isAdminOrSelf(makeEditorArgs(99));
    expect(result).toEqual({ id: { equals: 99 } });
  });

  it("returns false for an anonymous user", () => {
    expect(isAdminOrSelf(makeAnonArgs())).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Bootstrap hook: first-user-becomes-admin
// ---------------------------------------------------------------------------

describe("Users bootstrap hook (first user becomes admin)", () => {
  const bootstrapHook = Users.hooks?.beforeChange?.[0];

  it("hook is defined on the Users collection", () => {
    expect(bootstrapHook).toBeDefined();
  });

  it("forces role to admin when the collection is empty (first user)", async () => {
    const countMock = vi.fn().mockResolvedValue({ totalDocs: 0 });
    const args = {
      data: { email: "first@example.com", role: "editor" },
      operation: "create" as const,
      req: { payload: { count: countMock } },
    };


    const result = await bootstrapHook!(args as any);

    expect(countMock).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "users" }),
    );
    expect(result).toMatchObject({ role: "admin" });
  });

  it("does not override role when other users already exist", async () => {
    const countMock = vi.fn().mockResolvedValue({ totalDocs: 3 });
    const args = {
      data: { email: "new@example.com", role: "editor" },
      operation: "create" as const,
      req: { payload: { count: countMock } },
    };


    const result = await bootstrapHook!(args as any);

    expect(result).toMatchObject({ role: "editor" });
  });

  it("does nothing on update operations", async () => {
    const countMock = vi.fn();
    const args = {
      data: { role: "editor" },
      operation: "update" as const,
      req: { payload: { count: countMock } },
    };


    const result = await bootstrapHook!(args as any);

    // count should not be called for update operations
    expect(countMock).not.toHaveBeenCalled();
    // data is returned unchanged
    expect(result).toMatchObject({ role: "editor" });
  });
});
