import type { HeroProps } from '@/themes/types'

export function Hero({ headline, subheadline, primaryCta, secondaryCta }: HeroProps) {
  return (
    <section className="t-hero">
      <h1 className="t-hero__headline">{headline}</h1>
      {subheadline && <p className="t-hero__sub">{subheadline}</p>}
      <div className="t-hero__actions">
        <a href={primaryCta.url} className="t-btn t-btn--primary">{primaryCta.label}</a>
        {secondaryCta?.label && secondaryCta?.url && (
          <a href={secondaryCta.url} className="t-btn t-btn--ghost">{secondaryCta.label}</a>
        )}
      </div>
    </section>
  )
}
