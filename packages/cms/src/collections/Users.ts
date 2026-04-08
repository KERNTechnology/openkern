import type { CollectionConfig } from "payload";
import { authenticated } from "../access";

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
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
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
