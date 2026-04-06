import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getThemeComponents, isValidTheme } from '@/themes'
import type { NavItem, FooterColumn, SocialLink } from '@/themes/types'

import './globals.css'
import '@/themes/minimal/theme.css'
import '@/themes/bold/theme.css'
import '@/themes/corporate/theme.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export async function generateMetadata(): Promise<Metadata> {
  try {
    const payload = await getPayload({ config: configPromise })
    const settings = await payload.findGlobal({ slug: 'site-settings' })
    return {
      title: settings?.siteName ?? 'OpenKERN Site',
      description:
        settings?.siteDescription ??
        'Built with OpenKERN — Payload CMS + Next.js on AWS',
      icons: { icon: '/icon.svg' },
    }
  } catch {
    return {
      title: 'OpenKERN Site',
      description: 'Built with OpenKERN — Payload CMS + Next.js on AWS',
      icons: { icon: '/icon.svg' },
    }
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const payload = await getPayload({ config: configPromise })

  const [settings, headerData, footerData] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings' }).catch(() => null),
    payload.findGlobal({ slug: 'header' }).catch(() => null),
    payload.findGlobal({ slug: 'footer' }).catch(() => null),
  ])

  const themeName = isValidTheme(settings?.theme) ? settings.theme : 'minimal'
  const { Header, Footer } = getThemeComponents(themeName)

  const siteName = settings?.siteName ?? 'OpenKERN'

  // Map header data
  const navItems = (headerData?.navItems as NavItem[] | undefined) ?? []
  const ctaButton = headerData?.ctaButton
  const logo = headerData?.logo
    ? {
        url: (headerData.logo as { url: string }).url,
        alt:
          (headerData.logo as { alt?: string }).alt || siteName,
      }
    : null

  // Map footer data
  const columns = (footerData?.columns as FooterColumn[] | undefined) ?? []
  const copyright = footerData?.copyright
  const socialLinks =
    (footerData?.socialLinks as SocialLink[] | undefined) ?? []

  return (
    <html lang="de" className={inter.variable} data-theme={themeName}>
      <body>
        <Header
          navItems={navItems}
          ctaButton={ctaButton}
          siteName={siteName}
          logo={logo}
        />
        {children}
        <Footer
          columns={columns}
          copyright={copyright}
          socialLinks={socialLinks}
          siteName={siteName}
        />
      </body>
    </html>
  )
}
