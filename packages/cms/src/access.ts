import type { Access, AccessArgs } from "payload";
import type { User } from "@/payload-types";

export const authenticated = ({ req: { user } }: AccessArgs): boolean =>
  Boolean(user);

export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (user) return true;
  return { _status: { equals: "published" } };
};

export const anyone = (): boolean => true;

/**
 * True only when the requesting user holds the admin role.
 * Typed against Pick<AccessArgs, 'req'> (= { req: PayloadRequest }) so
 * TypeScript accepts it for both collection-level Access and field-level
 * FieldAccess slots — both AccessArgs and FieldAccessArgs are structural
 * subtypes of { req: PayloadRequest } and satisfy the contravariant check.
 */
export const isAdmin = ({ req: { user } }: Pick<AccessArgs, "req">): boolean => {
  const typedUser = user as User | null;
  return typedUser?.role === "admin";
};

/**
 * Admins may act on any record.
 * Non-admin authenticated users may act only on their own record — Payload
 * enforces this at the database level via the returned query constraint.
 * Anonymous users are denied.
 */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false;
  const typedUser = user as User;
  if (typedUser.role === "admin") return true;
  // Return a query constraint so Payload enforces the restriction at DB level.
  return { id: { equals: typedUser.id } };
};
