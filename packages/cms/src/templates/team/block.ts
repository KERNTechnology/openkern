import type { Block } from 'payload'

export const TeamBlock: Block = {
  slug: 'team',
  labels: { singular: 'Team', plural: 'Team' },
  fields: [
    { name: 'headline', type: 'text', required: true },
    { name: 'subheadline', type: 'textarea' },
    {
      name: 'members',
      type: 'relationship',
      relationTo: 'team-members',
      hasMany: true,
      admin: {
        description: 'Pick specific members, or leave empty to show all.',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 6,
      admin: {
        description: 'Max members to display (0 = all).',
      },
    },
    {
      name: 'showLink',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Show link to the full /team page.',
      },
    },
  ],
}
