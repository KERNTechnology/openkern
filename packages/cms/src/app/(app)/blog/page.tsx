import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getThemeComponents, isValidTheme } from '@/themes'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Neuigkeiten und Artikel rund um OpenKERN, Payload CMS und moderne Web-Architektur.',
}

export default async function BlogPage() {
  const payload = await getPayload({ config: configPromise })

  const [settings, result] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload.find({
      collection: 'posts',
      sort: '-publishedAt',
      limit: 20,
      depth: 1,
    }),
  ])

  const themeName = isValidTheme(settings?.theme) ? settings.theme : 'minimal'
  const { BlogCard } = getThemeComponents(themeName)

  const posts = result.docs

  return (
    <main className="t-page">
      <div className="t-page__header">
        <h1 className="t-page__title">Blog</h1>
        <p className="t-page__description">
          Neuigkeiten und Artikel rund um den Stack.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="t-page__empty">Noch keine Beiträge vorhanden.</p>
      ) : (
        <div className="t-blog-grid">
          {posts.map((post) => {
            const heroImage = post.heroImage as
              | { url?: string; alt?: string }
              | null
              | undefined

            return (
              <BlogCard
                key={post.id}
                title={post.title}
                excerpt={post.excerpt}
                category={post.category}
                publishedAt={post.publishedAt}
                slug={post.slug}
                heroImage={
                  heroImage?.url
                    ? { url: heroImage.url, alt: heroImage.alt || '' }
                    : undefined
                }
              />
            )
          })}
        </div>
      )}
    </main>
  )
}
