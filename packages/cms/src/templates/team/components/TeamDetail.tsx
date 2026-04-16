import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { TeamMemberDetailProps } from '../types'

export function TeamDetail({ name, role, photo, bio, email, phone, socialLinks }: Readonly<TeamMemberDetailProps>) {
  return (
    <div className="t-team-detail">
      <div className="t-team-detail__header">
        {photo && (
          <img src={photo.url} alt={photo.alt} className="t-team-detail__photo" />
        )}
        <div>
          <h1 className="t-team-detail__name">{name}</h1>
          <p className="t-team-detail__role">{role}</p>
          {(email || phone) && (
            <div className="t-team-detail__contact">
              {email && <a href={`mailto:${email}`}>{email}</a>}
              {phone && <a href={`tel:${phone}`}>{phone}</a>}
            </div>
          )}
          {socialLinks && socialLinks.length > 0 && (
            <div className="t-team-detail__social">
              {socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="t-team-detail__social-link"
                >
                  {link.platform}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      {bio ? (
        <div className="t-team-detail__bio rich-text">
          <RichText data={bio as SerializedEditorState} />
        </div>
      ) : null}
    </div>
  )
}
