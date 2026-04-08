import type { GlobalConfig } from "payload";
import { anyone, authenticated } from "../access";

export const Header: GlobalConfig = {
  slug: "header",
  access: {
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: "Navigation",
    description:
      "Bearbeiten Sie hier die Navigation Ihrer Website. Änderungen werden sofort auf allen Seiten sichtbar.",
  },
  fields: [
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "navItems",
      type: "array",
      maxRows: 8,
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
          admin: {
            description: "Angezeigter Text des Links.",
          },
        },
        {
          name: "url",
          type: "text",
          required: true,
          admin: {
            description: "Ziel-URL (z.B. /leistungen oder https://example.com).",
          },
        },
        {
          name: "openInNewTab",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description:
              "Link in neuem Tab öffnen (empfohlen für externe Links).",
          },
        },
      ],
      admin: {
        initCollapsed: true,
        description:
          "Navigationslinks in der Kopfzeile. Maximal 8 Einträge. Reihenfolge per Drag & Drop ändern.",
      },
    },
    {
      name: "ctaButton",
      type: "group",
      admin: {
        description:
          "Optionaler hervorgehobener Button rechts in der Navigation.",
      },
      fields: [
        {
          name: "enabled",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description: "Button ein- oder ausblenden.",
          },
        },
        {
          name: "label",
          type: "text",
          admin: {
            description:
              "Button-Text (z.B. 'Kontakt' oder 'Angebot anfordern').",
          },
        },
        {
          name: "url",
          type: "text",
          admin: {
            description: "Ziel-URL des Buttons.",
          },
        },
      ],
    },
  ],
};
