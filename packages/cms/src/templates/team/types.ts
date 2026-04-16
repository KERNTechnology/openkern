export interface TeamMemberCardProps {
  name: string
  role: string
  slug: string
  photo?: { url: string; alt: string } | null
  excerpt?: string | null
  socialLinks?: { platform: string; url: string }[] | null
}

export interface TeamMemberDetailProps {
  name: string
  role: string
  department?: string | null
  photo?: { url: string; alt: string } | null
  bio?: unknown
  email?: string | null
  phone?: string | null
  socialLinks?: { platform: string; url: string }[] | null
}

export interface TeamBlockProps {
  headline: string
  subheadline?: string | null
  members: TeamMemberCardProps[]
  showLink?: boolean | null
}
