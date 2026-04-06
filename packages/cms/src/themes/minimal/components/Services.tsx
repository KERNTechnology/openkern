import type { ServicesProps } from '@/themes/types'

const ICONS: Record<string, string> = {
  palette: '🎨', code: '💻', megaphone: '📣', 'pen-tool': '✏️',
  globe: '🌍', chart: '📊', shield: '🛡️', zap: '⚡',
}

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
            {s.icon && <div className="t-service-card__icon">{ICONS[s.icon] || '●'}</div>}
            <h3 className="t-service-card__title">{s.title}</h3>
            <p className="t-service-card__desc">{s.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
