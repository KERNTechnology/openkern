// FILE: packages/cms/src/app/(app)/layout.tsx
import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getPayload } from "payload";
import config from "@payload-config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/** Fetch SiteSettings global for metadata */
async function getSiteSettings() {
  try {
    const payload = await getPayload({ config });
    return await payload.findGlobal({ slug: "site-settings" });
  } catch {
    return null;
  }
}

/** Fetch Header global for navigation */
async function getHeader() {
  try {
    const payload = await getPayload({ config });
    return await payload.findGlobal({ slug: "header" });
  } catch {
    return null;
  }
}

/** Fetch Footer global */
async function getFooter() {
  try {
    const payload = await getPayload({ config });
    return await payload.findGlobal({ slug: "footer" });
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings?.siteName ?? "OpenKERN Site",
    description:
      settings?.siteDescription ??
      "Built with OpenKERN — Payload CMS + Next.js on AWS",
  };
}

interface NavItem {
  label: string;
  url: string;
  openInNewTab?: boolean | null;
  id?: string | null;
}

interface FooterColumn {
  heading: string;
  links?: { label: string; url: string; id?: string | null }[] | null;
  id?: string | null;
}

function SiteHeader({
  navItems,
  ctaButton,
  siteName,
}: {
  navItems?: NavItem[] | null;
  ctaButton?: { enabled?: boolean | null; label?: string | null; url?: string | null } | null;
  siteName: string;
}) {
  return (
    <header className="site-header">
      <div className="container">
        <a href="/" className="site-header__logo">
          <span>{siteName}</span>
        </a>

        <nav>
          <ul className="site-header__nav">
            {navItems?.map((item) => (
              <li key={item.id ?? item.url}>
                <a
                  href={item.url}
                  {...(item.openInNewTab
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {item.label}
                </a>
              </li>
            ))}
            {ctaButton?.enabled && ctaButton.label && ctaButton.url && (
              <li>
                <a href={ctaButton.url} className="site-header__cta">
                  {ctaButton.label}
                </a>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter({
  columns,
  copyright,
}: {
  columns?: FooterColumn[] | null;
  copyright?: string | null;
}) {
  // Flatten all footer links for a simple link bar
  const allLinks =
    columns?.flatMap(
      (col) =>
        col.links?.map((link) => ({
          label: link.label,
          url: link.url,
          id: link.id,
        })) ?? [],
    ) ?? [];

  return (
    <footer className="site-footer">
      <div className="container">
        <p className="site-footer__copy" style={{ marginBottom: "0.5rem" }}>
          Built with <strong>OpenKERN</strong> — Payload CMS + Next.js on AWS
        </p>

        {allLinks.length > 0 && (
          <ul className="site-footer__links">
            {allLinks.map((link) => (
              <li key={link.id ?? link.url}>
                <a href={link.url}>{link.label}</a>
              </li>
            ))}
          </ul>
        )}

        {copyright && <p className="site-footer__copy">{copyright}</p>}
      </div>
    </footer>
  );
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, header, footer] = await Promise.all([
    getSiteSettings(),
    getHeader(),
    getFooter(),
  ]);

  const siteName = settings?.siteName ?? "OpenKERN";

  return (
    <html lang="de" className={inter.variable}>
      <body>
        <SiteHeader
          navItems={header?.navItems as NavItem[] | undefined}
          ctaButton={header?.ctaButton}
          siteName={siteName}
        />
        {children}
        <SiteFooter
          columns={footer?.columns as FooterColumn[] | undefined}
          copyright={footer?.copyright}
        />
      </body>
    </html>
  );
}
