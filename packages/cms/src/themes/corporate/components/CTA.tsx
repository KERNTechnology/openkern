import type { CTAProps } from '@/themes/types'

export function CTA({ headline, description, buttonLabel, buttonUrl }: CTAProps) {
  return (
    <section className="t-cta">
      <div className="t-cta__inner">
        <h2 className="t-cta__headline">{headline}</h2>
        {description && <p className="t-cta__desc">{description}</p>}
        <a href={buttonUrl} className="t-btn t-btn--primary">{buttonLabel}</a>
      </div>
    </section>
  )
}
