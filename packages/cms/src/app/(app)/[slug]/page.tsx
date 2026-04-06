import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getThemeComponents, isValidTheme } from '@/themes'
import { BlockRenderer } from '../components/BlockRenderer'

async function getPage(slug: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'pages',
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
  const page = await getPage(slug)
  if (!page) return {}
  const meta = page.meta as
    | { title?: string | null; description?: string | null }
    | undefined
  return {
    title: meta?.title ?? page.title,
    description: meta?.description ?? undefined,
  }
}

export default async function PageRoute({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Don't handle "home" here — that's the root page.tsx
  if (slug === 'home') notFound()

  const page = await getPage(slug)
  if (!page) notFound()

  const payload = await getPayload({ config: configPromise })
  const settings = await payload.findGlobal({ slug: 'site-settings' }).catch(() => null)
  const themeName = isValidTheme(settings?.theme) ? settings.theme : 'minimal'
  const components = getThemeComponents(themeName)

  const blocks =
    ((page as Record<string, unknown>).layout as Array<{
      blockType: string
      [k: string]: unknown
    }>) || []

  if (blocks.length > 0) {
    return <BlockRenderer blocks={blocks} components={components} />
  }

  // Fallback: render rich text content in the theme's PageLayout
  return (
    <components.PageLayout title={page.title}>
      {page.content ? (
        <div className="rich-text">
          <RichText data={page.content} />
        </div>
      ) : null}
    </components.PageLayout>
  )
}
