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
        },
        {
          name: "url",
          type: "text",
          required: true,
        },
        {
          name: "openInNewTab",
          type: "checkbox",
          defaultValue: false,
        },
      ],
      admin: {
        initCollapsed: true,
      },
    },
    {
      name: "ctaButton",
      type: "group",
      fields: [
        {
          name: "enabled",
          type: "checkbox",
          defaultValue: false,
        },
        {
          name: "label",
          type: "text",
        },
        {
          name: "url",
          type: "text",
        },
      ],
    },
  ],
};
