import type { HeaderProps } from '@/themes/types'

export function Header({ navItems, ctaButton, siteName }: HeaderProps) {
  return (
    <header className="t-header">
      <a href="/" className="t-header__logo">{siteName}</a>
      <nav className="t-header__nav">
        {navItems?.map((item) => (
          <a key={item.id || item.url} href={item.url} {...(item.openInNewTab ? { target: '_blank', rel: 'noopener' } : {})}>{item.label}</a>
        ))}
        {ctaButton?.enabled && ctaButton.label && ctaButton.url && (
          <a href={ctaButton.url} className="t-header__cta">{ctaButton.label}</a>
        )}
      </nav>
    </header>
  )
}
