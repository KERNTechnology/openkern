import type { CollectionConfig } from "payload";
import { authenticated, authenticatedOrPublished } from "../access";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "category", "_status", "publishedAt"],
    description:
      "Blog-Beiträge und Artikel. Schreiben Sie regelmäßig, um bei Suchmaschinen besser gefunden zu werden.",
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
          "URL-Pfad des Beitrags (z.B. 'mein-erster-post' für /blog/mein-erster-post).",
      },
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Vorschaubild für den Beitrag. Wird in der Blog-Übersicht und beim Teilen angezeigt.",
      },
    },
    {
      name: "excerpt",
      type: "textarea",
      admin: {
        description:
          "Kurze Zusammenfassung für die Blog-Übersicht. 1-2 Sätze die neugierig machen.",
      },
    },
    {
      name: "content",
      type: "richText",
      required: true,
      admin: {
        description:
          "Der Hauptinhalt des Beitrags. Nutzen Sie Überschriften, Listen und Bilder für bessere Lesbarkeit.",
      },
    },
    {
      name: "category",
      type: "select",
      admin: {
        position: "sidebar",
        description:
          "Kategorie für die Filterung und Organisation Ihrer Beiträge.",
      },
      options: [
        { label: "Blog", value: "blog" },
        { label: "News", value: "news" },
        { label: "Case Study", value: "case-study" },
      ],
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
      admin: {
        position: "sidebar",
        description:
          "Verfasser des Beitrags. Wählen Sie einen registrierten Benutzer aus.",
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
            description:
              "SEO-Titel für Suchmaschinen. Leer = Beitragstitel wird verwendet.",
          },
        },
        {
          name: "description",
          type: "textarea",
          admin: {
            description: "SEO-Beschreibung (max. 160 Zeichen).",
          },
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          admin: {
            description: "Social-Media-Vorschaubild (Open Graph).",
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
          "Veröffentlichungsdatum. Wird automatisch gesetzt bei Statuswechsel auf 'Published'.",
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
