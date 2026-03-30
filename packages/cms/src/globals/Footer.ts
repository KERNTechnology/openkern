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
      },
    },
    {
      name: "copyright",
      type: "text",
      admin: {
        description: "e.g. '2025 Your Company. All rights reserved.'",
      },
    },
    {
      name: "socialLinks",
      type: "array",
      maxRows: 6,
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
