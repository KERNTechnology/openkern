import type { TeamBlockProps } from '../types'
import { TeamCard } from './TeamCard'

export function TeamGrid({ headline, subheadline, members, showLink }: TeamBlockProps) {
  return (
    <section className="t-section">
      <div className="t-section__content">
        <h2 className="t-section__heading">{headline}</h2>
        {subheadline && <p className="t-section__subheading">{subheadline}</p>}
        <div className="t-team-grid">
          {members.map((member) => (
            <TeamCard key={member.slug} {...member} />
          ))}
        </div>
        {showLink && (
          <div className="t-section__link">
            <a href="/team">Alle Teammitglieder &rarr;</a>
          </div>
        )}
      </div>
    </section>
  )
}
