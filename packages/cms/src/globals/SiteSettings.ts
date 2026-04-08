import type { GlobalConfig } from "payload";
import { anyone, authenticated } from "../access";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  access: {
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: "Settings",
    description:
      "Globale Einstellungen für Ihre Website. Änderungen wirken sich auf die gesamte Seite aus.",
  },
  fields: [
    {
      name: "theme",
      type: "select",
      required: true,
      defaultValue: "minimal",
      options: [
        { label: "Minimal — Clean & Modern", value: "minimal" },
        { label: "Bold — Dark & Dynamic", value: "bold" },
        { label: "Corporate — Professional & Structured", value: "corporate" },
      ],
      admin: {
        description:
          "Visuelles Theme der Website. Änderungen werden sofort auf allen Seiten sichtbar — kein erneutes Deployment nötig.",
      },
    },
    {
      name: "siteName",
      type: "text",
      required: true,
      defaultValue: "My OpenKERN Site",
      admin: {
        description:
          "Name Ihrer Website. Wird im Browser-Tab und in Suchmaschinen angezeigt.",
      },
    },
    {
      name: "siteDescription",
      type: "textarea",
      admin: {
        description:
          "Standard-Beschreibung für Suchmaschinen. Wird verwendet, wenn eine Seite keine eigene Beschreibung hat.",
      },
    },
    {
      name: "favicon",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Kleines Icon im Browser-Tab. Empfohlen: 32x32 Pixel, PNG oder ICO.",
      },
    },
    {
      name: "ogImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Standard-Bild beim Teilen auf Social Media. Empfohlen: 1200x630 Pixel.",
      },
    },
    {
      name: "analytics",
      type: "group",
      admin: {
        description: "Drittanbieter-Analyse-Integration.",
      },
      fields: [
        {
          name: "googleAnalyticsId",
          type: "text",
          admin: {
            description:
              "Google Analytics Measurement ID (z.B. G-XXXXXXXXXX). Leer lassen, wenn Sie kein Google Analytics verwenden.",
          },
        },
      ],
    },
  ],
};
