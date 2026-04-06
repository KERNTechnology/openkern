import type { PageLayoutProps } from '@/themes/types'

export function PageLayout({ children, title }: PageLayoutProps) {
  return (
    <main className="t-page">
      {title && <h1 className="t-page__title">{title}</h1>}
      {children}
    </main>
  )
}
