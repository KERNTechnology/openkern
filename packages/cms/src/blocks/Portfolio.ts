import type { Block } from 'payload'

export const PortfolioBlock: Block = {
  slug: 'portfolio',
  labels: { singular: 'Portfolio', plural: 'Portfolio' },
  fields: [
    { name: 'headline', type: 'text', required: true },
    { name: 'subheadline', type: 'textarea' },
    {
      name: 'items',
      type: 'array',
      maxRows: 6,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'url', type: 'text' },
      ],
    },
  ],
}
