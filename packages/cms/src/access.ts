import type { Access, AccessArgs } from "payload";

export const authenticated = ({ req: { user } }: AccessArgs): boolean =>
  Boolean(user);

export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (user) return true;
  return { _status: { equals: "published" } };
};

export const anyone = (): boolean => true;
