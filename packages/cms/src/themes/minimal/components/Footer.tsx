import type { FooterProps } from '@/themes/types'

export function Footer({ columns, copyright, socialLinks, siteName }: FooterProps) {
  return (
    <footer className="t-footer">
      <div className="t-footer__grid">
        {columns?.map((col) => (
          <div key={col.id || col.heading}>
            <h4 className="t-footer__heading">{col.heading}</h4>
            {col.links?.map((link) => (
              <a key={link.id || link.url} href={link.url} className="t-footer__link">{link.label}</a>
            ))}
          </div>
        ))}
      </div>
      <div className="t-footer__bottom">
        <span>{copyright || `© ${new Date().getFullYear()} ${siteName}`}</span>
        {socialLinks && socialLinks.length > 0 && (
          <div className="t-footer__socials">
            {socialLinks.map((s) => (
              <a key={s.platform} href={s.url} target="_blank" rel="noopener">{s.platform}</a>
            ))}
          </div>
        )}
      </div>
    </footer>
  )
}
