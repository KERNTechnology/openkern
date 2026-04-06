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
          "Visual theme for the website. Changes take effect immediately.",
      },
    },
    {
      name: "siteName",
      type: "text",
      required: true,
      defaultValue: "My OpenKERN Site",
    },
    {
      name: "siteDescription",
      type: "textarea",
      admin: {
        description: "Default meta description for the site.",
      },
    },
    {
      name: "favicon",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "ogImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Default image used when sharing pages on social media.",
      },
    },
    {
      name: "analytics",
      type: "group",
      admin: {
        description: "Third-party analytics integration.",
      },
      fields: [
        {
          name: "googleAnalyticsId",
          type: "text",
          admin: {
            description: "Google Analytics measurement ID (e.g. G-XXXXXXXXXX).",
          },
        },
      ],
    },
  ],
};
