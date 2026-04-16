import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getThemeComponents, isValidTheme } from '@/themes'
import { TeamCard } from '../../components/TeamCard'
import type { TeamMemberCardProps } from '../../types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Team',
  description: 'Unser Team im Überblick.',
}

function resolvePhoto(
  field: { url?: string; alt?: string } | number | null | undefined,
): { url: string; alt: string } | null {
  if (!field || typeof field === 'number') return null
  if (!field.url) return null
  return { url: field.url, alt: field.alt || '' }
}

export default async function TeamPage() {
  const payload = await getPayload({ config: configPromise })

  const [settings, result] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload.find({
      collection: 'team-members',
      sort: 'order',
      limit: 100,
      depth: 1,
    }),
  ])

  const themeName = isValidTheme(settings?.theme) ? settings.theme : 'minimal'
  const components = getThemeComponents(themeName)
  const Card = components.TeamCard ?? TeamCard

  const members = result.docs

  return (
    <main className="t-page">
      <div className="t-page__header">
        <h1 className="t-page__title">Team</h1>
        <p className="t-page__description">Die Menschen hinter dem Projekt.</p>
      </div>

      {members.length === 0 ? (
        <p className="t-page__empty">Noch keine Teammitglieder vorhanden.</p>
      ) : (
        <div className="t-team-grid">
          {members.map((member) => (
            <Card
              key={member.id}
              name={member.name}
              role={member.role}
              slug={member.slug}
              excerpt={member.excerpt}
              photo={resolvePhoto(
                member.photo as { url?: string; alt?: string } | number | null,
              )}
              socialLinks={
                member.socialLinks as
                  | { platform: string; url: string }[]
                  | null
              }
            />
          ))}
        </div>
      )}
    </main>
  )
}
