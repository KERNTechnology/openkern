import type { CollectionConfig } from "payload";
import { authenticated, isAdmin, isAdminOrSelf } from "../access";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "role", "updatedAt"],
    description:
      "Benutzer mit Zugriff auf das Admin-Panel. Jeder Benutzer hat eine Rolle (Admin oder Editor).",
  },
  access: {
    // Any authenticated user may read the user list (admin panel needs this).
    read: authenticated,
    // Only admins may create new users.
    create: isAdmin,
    // Admins may update anyone; non-admins may only update their own record.
    update: isAdminOrSelf,
    // Only admins may delete users.
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      /**
       * Bootstrap hook: when the very first user is created (collection is
       * empty), force role to 'admin' so there is always at least one admin.
       * This runs server-side and is not subject to field-level access checks,
       * so it safely overrides whatever value field access stripped from the
       * incoming request.
       */
      async ({ data, operation, req }) => {
        if (operation !== "create") return data;

        const { totalDocs } = await req.payload.count({
          collection: "users",
          req, // Stay in the same transaction for atomicity.
        });

        if (totalDocs === 0) {
          data.role = "admin";
        }

        return data;
      },
    ],
  },
  fields: [
    {
      name: "role",
      type: "select",
      defaultValue: "editor",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
      required: true,
      // Field-level access: only admins may set or change the role.
      // Editors cannot escalate their own role via API.
      access: {
        create: isAdmin,
        update: isAdmin,
      },
      admin: {
        description:
          "Admin: voller Zugriff. Editor: kann Inhalte bearbeiten, aber keine Einstellungen ändern.",
      },
    },
    {
      name: "firstName",
      type: "text",
      admin: {
        description: "Vorname des Benutzers.",
      },
    },
    {
      name: "lastName",
      type: "text",
      admin: {
        description: "Nachname des Benutzers.",
      },
    },
  ],
};
