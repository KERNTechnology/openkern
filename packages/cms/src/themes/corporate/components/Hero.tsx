import type { HeroProps } from '@/themes/types'

export function Hero({ headline, subheadline, primaryCta, secondaryCta, backgroundImage }: HeroProps) {
  return (
    <section className="t-hero">
      <div className="t-hero__content">
        <h1 className="t-hero__headline">{headline}</h1>
        {subheadline && <p className="t-hero__sub">{subheadline}</p>}
        <div className="t-hero__actions">
          <a href={primaryCta.url} className="t-btn t-btn--primary">{primaryCta.label}</a>
          {secondaryCta?.label && secondaryCta?.url && (
            <a href={secondaryCta.url} className="t-btn t-btn--ghost">{secondaryCta.label}</a>
          )}
        </div>
      </div>
      <div className="t-hero__visual">
        {backgroundImage ? (
          <img src={backgroundImage.url} alt={backgroundImage.alt} />
        ) : (
          <div className="t-hero__visual-placeholder" />
        )}
      </div>
    </section>
  )
}
