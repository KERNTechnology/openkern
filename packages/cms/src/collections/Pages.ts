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
      },
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
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
          "Page layout using content blocks. Use this for structured pages like the homepage.",
      },
    },
    {
      name: "content",
      type: "richText",
      admin: {
        description:
          "Simple rich text content. Use this for basic pages like About or Contact.",
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
            description: "Overrides the page title for SEO. Leave blank to use the page title.",
          },
        },
        {
          name: "description",
          type: "textarea",
          admin: {
            description: "Short description for search engines (max 160 characters).",
          },
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          admin: {
            description: "Image used when sharing on social media (Open Graph).",
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
