import type { ServicesProps } from '@/themes/types'

const ICONS: Record<string, string> = {
  palette: '\uD83C\uDFA8', code: '\uD83D\uDCBB', megaphone: '\uD83D\uDCE3', 'pen-tool': '\u270F\uFE0F',
  globe: '\uD83C\uDF0D', chart: '\uD83D\uDCCA', shield: '\uD83D\uDEE1\uFE0F', zap: '\u26A1',
}

export function Services({ headline, subheadline, services }: ServicesProps) {
  return (
    <section className="t-section t-section--gray">
      <div className="t-section__inner">
        <div className="t-section__header">
          <h2 className="t-section__headline">{headline}</h2>
          {subheadline && <p className="t-section__sub">{subheadline}</p>}
        </div>
        <div className="t-services__grid">
          {services.map((s, i) => (
            <div key={i} className="t-service-card">
              {s.icon && <div className="t-service-card__icon">{ICONS[s.icon] || '\u25CF'}</div>}
              <h3 className="t-service-card__title">{s.title}</h3>
              <p className="t-service-card__desc">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
