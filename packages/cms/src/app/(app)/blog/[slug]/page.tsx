import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'

export const dynamic = 'force-dynamic'
import { getThemeComponents, isValidTheme } from '@/themes'

async function getPost(slug: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'posts',
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
  const post = await getPost(slug)
  if (!post) return {}
  const meta = post.meta as
    | { title?: string | null; description?: string | null }
    | undefined
  return {
    title: meta?.title ?? post.title,
    description: meta?.description ?? post.excerpt ?? undefined,
  }
}

export default async function PostRoute({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const payload = await getPayload({ config: configPromise })
  const settings = await payload
    .findGlobal({ slug: 'site-settings' })
    .catch(() => null)
  const themeName = isValidTheme(settings?.theme) ? settings.theme : 'minimal'
  const { PageLayout } = getThemeComponents(themeName)

  return (
    <PageLayout title={post.title}>
      <a
        href="/blog"
        className="t-back-link"
      >
        &larr; Alle Beiträge
      </a>

      <div className="t-post-meta">
        {post.publishedAt && (
          <time>
            {new Date(post.publishedAt).toLocaleDateString('de-DE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        )}
        {post.category && (
          <span className="t-post-meta__category">{post.category}</span>
        )}
      </div>

      {post.content && (
        <div className="rich-text">
          <RichText data={post.content} />
        </div>
      )}
    </PageLayout>
  )
}
