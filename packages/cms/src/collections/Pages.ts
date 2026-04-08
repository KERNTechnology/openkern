import type { CollectionConfig } from "payload";
import { authenticated, authenticatedOrPublished } from "../access";
import {
  HeroBlock,
  ServicesBlock,
  PortfolioBlock,
  TestimonialsBlock,
  CTABlock,
  RichTextBlock,
} from "../blocks";

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status", "updatedAt"],
    description:
      "Verwalten Sie Ihre Website-Seiten. Jede Seite hat eine eigene URL (Slug) und kann mit Layout-Blöcken oder Freitext gestaltet werden.",
  },
  access: {
    read: authenticatedOrPublished,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: {
    drafts: {
      autosave: { interval: 300 },
    },
    maxPerDoc: 25,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        position: "sidebar",
        description:
          "URL-Pfad der Seite (z.B. 'leistungen' für /leistungen). Wird automatisch in der Adresszeile verwendet.",
      },
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Optionales Titelbild für die Seite.",
      },
    },
    {
      name: "layout",
      type: "blocks",
      blocks: [
        HeroBlock,
        ServicesBlock,
        PortfolioBlock,
        TestimonialsBlock,
        CTABlock,
        RichTextBlock,
      ],
      admin: {
        description:
          "Seitenlayout mit Inhaltsblöcken. Nutzen Sie dies für strukturierte Seiten wie die Startseite. Blöcke können per Drag & Drop angeordnet werden.",
      },
    },
    {
      name: "content",
      type: "richText",
      admin: {
        description:
          "Freitext-Inhalt mit dem Rich-Text-Editor. Nutzen Sie dies für einfache Seiten wie Über uns oder Kontakt.",
      },
    },
    {
      name: "meta",
      type: "group",
      fields: [
        {
          name: "title",
          type: "text",
          admin: {
            description: "Überschreibt den Seitentitel für Suchmaschinen. Leer lassen, um den Seitentitel zu verwenden.",
          },
        },
        {
          name: "description",
          type: "textarea",
          admin: {
            description: "Kurzbeschreibung für Suchmaschinen (max. 160 Zeichen). Erscheint in Google-Ergebnissen.",
          },
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          admin: {
            description: "Bild das beim Teilen auf Social Media angezeigt wird (Open Graph).",
          },
        },
      ],
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
        description:
          "Veröffentlichungsdatum. Wird automatisch gesetzt, wenn der Status auf 'Published' geändert wird.",
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === "published" && !value) {
              return new Date().toISOString();
            }
            return value;
          },
        ],
      },
    },
  ],
};
