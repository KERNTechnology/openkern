import type { CollectionConfig } from "payload";
import { anyone, authenticated } from "../access";

export const Media: CollectionConfig = {
  slug: "media",
  upload: {
    mimeTypes: ["image/*", "application/pdf"],
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300, position: "centre" },
      { name: "medium", width: 800, position: "centre" },
      { name: "large", width: 1400, position: "centre" },
      { name: "og", width: 1200, height: 630, position: "centre" },
    ],
  },
  admin: {
    useAsTitle: "alt",
    defaultColumns: ["filename", "alt", "updatedAt"],
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
    {
      name: "caption",
      type: "textarea",
    },
  ],
};
