import type { CollectionConfig } from "payload";
import { authenticated, authenticatedOrPublished } from "../access";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "category", "_status", "publishedAt"],
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
      name: "excerpt",
      type: "textarea",
      admin: {
        description: "Short summary shown in post listings.",
      },
    },
    {
      name: "content",
      type: "richText",
      required: true,
    },
    {
      name: "category",
      type: "select",
      admin: {
        position: "sidebar",
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
      },
    },
    {
      name: "meta",
      type: "group",
      fields: [
        {
          name: "title",
          type: "text",
        },
        {
          name: "description",
          type: "textarea",
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
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
