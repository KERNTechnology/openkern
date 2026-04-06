import type { Block } from 'payload'

export const RichTextBlock: Block = {
  slug: 'richtext',
  labels: { singular: 'Rich Text', plural: 'Rich Text' },
  fields: [
    { name: 'content', type: 'richText', required: true },
  ],
}
