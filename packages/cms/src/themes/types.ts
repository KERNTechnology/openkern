import type { ReactNode } from 'react'

export type ThemeName = 'minimal' | 'bold' | 'corporate'

export interface NavItem {
  label: string
  url: string
  openInNewTab?: boolean | null
  id?: string | null
}

export interface FooterColumn {
  heading: string
  links?: { label: string; url: string; id?: string | null }[] | null
  id?: string | null
}

export interface SocialLink {
  platform: string
  url: string
}

export interface HeaderProps {
  navItems?: NavItem[] | null
  ctaButton?: { enabled?: boolean | null; label?: string | null; url?: string | null } | null
  siteName: string
  logo?: { url: string; alt: string } | null
}

export interface FooterProps {
  columns?: FooterColumn[] | null
  copyright?: string | null
  socialLinks?: SocialLink[] | null
  siteName: string
}

export interface HeroProps {
  headline: string
  subheadline?: string | null
  primaryCta: { label: string; url: string }
  secondaryCta?: { label?: string | null; url?: string | null } | null
  backgroundImage?: { url: string; alt: string } | null
}

export interface ServiceItem {
  title: string
  description: string
  icon?: string | null
}

export interface ServicesProps {
  headline: string
  subheadline?: string | null
  services: ServiceItem[]
}

export interface PortfolioItem {
  title: string
  description?: string | null
  image?: { url: string; alt: string } | null
  url?: string | null
}

export interface PortfolioProps {
  headline: string
  subheadline?: string | null
  items: PortfolioItem[]
}

export interface TestimonialItem {
  quote: string
  author: string
  role?: string | null
  company?: string | null
}

export interface TestimonialsProps {
  headline: string
  testimonials: TestimonialItem[]
}

export interface CTAProps {
  headline: string
  description?: string | null
  buttonLabel: string
  buttonUrl: string
}

export interface BlogCardProps {
  title: string
  excerpt?: string | null
  category?: string | null
  publishedAt?: string | null
  slug: string
  heroImage?: { url: string; alt: string } | null
}

export interface PageLayoutProps {
  children: ReactNode
  title?: string
}

export interface ThemeComponents {
  Header: React.ComponentType<HeaderProps>
  Footer: React.ComponentType<FooterProps>
  Hero: React.ComponentType<HeroProps>
  Services: React.ComponentType<ServicesProps>
  Portfolio: React.ComponentType<PortfolioProps>
  Testimonials: React.ComponentType<TestimonialsProps>
  CTA: React.ComponentType<CTAProps>
  BlogCard: React.ComponentType<BlogCardProps>
  PageLayout: React.ComponentType<PageLayoutProps>
}
