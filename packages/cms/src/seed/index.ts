// FILE: packages/cms/src/seed/index.ts
//
// Seed script that populates a fresh OpenKERN deployment with demo content
// for a fictional boutique agency called "Schoenberg Digital".
//
// Called via:  payload run src/seed/index.ts   (or imported programmatically)
//
// Uses the Payload Local API — no HTTP server required.

import type { Payload } from "payload";
import type { ThemeName } from "@/themes/types";

/* ---------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */

/** Check whether a collection already has docs so we can skip re-seeding. */
async function collectionIsEmpty(
  payload: Payload,
  slug: string,
): Promise<boolean> {
  const result = await payload.find({
    collection: slug as "pages" | "posts",
    limit: 1,
  });
  return result.totalDocs === 0;
}

/** Shorthand for a Lexical text node. */
function textNode(text: string) {
  return { type: "text" as const, text };
}

/** Shorthand for a Lexical paragraph node. */
function paragraph(text: string) {
  return {
    type: "paragraph" as const,
    children: [textNode(text)],
  };
}

/** Shorthand for a Lexical heading node. */
function heading(tag: "h1" | "h2" | "h3" | "h4", text: string) {
  return {
    type: "heading" as const,
    tag,
    children: [textNode(text)],
  };
}

/** Wrap children in a Lexical root structure. */
function lexicalRoot(children: Record<string, unknown>[]) {
  return {
    root: {
      type: "root",
      children,
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
    },
  };
}

/* ---------------------------------------------------------------------------
   Seed: Pages
   -------------------------------------------------------------------------- */

async function seedPages(payload: Payload): Promise<void> {
  if (!(await collectionIsEmpty(payload, "pages"))) {
    payload.logger.info("-- Pages collection is not empty, skipping.");
    return;
  }

  payload.logger.info("-- Seeding Pages...");

  // 1. Startseite (Home) — uses layout blocks
  await payload.create({
    collection: "pages",
    data: {
      title: "Startseite",
      slug: "home",
      _status: "published",
      publishedAt: new Date().toISOString(),
      layout: [
        // Hero block
        {
          blockType: "hero",
          headline: "Wir gestalten digitale Erlebnisse",
          subheadline:
            "Schönberg Digital ist Ihre Boutique-Agentur für Webdesign, Branding und digitale Strategie. Wir helfen Unternehmen im DACH-Raum, online zu überzeugen.",
          primaryCta: { label: "Projekt starten", url: "/kontakt" },
          secondaryCta: { label: "Unsere Arbeit", url: "/leistungen" },
        },
        // Services block
        {
          blockType: "services",
          headline: "Was wir tun",
          subheadline:
            "Von der Strategie bis zur Umsetzung — alles aus einer Hand.",
          services: [
            {
              title: "Webdesign & Entwicklung",
              description:
                "Moderne Websites, die begeistern. Responsive, schnell, und auf Ihre Marke zugeschnitten. Von der Landingpage bis zum kompletten Webauftritt.",
              icon: "code",
            },
            {
              title: "Branding & Identität",
              description:
                "Wir entwickeln Ihre Markenidentität — vom Logo über die Farbwelt bis zum kompletten Corporate Design, das in Erinnerung bleibt.",
              icon: "palette",
            },
            {
              title: "Content & Strategie",
              description:
                "Inhalte, die ankommen. Wir entwickeln Ihre Content-Strategie und erstellen Texte, die Ihre Zielgruppe erreichen und überzeugen.",
              icon: "megaphone",
            },
            {
              title: "Digitale Beratung",
              description:
                "Wo steht Ihre digitale Präsenz? Wir analysieren, beraten und begleiten Sie auf dem Weg zu einem modernen, effektiven Webauftritt.",
              icon: "chart",
            },
          ],
        },
        // Portfolio block
        {
          blockType: "portfolio",
          headline: "Ausgewählte Projekte",
          subheadline:
            "Ein Auszug aus unserer Arbeit für Kunden im DACH-Raum.",
          items: [
            {
              title: "Alpine Consulting — Relaunch",
              description:
                "Kompletter digitaler Neuauftritt für eine Münchner Unternehmensberatung. Webdesign, Content und SEO.",
              image: null,
            },
            {
              title: "Bergkraft Naturkosmetik",
              description:
                "Markenentwicklung und Online-Shop für ein Tiroler Naturkosmetik-Label. Von der Strategie bis zum Launch.",
              image: null,
            },
            {
              title: "Dock9 Coworking",
              description:
                "Website und Buchungssystem für einen Coworking-Space in Zürich. Minimalistisches Design, maximale Funktion.",
              image: null,
            },
          ],
        },
        // Testimonials block
        {
          blockType: "testimonials",
          headline: "Was unsere Kunden sagen",
          testimonials: [
            {
              quote:
                "Schönberg Digital hat unseren Webauftritt komplett transformiert. Die Zusammenarbeit war professionell, transparent und hat unsere Erwartungen übertroffen.",
              author: "Dr. Anna Berger",
              role: "Geschäftsführerin",
              company: "Alpine Consulting",
            },
            {
              quote:
                "Endlich eine Agentur, die nicht nur schön designt, sondern auch versteht, wie digitales Marketing funktioniert. Unsere Anfragen haben sich verdoppelt.",
              author: "Thomas Keller",
              role: "Gründer",
              company: "Bergkraft Naturkosmetik",
            },
            {
              quote:
                "Schnell, unkompliziert und mit einem Auge fürs Detail. Die neue Website ist genau das, was wir gebraucht haben.",
              author: "Lena Widmer",
              role: "Community Managerin",
              company: "Dock9 Coworking",
            },
          ],
        },
        // CTA block
        {
          blockType: "cta",
          headline: "Bereit für Ihr nächstes Projekt?",
          description:
            "Lassen Sie uns über Ihre Ziele sprechen. Wir freuen uns auf Ihre Nachricht.",
          buttonLabel: "Kontakt aufnehmen",
          buttonUrl: "/kontakt",
        },
      ],
      meta: {
        title: "Schönberg Digital — Webdesign, Branding & Strategie",
        description:
          "Boutique-Agentur für Webdesign, Branding und digitale Strategie im DACH-Raum.",
      },
    },
  });

  // 2. Leistungen — uses content (rich text)
  await payload.create({
    collection: "pages",
    data: {
      title: "Leistungen",
      slug: "leistungen",
      _status: "published",
      publishedAt: new Date().toISOString(),
      content: lexicalRoot([
        heading("h2", "Unsere Leistungen"),
        paragraph(
          "Webdesign & Entwicklung: Wir gestalten und entwickeln moderne Websites, die nicht nur gut aussehen, sondern auch technisch überzeugen. Responsive Design, schnelle Ladezeiten und eine intuitive Benutzerführung sind für uns selbstverständlich. Ob Landingpage, Unternehmenswebsite oder komplexer Webauftritt — wir liefern maßgeschneiderte Lösungen, die Ihre Zielgruppe begeistern.",
        ),
        paragraph(
          "Branding & Identität: Eine starke Marke ist mehr als ein Logo. Wir entwickeln Ihre komplette visuelle Identität — von der Farbwelt über die Typografie bis zum Corporate Design Manual. So stellen wir sicher, dass Ihre Marke über alle Kanäle hinweg konsistent und wiedererkennbar auftritt.",
        ),
        paragraph(
          "Content & Strategie: Guter Content ist der Schlüssel zu nachhaltigem Online-Erfolg. Wir entwickeln Ihre Content-Strategie, erstellen suchmaschinenoptimierte Texte und sorgen dafür, dass Ihre Botschaft bei der richtigen Zielgruppe ankommt. Von der Redaktionsplanung bis zum fertigen Blogbeitrag.",
        ),
        paragraph(
          "Digitale Beratung: Sie möchten Ihren digitalen Auftritt auf den Prüfstand stellen? Wir analysieren Ihre bestehende Webpräsenz, identifizieren Optimierungspotenziale und begleiten Sie Schritt für Schritt auf dem Weg zu einem modernen, effektiven Online-Auftritt. Ehrlich, pragmatisch und lösungsorientiert.",
        ),
      ]),
      meta: {
        title: "Leistungen | Schönberg Digital",
        description:
          "Webdesign, Branding, Content-Strategie und digitale Beratung — unsere Leistungen im Überblick.",
      },
    },
  });

  // 3. Ueber uns — uses content (rich text)
  await payload.create({
    collection: "pages",
    data: {
      title: "Über uns",
      slug: "ueber-uns",
      _status: "published",
      publishedAt: new Date().toISOString(),
      content: lexicalRoot([
        heading("h2", "Wir sind Schönberg Digital"),
        paragraph(
          "Schönberg Digital ist eine Boutique-Agentur mit Sitz in Rosenheim, Bayern. Als kleines, spezialisiertes Team arbeiten wir mit Unternehmen im gesamten DACH-Raum zusammen — von lokalen Handwerksbetrieben bis zu mittelständischen B2B-Unternehmen.",
        ),
        paragraph(
          "Unser Ansatz: Qualität vor Quantität. Wir nehmen bewusst nur eine begrenzte Anzahl an Projekten gleichzeitig an, damit jedes die Aufmerksamkeit bekommt, die es verdient. Keine Fließbandarbeit, keine Templates von der Stange — jedes Projekt wird individuell konzipiert und umgesetzt.",
        ),
        paragraph(
          "Was uns antreibt, ist die Überzeugung, dass gutes Design und durchdachte Technik zusammengehören. Deshalb vereinen wir strategisches Denken, kreative Gestaltung und moderne Webtechnologien unter einem Dach. Das Ergebnis: digitale Auftritte, die nicht nur schön sind, sondern auch messbar wirken.",
        ),
      ]),
      meta: {
        title: "Über uns | Schönberg Digital",
        description:
          "Lernen Sie Schönberg Digital kennen — Ihre Boutique-Agentur für Webdesign und Branding in Rosenheim.",
      },
    },
  });

  // 4. Kontakt — uses content (rich text)
  await payload.create({
    collection: "pages",
    data: {
      title: "Kontakt",
      slug: "kontakt",
      _status: "published",
      publishedAt: new Date().toISOString(),
      content: lexicalRoot([
        heading("h2", "Schreiben Sie uns"),
        paragraph(
          "Haben Sie ein Projekt im Kopf oder möchten Sie sich unverbindlich beraten lassen? Wir freuen uns auf Ihre Nachricht und melden uns in der Regel innerhalb von 24 Stunden zurück.",
        ),
        paragraph(
          "E-Mail: hallo@schoenberg.digital | Telefon: +49 8031 123 456 0",
        ),
        paragraph(
          "Schönberg Digital GmbH | Maximilianstraße 12 | 83022 Rosenheim | Deutschland",
        ),
      ]),
      meta: {
        title: "Kontakt | Schönberg Digital",
        description:
          "Nehmen Sie Kontakt mit Schönberg Digital auf. Wir freuen uns auf Ihr Projekt.",
      },
    },
  });

  payload.logger.info("   4 pages created.");
}

/* ---------------------------------------------------------------------------
   Seed: Posts
   -------------------------------------------------------------------------- */

async function seedPosts(payload: Payload): Promise<void> {
  if (!(await collectionIsEmpty(payload, "posts"))) {
    payload.logger.info("-- Posts collection is not empty, skipping.");
    return;
  }

  payload.logger.info("-- Seeding Posts...");

  // Stagger publish dates so posts appear in a sensible order
  const baseDate = new Date("2026-03-15T10:00:00Z");
  const daysAgo = (days: number) =>
    new Date(baseDate.getTime() - days * 86_400_000).toISOString();

  // Post 1
  await payload.create({
    collection: "posts",
    data: {
      title: "Warum gutes Webdesign Ihr wichtigstes Marketing-Tool ist",
      slug: "warum-gutes-webdesign-ihr-wichtigstes-marketing-tool-ist",
      _status: "published",
      publishedAt: daysAgo(0),
      category: "blog",
      excerpt:
        "Ihre Website ist oft der erste Kontaktpunkt mit potenziellen Kunden. Warum gutes Design kein Luxus, sondern eine Investition ist.",
      content: lexicalRoot([
        paragraph(
          "In einer digitalen Welt, in der der erste Eindruck oft online entsteht, ist Ihre Website weit mehr als eine digitale Visitenkarte. Sie ist Ihr wichtigstes Marketing-Tool — rund um die Uhr verfügbar, global erreichbar und oft der entscheidende Faktor, ob ein potenzieller Kunde zum Hörer greift oder weiterklickt.",
        ),
        paragraph(
          "Gutes Webdesign bedeutet nicht nur ansprechende Optik. Es bedeutet klare Strukturen, intuitive Navigation, schnelle Ladezeiten und eine konsequente Ausrichtung auf die Bedürfnisse Ihrer Zielgruppe. Jedes Element — von der Typografie bis zum Call-to-Action — sollte einem Ziel dienen.",
        ),
        paragraph(
          "Unternehmen, die in professionelles Webdesign investieren, sehen messbare Ergebnisse: höhere Verweildauer, niedrigere Absprungraten und mehr qualifizierte Anfragen. Design ist keine Kostenstelle — es ist ein Wachstumstreiber.",
        ),
      ]),
      meta: {
        title:
          "Warum gutes Webdesign Ihr wichtigstes Marketing-Tool ist | Schönberg Digital",
        description:
          "Ihre Website ist Ihr wichtigstes Marketing-Tool. Warum gutes Design kein Luxus ist.",
      },
    },
  });

  // Post 2
  await payload.create({
    collection: "posts",
    data: {
      title: "5 Trends im Branding für 2026",
      slug: "5-trends-im-branding-fuer-2026",
      _status: "published",
      publishedAt: daysAgo(5),
      category: "blog",
      excerpt:
        "Von Authentizität bis Motion Design — diese Branding-Trends sollten Sie 2026 auf dem Schirm haben.",
      content: lexicalRoot([
        paragraph(
          "Branding entwickelt sich ständig weiter. Was gestern noch modern war, kann heute schon veraltet wirken. Für 2026 zeichnen sich einige klare Trends ab, die Marken im DACH-Raum kennen sollten: Authentizität statt Perfektion, bewegte Markenelemente, strategischer Einsatz von KI in der Gestaltung, nachhaltige Markenkommunikation und hyper-personalisierte Markenerlebnisse.",
        ),
        paragraph(
          "Besonders spannend: Der Trend zur Authentizität. Kunden erwarten heute echte Geschichten, echte Menschen und echte Werte. Hochglanz-Kampagnen ohne Substanz verlieren an Wirkung. Marken, die ehrlich kommunizieren und ihre Werte leben, gewinnen langfristig Vertrauen und Loyalität.",
        ),
        paragraph(
          "Auch Motion Branding gewinnt an Bedeutung. Logos, die sich bewegen, animierte Übergänge und interaktive Elemente schaffen ein lebendiges Markenerlebnis. In einer Welt voller statischer Inhalte fallen Marken mit Bewegung auf — und bleiben in Erinnerung.",
        ),
      ]),
      meta: {
        title: "5 Trends im Branding für 2026 | Schönberg Digital",
        description:
          "Branding-Trends 2026: Authentizität, Motion Design, KI und mehr.",
      },
    },
  });

  // Post 3
  await payload.create({
    collection: "posts",
    data: {
      title: "Case Study: Digitaler Relaunch für Alpine Consulting",
      slug: "case-study-digitaler-relaunch-alpine-consulting",
      _status: "published",
      publishedAt: daysAgo(12),
      category: "blog",
      excerpt:
        "Wie wir einer Münchner Unternehmensberatung zu einem modernen, überzeugenden Webauftritt verholfen haben.",
      content: lexicalRoot([
        paragraph(
          "Alpine Consulting, eine etablierte Unternehmensberatung aus München, kam mit einem klaren Problem zu uns: Ihre Website war in die Jahre gekommen, spiegelte nicht mehr die Qualität ihrer Arbeit wider und generierte kaum noch Anfragen über den digitalen Kanal. Die Aufgabe: ein kompletter Relaunch — Design, Content und Technik.",
        ),
        paragraph(
          "In enger Zusammenarbeit mit dem Team von Alpine Consulting entwickelten wir zunächst eine neue Positionierung und Content-Strategie. Darauf aufbauend entstand ein modernes, reduziertes Design, das Seriosität und Kompetenz ausstrahlt, ohne kühl zu wirken. Die neue Website setzt auf klare Strukturen, starke Bilder und überzeugende Texte.",
        ),
        paragraph(
          "Das Ergebnis: Die neue Website von Alpine Consulting verzeichnete in den ersten drei Monaten nach Launch 65 Prozent mehr organischen Traffic und eine Verdreifachung der Kontaktanfragen über die Website. Ein Projekt, das zeigt, wie strategisches Webdesign echten Business-Impact schaffen kann.",
        ),
      ]),
      meta: {
        title:
          "Case Study: Alpine Consulting Relaunch | Schönberg Digital",
        description:
          "Digitaler Relaunch für Alpine Consulting — Webdesign, Content und SEO aus einer Hand.",
      },
    },
  });

  // Post 4
  await payload.create({
    collection: "posts",
    data: {
      title: "Content-Strategie für B2B-Unternehmen im DACH-Raum",
      slug: "content-strategie-fuer-b2b-unternehmen-im-dach-raum",
      _status: "published",
      publishedAt: daysAgo(20),
      category: "blog",
      excerpt:
        "Warum Content-Marketing auch für B2B-Unternehmen unverzichtbar ist — und wie Sie eine Strategie entwickeln, die funktioniert.",
      content: lexicalRoot([
        paragraph(
          "Content-Marketing ist längst nicht mehr nur ein Thema für B2C-Marken. Auch im B2B-Bereich suchen Entscheider online nach Lösungen, vergleichen Anbieter und bilden sich eine Meinung, lange bevor sie zum Telefon greifen. Wer hier mit relevanten, hochwertigen Inhalten präsent ist, hat einen entscheidenden Vorteil.",
        ),
        paragraph(
          "Eine erfolgreiche Content-Strategie für B2B beginnt mit einem klaren Verständnis der Zielgruppe: Welche Fragen stellen sich Ihre potenziellen Kunden? Welche Probleme wollen sie lösen? Welche Kanäle nutzen sie? Darauf aufbauend lassen sich Formate und Themen entwickeln, die echten Mehrwert bieten — von Fachartikeln über Case Studies bis zu Webinaren.",
        ),
        paragraph(
          "Der Schlüssel liegt in der Konsistenz. Ein einzelner Blogbeitrag macht noch keine Strategie. Erst die regelmäßige Veröffentlichung relevanter Inhalte baut Sichtbarkeit, Vertrauen und Autorität auf. Beginnen Sie mit einem realistischen Redaktionsplan und bauen Sie schrittweise aus.",
        ),
      ]),
      meta: {
        title:
          "Content-Strategie für B2B im DACH-Raum | Schönberg Digital",
        description:
          "Content-Marketing für B2B: So entwickeln Sie eine Strategie, die Ergebnisse liefert.",
      },
    },
  });

  // Post 5
  await payload.create({
    collection: "posts",
    data: {
      title: "Von der Idee zum Launch: Unser Prozess in 4 Schritten",
      slug: "von-der-idee-zum-launch-unser-prozess-in-4-schritten",
      _status: "published",
      publishedAt: daysAgo(28),
      category: "blog",
      excerpt:
        "Wie wir Webprojekte umsetzen: von der Analyse über Konzept und Design bis zum Go-Live.",
      content: lexicalRoot([
        paragraph(
          "Jedes erfolgreiche Webprojekt folgt einem klaren Prozess. Bei Schönberg Digital arbeiten wir in vier Phasen, die sicherstellen, dass das Ergebnis nicht nur gut aussieht, sondern auch die richtigen Ziele erreicht. Schritt eins ist die Analyse und Strategie: Wir lernen Ihr Unternehmen, Ihre Zielgruppe und Ihre Ziele kennen. Darauf aufbauend definieren wir die Anforderungen und entwickeln eine klare Strategie.",
        ),
        paragraph(
          "In Schritt zwei folgen Konzept und Design. Hier entstehen Wireframes, Seitenststrukturen und das visuelle Konzept. Sie sehen früh, wie die fertige Website aussehen wird, und können Feedback geben, bevor eine Zeile Code geschrieben wird. Schritt drei ist die Entwicklung: Wir setzen das Design pixelgenau um, integrieren das CMS und sorgen für schnelle Ladezeiten, SEO-Optimierung und responsives Verhalten.",
        ),
        paragraph(
          "Schritt vier: Launch und Betreuung. Nach ausführlichen Tests und Ihrer finalen Freigabe geht die Website live. Aber damit hört unsere Arbeit nicht auf — wir bieten kontinuierliche Betreuung, Wartung und Weiterentwicklung, damit Ihre Website langfristig erfolgreich bleibt.",
        ),
      ]),
      meta: {
        title:
          "Unser Prozess in 4 Schritten | Schönberg Digital",
        description:
          "So arbeiten wir: Von der Analyse bis zum Launch — unser Webprojekt-Prozess im Überblick.",
      },
    },
  });

  // Post 6
  await payload.create({
    collection: "posts",
    data: {
      title: "Warum wir auf Payload CMS und Next.js setzen",
      slug: "warum-wir-auf-payload-cms-und-nextjs-setzen",
      _status: "published",
      publishedAt: daysAgo(35),
      category: "blog",
      excerpt:
        "Unser Tech-Stack im Überblick: Warum Payload CMS und Next.js die ideale Kombination für moderne Webprojekte sind.",
      content: lexicalRoot([
        paragraph(
          "Die Wahl des richtigen Tech-Stacks ist eine der wichtigsten Entscheidungen in jedem Webprojekt. Nach Jahren der Arbeit mit verschiedenen CMS und Frameworks haben wir uns bewusst für die Kombination aus Payload CMS und Next.js entschieden — und diese Entscheidung hat sich in jedem Projekt bewährt.",
        ),
        paragraph(
          "Payload CMS ist ein modernes, TypeScript-basiertes Headless CMS, das sich nahtlos in Next.js integriert. Es gibt kein separates Backend, keinen zusätzlichen Server — das CMS ist Teil der Anwendung. Das bedeutet weniger Komplexität, schnellere Entwicklung und ein einheitlicher Tech-Stack. Für unsere Kunden bedeutet das: einfache Content-Pflege über ein intuitives Admin-Panel, bei gleichzeitig maximaler Flexibilität im Frontend.",
        ),
        paragraph(
          "Next.js bringt alles mit, was moderne Websites brauchen: Server-Side Rendering für optimale SEO, statische Generierung für maximale Performance und eine hervorragende Developer Experience. In Kombination mit Payload entstehen Websites, die schnell, sicher und einfach zu pflegen sind. Genau das, was unsere Kunden brauchen.",
        ),
      ]),
      meta: {
        title:
          "Warum wir auf Payload CMS und Next.js setzen | Schönberg Digital",
        description:
          "Payload CMS und Next.js: Warum dieser Tech-Stack die ideale Wahl für moderne Webprojekte ist.",
      },
    },
  });

  payload.logger.info("   6 posts created.");
}

/* ---------------------------------------------------------------------------
   Seed: Globals
   -------------------------------------------------------------------------- */

async function seedHeader(payload: Payload): Promise<void> {
  payload.logger.info("-- Seeding Header global...");

  await payload.updateGlobal({
    slug: "header",
    data: {
      navItems: [
        { label: "Startseite", url: "/" },
        { label: "Leistungen", url: "/leistungen" },
        { label: "Über uns", url: "/ueber-uns" },
        { label: "Blog", url: "/blog" },
        { label: "Kontakt", url: "/kontakt" },
      ],
      ctaButton: {
        enabled: true,
        label: "Projekt starten",
        url: "/kontakt",
      },
    },
  });
}

async function seedFooter(payload: Payload): Promise<void> {
  payload.logger.info("-- Seeding Footer global...");

  await payload.updateGlobal({
    slug: "footer",
    data: {
      columns: [
        {
          heading: "Agentur",
          links: [
            { label: "Über uns", url: "/ueber-uns" },
            { label: "Blog", url: "/blog" },
            { label: "Kontakt", url: "/kontakt" },
          ],
        },
        {
          heading: "Leistungen",
          links: [
            { label: "Webdesign", url: "/leistungen" },
            { label: "Branding", url: "/leistungen" },
            { label: "Content", url: "/leistungen" },
            { label: "Beratung", url: "/leistungen" },
          ],
        },
        {
          heading: "Rechtliches",
          links: [
            { label: "Impressum", url: "/impressum" },
            { label: "Datenschutz", url: "/datenschutz" },
          ],
        },
      ],
      copyright:
        "\u00A9 2026 Schönberg Digital. Alle Rechte vorbehalten.",
      socialLinks: [
        { platform: "linkedin", url: "https://linkedin.com" },
        { platform: "instagram", url: "https://instagram.com" },
      ],
    },
  });
}

async function seedSiteSettings(
  payload: Payload,
  theme: ThemeName,
): Promise<void> {
  payload.logger.info("-- Seeding SiteSettings global...");

  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      theme,
      siteName: "Schönberg Digital",
      siteDescription:
        "Boutique-Agentur für Webdesign, Branding und digitale Strategie im DACH-Raum.",
    },
  });
}

/* ---------------------------------------------------------------------------
   Public API
   -------------------------------------------------------------------------- */

/**
 * Seeds the database with demo content for a fresh OpenKERN deployment.
 *
 * Populates pages and posts for a fictional boutique agency called
 * "Schoenberg Digital" (Designagentur fuer den DACH-Raum).
 *
 * Safe to call multiple times — collections that already contain documents
 * will be skipped. Globals are always overwritten with seed data.
 */
export async function seed(
  payload: Payload,
  theme: ThemeName = "minimal",
): Promise<void> {
  // Allow env override for the theme
  const resolvedTheme =
    (process.env.OPENKERN_THEME as ThemeName | undefined) ?? theme;

  payload.logger.info("=== OpenKERN Seed: Starting ===");
  payload.logger.info(`    Theme: ${resolvedTheme}`);

  await seedPages(payload);
  await seedPosts(payload);
  await seedHeader(payload);
  await seedFooter(payload);
  await seedSiteSettings(payload, resolvedTheme);

  payload.logger.info("=== OpenKERN Seed: Complete ===");
}

export default seed;
