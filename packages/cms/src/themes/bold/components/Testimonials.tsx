import type { TestimonialsProps } from '@/themes/types'

export function Testimonials({ headline, testimonials }: TestimonialsProps) {
  return (
    <section className="t-section">
      <div className="t-section__header">
        <h2 className="t-section__headline">{headline}</h2>
      </div>
      <div className="t-testimonials__grid">
        {testimonials.map((t, i) => (
          <div key={i} className="t-testimonial-card">
            <p className="t-testimonial-card__quote">&bdquo;{t.quote}&ldquo;</p>
            <div>
              <div className="t-testimonial-card__author">{t.author}</div>
              {(t.role || t.company) && (
                <div className="t-testimonial-card__role">
                  {[t.role, t.company].filter(Boolean).join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
