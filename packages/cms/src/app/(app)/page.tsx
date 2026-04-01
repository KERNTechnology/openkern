// FILE: packages/cms/src/app/(app)/page.tsx
import React from "react";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";

/* ---------------------------------------------------------------------------
   Data fetching
   -------------------------------------------------------------------------- */

async function getHomePage() {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "pages",
      where: { slug: { equals: "home" } },
      limit: 1,
    });
    return result.docs[0] ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomePage();
  if (!page) return {};
  const meta = page.meta as
    | { title?: string | null; description?: string | null }
    | undefined;
  return {
    title: meta?.title ?? page.title,
    description:
      meta?.description ??
      "Deine neue Website mit OpenKERN — Payload CMS + Next.js auf AWS.",
  };
}

/* ---------------------------------------------------------------------------
   Icon components (inline SVG to avoid external deps)
   -------------------------------------------------------------------------- */

function IconCMS() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path d="M14 9h4" />
      <path d="M14 13h4" />
    </svg>
  );
}

function IconNext() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconCloud() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   Section: Hero
   -------------------------------------------------------------------------- */

function HeroSection() {
  return (
    <section className="dark-section hero">
      <div className="container">
        <span className="hero__badge">Powered by OpenKERN</span>
        <h1 className="hero__title">
          Willkommen auf deiner
          <br />
          neuen Website
        </h1>
        <p className="hero__sub">
          Diese Seite wurde mit OpenKERN deployed — Payload CMS + Next.js auf
          deinem eigenen AWS-Account. Bearbeite sie unter{" "}
          <code style={{ color: "var(--color-primary)" }}>/admin</code>.
        </p>
        <div className="hero__actions">
          <a href="/admin" className="btn btn--primary">
            Admin Panel öffnen
          </a>
          <a href="#features" className="btn btn--ghost">
            Mehr erfahren
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Section: Features
   -------------------------------------------------------------------------- */

const FEATURES = [
  {
    icon: <IconCMS />,
    title: "Payload CMS",
    desc: "Headless CMS mit Visual Editor. Erstelle Seiten, Posts und Medien direkt im Admin-Panel.",
  },
  {
    icon: <IconNext />,
    title: "Next.js 15",
    desc: "Server Components, App Router, Static + Dynamic Rendering. Alles in einem Deployment.",
  },
  {
    icon: <IconCloud />,
    title: "Dein AWS",
    desc: "Lambda, S3, CloudFront — alles auf deinem eigenen AWS-Account. Volle Kontrolle.",
  },
] as const;

function FeaturesSection() {
  return (
    <section id="features" className="light-section section">
      <div className="container">
        <div className="section-header">
          <span className="section-header__label">Features</span>
          <h2 className="section-header__title">
            Alles was du brauchst, <span className="gradient-text">sofort einsatzbereit</span>
          </h2>
          <p className="section-header__desc">
            OpenKERN kombiniert die besten Tools zu einem schlüsselfertigen
            Stack.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-card__icon">{f.icon}</div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Section: How It Works
   -------------------------------------------------------------------------- */

const STEPS = [
  {
    title: "Inhalte bearbeiten",
    desc: "Öffne /admin und logge dich ein. Du siehst Collections (Pages, Posts, Media) und Globals (Header, Footer, Settings).",
  },
  {
    title: "Seiten erstellen",
    desc: "Jede Seite hat einen Titel, Slug und Rich-Text-Inhalt. Erstelle neue Seiten unter Pages \u2192 Create New.",
  },
  {
    title: "Medien hochladen",
    desc: "Bilder und Dokumente werden automatisch auf S3 gespeichert und über CloudFront ausgeliefert.",
  },
] as const;

function HowItWorksSection() {
  return (
    <section className="dark-section section">
      <div className="container">
        <div className="section-header">
          <span className="section-header__label">So funktioniert&apos;s</span>
          <h2 className="section-header__title" style={{ color: "var(--color-text-light)" }}>
            In drei Schritten zur fertigen Website
          </h2>
        </div>

        <div className="steps-list">
          {STEPS.map((step, i) => (
            <div key={step.title} className="step-item">
              <div className="step-item__number">{i + 1}</div>
              <div className="step-item__content">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Section: Stack Overview
   -------------------------------------------------------------------------- */

const STACK_ITEMS = [
  {
    name: "Payload CMS",
    desc: "Headless CMS",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>,
  },
  {
    name: "Next.js 15",
    desc: "React Framework",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" x2="12" y1="22" y2="8.5"/><polyline points="22 8.5 12 8.5 2 8.5"/><polyline points="2 15.5 12 8.5 22 15.5"/></svg>,
  },
  {
    name: "AWS Lambda",
    desc: "Serverless Compute",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>,
  },
  {
    name: "CloudFront",
    desc: "CDN & Edge",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  },
  {
    name: "S3",
    desc: "Object Storage",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>,
  },
  {
    name: "Pulumi",
    desc: "Infrastructure as Code",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  },
];

function StackSection() {
  return (
    <section className="light-section section">
      <div className="container">
        <div className="section-header">
          <span className="section-header__label">Tech Stack</span>
          <h2 className="section-header__title">
            Gebaut mit <span className="gradient-text">bewährter Technologie</span>
          </h2>
          <p className="section-header__desc">
            Jede Komponente wurde sorgfältig ausgewählt und aufeinander
            abgestimmt.
          </p>
        </div>

        <div className="stack-grid">
          {STACK_ITEMS.map((item) => (
            <div key={item.name} className="stack-card">
              <div className="stack-card__icon">{item.icon}</div>
              <div className="stack-card__name">{item.name}</div>
              <div className="stack-card__desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Section: CTA
   -------------------------------------------------------------------------- */

function CTASection() {
  return (
    <section className="dark-section cta-section">
      <div className="container">
        <h2 className="cta-section__title">Bereit loszulegen?</h2>
        <p className="cta-section__desc">
          Öffne das Admin-Panel und bearbeite diese Seite.
        </p>
        <a href="/admin" className="btn btn--primary">
          Zum Admin Panel
        </a>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Page
   -------------------------------------------------------------------------- */

export default async function HomePage() {
  // Fetch the home page from Payload for metadata/SEO purposes.
  // The visual sections are part of the template and render statically.
  await getHomePage();

  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StackSection />
      <CTASection />
    </main>
  );
}
