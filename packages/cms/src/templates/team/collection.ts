import type { CollectionConfig } from 'payload'
import { authenticated, authenticatedOrPublished } from '../../access'

export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'department', '_status', 'order'],
    group: 'Content',
    description:
      'Team members displayed on the website. Drag the "order" field to control sort order.',
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
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'URL path (e.g. "max-mustermann" for /team/max-mustermann).',
      },
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      admin: {
        description: 'Job title or role, e.g. "Lead Developer" or "CEO".',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Portrait photo. Recommended: square, min 400x400px.',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'One-liner shown on the team overview card.',
      },
    },
    {
      name: 'bio',
      type: 'richText',
      admin: {
        description: 'Full biography shown on the detail page.',
      },
    },
    {
      name: 'email',
      type: 'email',
      admin: {
        description: 'Contact email (optional).',
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        description: 'Phone number (optional).',
      },
    },
    {
      name: 'socialLinks',
      type: 'array',
      maxRows: 6,
      admin: {
        description: 'Social media and website links.',
      },
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: [
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'Xing', value: 'xing' },
            { label: 'Twitter / X', value: 'twitter' },
            { label: 'GitHub', value: 'github' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'Website', value: 'website' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'department',
      type: 'select',
      admin: {
        position: 'sidebar',
        description: 'Allows filtering by department.',
      },
      options: [
        { label: 'Management', value: 'management' },
        { label: 'Development', value: 'development' },
        { label: 'Design', value: 'design' },
        { label: 'Marketing', value: 'marketing' },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first.',
      },
    },
    {
      name: 'meta',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: { description: 'SEO title override.' },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: { description: 'SEO description (max 160 characters).' },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Open Graph image.' },
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Auto-set when status changes to published.',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date().toISOString()
            }
            return value
          },
        ],
      },
    },
  ],
}
