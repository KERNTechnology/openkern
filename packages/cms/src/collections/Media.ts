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
    description:
      "Bilder und Dokumente. Alle Dateien werden auf Ihrem eigenen AWS S3 gespeichert.",
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
      admin: {
        description:
          "Alternativtext für Barrierefreiheit und SEO. Beschreiben Sie kurz, was auf dem Bild zu sehen ist.",
      },
    },
    {
      name: "caption",
      type: "textarea",
      admin: {
        description: "Optionale Bildunterschrift.",
      },
    },
  ],
};
