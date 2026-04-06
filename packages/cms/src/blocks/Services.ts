import type { Block } from 'payload'

export const ServicesBlock: Block = {
  slug: 'services',
  labels: { singular: 'Leistungen', plural: 'Leistungen' },
  fields: [
    { name: 'headline', type: 'text', required: true },
    { name: 'subheadline', type: 'textarea' },
    {
      name: 'services',
      type: 'array',
      maxRows: 8,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
        { name: 'icon', type: 'text', admin: { description: 'Icon name (e.g. palette, code, megaphone, pen-tool)' } },
      ],
    },
  ],
}
