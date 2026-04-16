import type { TeamMemberCardProps } from '../types'

export function TeamCard({ name, role, slug, photo, excerpt, socialLinks }: TeamMemberCardProps) {
  return (
    <a href={`/team/${slug}`} className="t-team-card">
      {photo && (
        <img src={photo.url} alt={photo.alt} className="t-team-card__photo" loading="lazy" />
      )}
      <div className="t-team-card__body">
        <h3 className="t-team-card__name">{name}</h3>
        <p className="t-team-card__role">{role}</p>
        {excerpt && <p className="t-team-card__excerpt">{excerpt}</p>}
        {socialLinks && socialLinks.length > 0 && (
          <div className="t-team-card__social">
            {socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="t-team-card__social-link"
                onClick={(e) => e.stopPropagation()}
              >
                {link.platform}
              </a>
            ))}
          </div>
        )}
      </div>
    </a>
  )
}
