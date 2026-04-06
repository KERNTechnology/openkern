import type { PortfolioProps } from '@/themes/types'

export function Portfolio({ headline, subheadline, items }: PortfolioProps) {
  return (
    <section className="t-section">
      <div className="t-section__header">
        <h2 className="t-section__headline">{headline}</h2>
        {subheadline && <p className="t-section__sub">{subheadline}</p>}
      </div>
      <div className="t-portfolio__grid">
        {items.map((item, i) => (
          <div key={i} className="t-portfolio-card">
            {item.image && (
              <img src={item.image.url} alt={item.image.alt} className="t-portfolio-card__image" loading="lazy" />
            )}
            <div className="t-portfolio-card__body">
              <h3 className="t-portfolio-card__title">{item.title}</h3>
              {item.description && <p className="t-portfolio-card__desc">{item.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
