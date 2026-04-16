import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { getThemeComponents, isValidTheme } from '@/themes'
import { TeamDetail } from '../../../components/TeamDetail'
import type { TeamMemberDetailProps } from '../../../types'

export const dynamic = 'force-dynamic'

async function getMember(slug: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'team-members',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
    })
    return result.docs[0] ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const member = await getMember(slug)
  if (!member) return {}
  const meta = member.meta as
    | { title?: string | null; description?: string | null }
    | undefined
  return {
    title: meta?.title ?? `${member.name} – ${member.role}`,
    description: meta?.description ?? member.excerpt ?? undefined,
  }
}

export default async function TeamMemberRoute({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const member = await getMember(slug)
  if (!member) notFound()

  const payload = await getPayload({ config: configPromise })
  const settings = await payload
    .findGlobal({ slug: 'site-settings' })
    .catch(() => null)
  const themeName = isValidTheme(settings?.theme) ? settings.theme : 'minimal'
  const components = getThemeComponents(themeName)
  const Detail = components.TeamDetail ?? TeamDetail
  const { PageLayout } = components

  const photo = member.photo as { url?: string; alt?: string } | number | null
  const resolvedPhoto =
    photo && typeof photo !== 'number' && photo.url
      ? { url: photo.url, alt: photo.alt || '' }
      : null

  return (
    <PageLayout title={member.name}>
      <a href="/team" className="t-back-link">
        &larr; Alle Teammitglieder
      </a>

      <Detail
        name={member.name}
        role={member.role}
        department={member.department}
        photo={resolvedPhoto}
        bio={member.bio}
        email={member.email}
        phone={member.phone}
        socialLinks={
          member.socialLinks as { platform: string; url: string }[] | null
        }
      />
    </PageLayout>
  )
}
