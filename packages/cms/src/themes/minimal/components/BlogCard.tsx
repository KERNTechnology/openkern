import type { BlogCardProps } from '@/themes/types'

export function BlogCard({ title, excerpt, category, publishedAt, slug, heroImage }: BlogCardProps) {
  const date = publishedAt ? new Date(publishedAt).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) : null
  return (
    <a href={`/blog/${slug}`} className="t-blog-card">
      {heroImage && <img src={heroImage.url} alt={heroImage.alt} className="t-blog-card__image" loading="lazy" />}
      <div className="t-blog-card__body">
        <div className="t-blog-card__meta">
          {category && <span>{category}</span>}
          {date && <span>{date}</span>}
        </div>
        <h3 className="t-blog-card__title">{title}</h3>
        {excerpt && <p className="t-blog-card__excerpt">{excerpt}</p>}
      </div>
    </a>
  )
}
