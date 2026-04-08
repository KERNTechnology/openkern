import type { GlobalConfig } from "payload";
import { anyone, authenticated } from "../access";

export const Footer: GlobalConfig = {
  slug: "footer",
  access: {
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: "Navigation",
    description:
      "Fußzeile Ihrer Website. Organisieren Sie Links in Spalten und fügen Sie Social-Media-Profile hinzu.",
  },
  fields: [
    {
      name: "columns",
      type: "array",
      maxRows: 4,
      fields: [
        {
          name: "heading",
          type: "text",
          required: true,
          admin: {
            description:
              "Überschrift der Spalte (z.B. 'Unternehmen', 'Leistungen').",
          },
        },
        {
          name: "links",
          type: "array",
          maxRows: 6,
          fields: [
            {
              name: "label",
              type: "text",
              required: true,
            },
            {
              name: "url",
              type: "text",
              required: true,
            },
          ],
        },
      ],
      admin: {
        initCollapsed: true,
        description:
          "Link-Spalten im Footer. Maximal 4 Spalten mit je bis zu 6 Links.",
      },
    },
    {
      name: "copyright",
      type: "text",
      admin: {
        description:
          "Copyright-Text am unteren Rand (z.B. '© 2026 Meine Firma').",
      },
    },
    {
      name: "socialLinks",
      type: "array",
      maxRows: 6,
      admin: {
        description:
          "Social-Media-Profile. Werden als Icons im Footer angezeigt.",
      },
      fields: [
        {
          name: "platform",
          type: "select",
          options: [
            { label: "LinkedIn", value: "linkedin" },
            { label: "X / Twitter", value: "twitter" },
            { label: "Instagram", value: "instagram" },
            { label: "GitHub", value: "github" },
            { label: "YouTube", value: "youtube" },
          ],
          required: true,
        },
        {
          name: "url",
          type: "text",
          required: true,
        },
      ],
    },
  ],
};
