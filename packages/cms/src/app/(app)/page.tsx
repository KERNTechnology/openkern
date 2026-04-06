import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getThemeComponents, isValidTheme } from '@/themes'
import { BlockRenderer } from './components/BlockRenderer'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'home' } },
      limit: 1,
    })
    const page = result.docs[0]
    if (!page) return {}
    const meta = page.meta as
      | { title?: string | null; description?: string | null }
      | undefined
    return {
      title: meta?.title ?? page.title,
      description:
        meta?.description ??
        'Deine neue Website mit OpenKERN — Payload CMS + Next.js auf AWS.',
    }
  } catch {
    return {}
  }
}

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })
  const settings = await payload.findGlobal({ slug: 'site-settings' }).catch(() => null)
  const themeName = isValidTheme(settings?.theme) ? settings.theme : 'minimal'
  const components = getThemeComponents(themeName)

  const pages = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 2,
  })
  const page = pages.docs[0]

  if (!page) {
    return (
      <main className="t-page">
        <h1 className="t-page__title">Willkommen</h1>
        <p>
          Richte deine Website ein unter <a href="/admin">/admin</a>.
        </p>
      </main>
    )
  }

  // eslint-disable-next-line
  const blocks = ((page as any).layout as Array<{ blockType: string; [k: string]: unknown }>) || []

  if (blocks.length > 0) {
    return <BlockRenderer blocks={blocks} components={components} />
  }

  // Fallback: render rich text content in the theme's PageLayout
  return (
    <components.PageLayout title={page.title}>
      <div className="rich-text" />
    </components.PageLayout>
  )
}
