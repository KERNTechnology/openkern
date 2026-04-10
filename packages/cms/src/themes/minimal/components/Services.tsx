import type { ServicesProps } from '@/themes/types'
import { ServiceIcon } from '@/themes/shared/ServiceIcon'

export function Services({ headline, subheadline, services }: ServicesProps) {
  return (
    <section className="t-section">
      <div className="t-section__header">
        <h2 className="t-section__headline">{headline}</h2>
        {subheadline && <p className="t-section__sub">{subheadline}</p>}
      </div>
      <div className="t-services__grid">
        {services.map((s, i) => (
          <div key={i} className="t-service-card">
            {s.icon && <div className="t-service-card__icon"><ServiceIcon name={s.icon} /></div>}
            <h3 className="t-service-card__title">{s.title}</h3>
            <p className="t-service-card__desc">{s.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
