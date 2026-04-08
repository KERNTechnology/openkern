// FILE: packages/cms/src/seed/index.ts
//
// Seed script that populates a fresh OpenKERN deployment with demo content.
// Content is theme-aware: "minimal" (one-pager), "corporate" (multi-page),
// or "bold" (Schoenberg Digital agency showcase).
//
// Called via:  payload run src/seed/index.ts   (or imported programmatically)
//
// Uses the Payload Local API — no HTTP server required.

import type { Payload } from "payload";

type ThemeName = "minimal" | "bold" | "corporate";

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
// eslint-disable-next-line
function lexicalRoot(children: Record<string, unknown>[]): any {
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

/** Stagger publish dates for posts. */
function makeDateHelper(base: Date = new Date("2026-03-15T10:00:00Z")) {
  return (daysAgo: number) =>
    new Date(base.getTime() - daysAgo * 86_400_000).toISOString();
}

/* ===========================================================================
   THEME: minimal — Starter One-Pager
   =========================================================================== */

async function seedMinimalPages(payload: Payload): Promise<void> {
  if (!(await collectionIsEmpty(payload, "pages"))) {
    payload.logger.info("-- Pages collection is not empty, skipping.");
    return;
  }

  payload.logger.info("-- Seeding Pages (minimal)...");

  await payload.create({
    collection: "pages",
    data: {
      title: "Startseite",
      slug: "home",
      _status: "published",
      publishedAt: new Date().toISOString(),
      layout: [
        {
          blockType: "hero",
          headline: "Willkommen auf Ihrer neuen Website",
          subheadline:
            "Dies ist Ihre OpenKERN-Website. Sie sehen gerade das Starter-Theme — eine Einseiter-Vorlage, die Ihnen zeigt, wie alles funktioniert. Bearbeiten Sie diese Inhalte im Admin-Panel unter /admin.",
          primaryCta: { label: "Admin-Panel öffnen", url: "/admin" },
          secondaryCta: { label: "So funktioniert's", url: "#leistungen" },
        },
        {
          blockType: "services",
          headline: "So bearbeiten Sie Ihre Website",
          subheadline:
            "Jeder dieser Blöcke kann im Admin-Panel angepasst werden. Gehen Sie zu Seiten → Startseite → Layout.",
          services: [
            {
              title: "Seiten bearbeiten",
              description:
                "Öffnen Sie /admin und klicken Sie auf 'Seiten'. Hier finden Sie alle Ihre Seiten. Jede Seite hat einen Titel, einen Slug (URL-Pfad) und Inhaltsblöcke, die Sie per Drag & Drop anordnen können.",
              icon: "pen-tool",
            },
            {
              title: "Blog-Beiträge erstellen",
              description:
                "Unter 'Posts' im Admin-Panel können Sie Blog-Artikel verfassen. Jeder Beitrag hat einen Titel, eine Kategorie, ein Vorschaubild und einen Rich-Text-Editor für den Inhalt.",
              icon: "megaphone",
            },
            {
              title: "Medien verwalten",
              description:
                "Alle Bilder und Dokumente werden unter 'Media' verwaltet und auf Ihrem eigenen AWS S3-Bucket gespeichert. Laden Sie Bilder hoch und verwenden Sie sie in Ihren Seiten und Beiträgen.",
              icon: "palette",
            },
            {
              title: "Einstellungen anpassen",
              description:
                "Unter 'Settings' finden Sie die globalen Einstellungen: Website-Name, Beschreibung, Theme-Auswahl, Navigation und Footer. Änderungen werden sofort live.",
              icon: "chart",
            },
          ],
        },
        {
          blockType: "portfolio",
          headline: "Beispiel-Projekte",
          subheadline:
            "Dieser Block zeigt ein Portfolio-Raster. Ersetzen Sie diese Beispiele mit Ihren eigenen Projekten im Admin-Panel unter Seiten → Startseite → Layout → Portfolio.",
          items: [
            {
              title: "Projekt Alpha",
              description:
                "Dies ist ein Beispiel-Projekt. Bearbeiten Sie Titel, Beschreibung und Bild im Admin-Panel.",
              image: null,
            },
            {
              title: "Projekt Beta",
              description:
                "Fügen Sie einen Link hinzu, um Besucher zu einer Detailseite oder einer externen URL zu leiten.",
              image: null,
            },
            {
              title: "Projekt Gamma",
              description:
                "Sie können bis zu 6 Projekte in diesem Block anzeigen. Löschen Sie diese Beispiele und fügen Sie Ihre eigenen hinzu.",
              image: null,
            },
          ],
        },
        {
          blockType: "testimonials",
          headline: "Kundenstimmen",
          testimonials: [
            {
              quote:
                "Dies ist ein Beispiel-Zitat. Ersetzen Sie es mit echtem Feedback Ihrer Kunden. Authentische Stimmen schaffen Vertrauen.",
              author: "Max Mustermann",
              role: "Geschäftsführer",
              company: "Beispiel GmbH",
            },
            {
              quote:
                "Fügen Sie so viele Testimonials hinzu, wie Sie möchten. Jedes Zitat besteht aus dem Text, dem Autor, seiner Rolle und dem Unternehmen.",
              author: "Erika Musterfrau",
              role: "Marketing-Leiterin",
              company: "Demo AG",
            },
          ],
        },
        {
          blockType: "cta",
          headline: "Bereit, loszulegen?",
          description:
            "Öffnen Sie das Admin-Panel und ersetzen Sie diese Demo-Inhalte mit Ihren eigenen. Bei Fragen: support@kern.technology",
          buttonLabel: "Zum Admin-Panel",
          buttonUrl: "/admin",
        },
      ],
      meta: {
        title: "Meine Website — Erstellt mit OpenKERN",
        description:
          "Ihre neue Website mit OpenKERN. Bearbeiten Sie alle Inhalte im Admin-Panel.",
      },
    },
  });

  payload.logger.info("   1 page created.");
}

async function seedMinimalPosts(payload: Payload): Promise<void> {
  if (!(await collectionIsEmpty(payload, "posts"))) {
    payload.logger.info("-- Posts collection is not empty, skipping.");
    return;
  }

  payload.logger.info("-- Seeding Posts (minimal)...");

  const daysAgo = makeDateHelper();

  // Post 1: How to create your first blog post
  await payload.create({
    collection: "posts",
    data: {
      title: "So erstellen Sie Ihren ersten Blog-Beitrag",
      slug: "erster-blog-beitrag",
      _status: "published",
      publishedAt: daysAgo(0),
      category: "blog",
      excerpt:
        "Eine kurze Anleitung, wie Sie im Admin-Panel neue Blog-Beiträge verfassen und veröffentlichen.",
      content: lexicalRoot([
        heading("h2", "Ihr erster Blog-Beitrag in 5 Schritten"),
        paragraph(
          "Einen neuen Blog-Beitrag zu erstellen ist unkompliziert. Folgen Sie diesen Schritten und Ihr erster Artikel ist in wenigen Minuten online.",
        ),
        heading("h3", "1. Admin-Panel öffnen"),
        paragraph(
          "Navigieren Sie zu /admin in Ihrem Browser. Falls Sie noch nicht eingeloggt sind, melden Sie sich mit Ihren Zugangsdaten an.",
        ),
        heading("h3", "2. Neuen Beitrag anlegen"),
        paragraph(
          "Klicken Sie in der Seitenleiste auf 'Posts' und dann auf 'Create New'. Sie sehen jetzt den Editor für einen neuen Beitrag.",
        ),
        heading("h3", "3. Felder ausfüllen"),
        paragraph(
          "Geben Sie einen Titel ein — der Slug (URL-Pfad) wird automatisch generiert. Wählen Sie eine Kategorie, schreiben Sie einen kurzen Auszug (Excerpt) und verfassen Sie Ihren Inhalt im Rich-Text-Editor.",
        ),
        heading("h3", "4. Vorschaubild hinzufügen"),
        paragraph(
          "Laden Sie unter 'Hero Image' ein Bild hoch, das als Vorschaubild in der Blog-Übersicht und als Header im Beitrag angezeigt wird.",
        ),
        heading("h3", "5. Veröffentlichen"),
        paragraph(
          "Ändern Sie den Status oben rechts von 'Draft' auf 'Published' und klicken Sie auf 'Save'. Ihr Beitrag ist jetzt live unter /blog/[slug] erreichbar.",
        ),
      ]),
      meta: {
        title: "So erstellen Sie Ihren ersten Blog-Beitrag",
        description:
          "Schritt-für-Schritt-Anleitung zum Erstellen und Veröffentlichen von Blog-Beiträgen in OpenKERN.",
      },
    },
  });

  // Post 2: Tips for good website content
  await payload.create({
    collection: "posts",
    data: {
      title: "Tipps für gute Website-Inhalte",
      slug: "tipps-website-inhalte",
      _status: "published",
      publishedAt: daysAgo(3),
      category: "blog",
      excerpt:
        "Praktische Tipps für Texte, Bilder und Struktur, die bei Ihren Besuchern ankommen.",
      content: lexicalRoot([
        heading("h2", "So schreiben Sie Inhalte, die ankommen"),
        paragraph(
          "Gute Website-Inhalte sind kein Zufall. Mit ein paar einfachen Grundregeln wird Ihre Website überzeugender, klarer und angenehmer zu lesen.",
        ),
        heading("h3", "Überschriften, die neugierig machen"),
        paragraph(
          "Ihre Überschrift ist das Erste, was Besucher sehen. Formulieren Sie sie so, dass sofort klar wird, worum es geht — und warum es relevant ist. Vermeiden Sie generische Titel wie 'Herzlich willkommen'. Sagen Sie stattdessen, was Sie besonders macht.",
        ),
        heading("h3", "Kurze Absätze, klare Sprache"),
        paragraph(
          "Lange Textblöcke schrecken ab. Halten Sie Absätze bei 2-3 Sätzen. Verwenden Sie einfache, direkte Sprache. Schreiben Sie so, wie Sie mit einem Kunden sprechen würden — professionell, aber nicht steif.",
        ),
        heading("h3", "Call-to-Actions nicht vergessen"),
        paragraph(
          "Jede Seite sollte ein Ziel haben. Was soll der Besucher als Nächstes tun? Kontakt aufnehmen? Einen Beitrag lesen? Ein Produkt ansehen? Machen Sie es mit einem klaren Call-to-Action-Button deutlich.",
        ),
        heading("h3", "Bilder mit Bedacht einsetzen"),
        paragraph(
          "Gute Bilder werten Ihre Seite auf, schlechte ziehen sie herunter. Verwenden Sie hochwertige Fotos und achten Sie auf passende Dateigrößen. OpenKERN optimiert Bilder automatisch, aber das Ausgangsmaterial sollte stimmen.",
        ),
      ]),
      meta: {
        title: "Tipps für gute Website-Inhalte",
        description:
          "Praktische Tipps für Texte, Bilder und Struktur — so erstellen Sie Website-Inhalte, die überzeugen.",
      },
    },
  });

  payload.logger.info("   2 posts created.");
}

async function seedMinimalGlobals(
  payload: Payload,
  theme: ThemeName,
): Promise<void> {
  payload.logger.info("-- Seeding globals (minimal)...");

  await payload.updateGlobal({
    slug: "header",
    data: {
      navItems: [
        { label: "Startseite", url: "/" },
        { label: "Blog", url: "/blog" },
      ],
      ctaButton: {
        enabled: true,
        label: "Admin-Panel",
        url: "/admin",
      },
    },
  });

  await payload.updateGlobal({
    slug: "footer",
    data: {
      columns: [
        {
          heading: "OpenKERN",
          links: [
            { label: "Admin-Panel", url: "/admin" },
            {
              label: "Dokumentation",
              url: "https://github.com/KERNTechnology/openkern",
            },
            {
              label: "Support",
              url: "mailto:support@kern.technology",
            },
          ],
        },
      ],
      copyright: "Erstellt mit OpenKERN",
    },
  });

  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      theme,
      siteName: "Meine Website",
      siteDescription:
        "Erstellt mit OpenKERN — bearbeiten Sie diese Einstellung im Admin-Panel unter Settings.",
    },
  });
}

/* ===========================================================================
   THEME: corporate — Professional Multi-Page
   =========================================================================== */

async function seedCorporatePages(payload: Payload): Promise<void> {
  if (!(await collectionIsEmpty(payload, "pages"))) {
    payload.logger.info("-- Pages collection is not empty, skipping.");
    return;
  }

  payload.logger.info("-- Seeding Pages (corporate)...");

  // Homepage
  await payload.create({
    collection: "pages",
    data: {
      title: "Startseite",
      slug: "home",
      _status: "published",
      publishedAt: new Date().toISOString(),
      layout: [
        {
          blockType: "hero",
          headline: "Ihre professionelle Website mit OpenKERN",
          subheadline:
            "Sie sehen das Professional-Theme mit mehreren Unterseiten. Jede Seite erklärt sich selbst — so lernen Sie Ihr CMS kennen, während Sie es nutzen.",
          primaryCta: { label: "Leistungen entdecken", url: "/leistungen" },
          secondaryCta: { label: "Admin-Panel", url: "/admin" },
        },
        {
          blockType: "services",
          headline: "Was diese Website kann",
          subheadline:
            "OpenKERN gibt Ihnen alle Werkzeuge für einen professionellen Webauftritt.",
          services: [
            {
              title: "Mehrere Seiten",
              description:
                "Erstellen Sie beliebig viele Unterseiten — Leistungen, Über uns, Kontakt, Team. Jede Seite hat ihren eigenen URL-Pfad und kann individuell gestaltet werden.",
              icon: "globe",
            },
            {
              title: "Blog & News",
              description:
                "Veröffentlichen Sie regelmäßig Artikel, um bei Google gefunden zu werden. Der Blog ist bereits eingerichtet und wartet auf Ihre ersten Beiträge.",
              icon: "megaphone",
            },
            {
              title: "Flexible Layouts",
              description:
                "Kombinieren Sie verschiedene Inhaltsblöcke: Hero, Leistungen, Portfolio, Testimonials, Call-to-Action und Freitext. Per Drag & Drop im Admin-Panel.",
              icon: "code",
            },
            {
              title: "Responsive Design",
              description:
                "Ihre Website sieht auf Desktop, Tablet und Smartphone gleich gut aus. Das Theme passt sich automatisch an jede Bildschirmgröße an.",
              icon: "zap",
            },
          ],
        },
        {
          blockType: "testimonials",
          headline: "Das sagen unsere Nutzer",
          testimonials: [
            {
              quote:
                "Endlich ein CMS, das modern ist und auf unserer eigenen Infrastruktur läuft. Kein WordPress mehr!",
              author: "Anna Berger",
              role: "Inhaberin",
              company: "Berger Design Studio",
            },
            {
              quote:
                "Die Installation hat 20 Minuten gedauert. Danach hatten wir eine fertige Website mit Blog und CMS. Beeindruckend.",
              author: "Thomas Keller",
              role: "Freelance Developer",
              company: "",
            },
            {
              quote:
                "Für unsere Agentur genau das Richtige — wir können Kundenprojekte jetzt viel schneller umsetzen.",
              author: "Lena Widmer",
              role: "Creative Director",
              company: "Studio Widmer",
            },
          ],
        },
        {
          blockType: "cta",
          headline: "Entdecken Sie die Unterseiten",
          description:
            "Klicken Sie sich durch die Navigation — jede Seite erklärt, wie Sie sie anpassen können.",
          buttonLabel: "Leistungen ansehen",
          buttonUrl: "/leistungen",
        },
      ],
      meta: {
        title: "Mein Unternehmen — Professionelle Website mit OpenKERN",
        description:
          "Professionelle Website erstellt mit OpenKERN. Bearbeiten Sie alle Inhalte im Admin-Panel.",
      },
    },
  });

  // Leistungen
  await payload.create({
    collection: "pages",
    data: {
      title: "Leistungen",
      slug: "leistungen",
      _status: "published",
      publishedAt: new Date().toISOString(),
      content: lexicalRoot([
        heading("h2", "Ihre Leistungen-Seite"),
        paragraph(
          "Dies ist eine Beispiel-Seite für Ihre Leistungen oder Services. Im Admin-Panel unter Seiten → Leistungen können Sie diese Inhalte bearbeiten.",
        ),
        heading("h3", "So passen Sie diese Seite an"),
        paragraph(
          "Ersetzen Sie diesen Text mit Ihren eigenen Leistungen. Beschreiben Sie, was Sie anbieten, für wen, und was Sie von der Konkurrenz unterscheidet.",
        ),
        heading("h3", "Tipp: Layout-Blöcke verwenden"),
        paragraph(
          "Sie können diese Seite auch mit Layout-Blöcken gestalten statt mit Freitext. Bearbeiten Sie die Seite im Admin-Panel und fügen Sie unter 'Layout' einen Services-Block hinzu.",
        ),
      ]),
      meta: {
        title: "Leistungen | Mein Unternehmen",
        description:
          "Unsere Leistungen im Überblick. Bearbeiten Sie diese Seite im Admin-Panel.",
      },
    },
  });

  // Ueber uns
  await payload.create({
    collection: "pages",
    data: {
      title: "Über uns",
      slug: "ueber-uns",
      _status: "published",
      publishedAt: new Date().toISOString(),
      content: lexicalRoot([
        heading("h2", "Ihre Über-uns-Seite"),
        paragraph(
          "Hier stellen Sie sich und Ihr Team vor. Erzählen Sie Ihre Geschichte — wer Sie sind, was Sie antreibt, und warum Kunden mit Ihnen arbeiten sollten.",
        ),
        heading("h3", "Was gehört auf eine gute Über-uns-Seite?"),
        paragraph(
          "Ihre Geschichte, Ihre Werte, Ihr Team. Zeigen Sie Gesichter — Menschen vertrauen Menschen, nicht Logos. Fügen Sie unter 'Media' Team-Fotos hinzu und verlinken Sie sie hier.",
        ),
        heading("h3", "Team-Seite erstellen"),
        paragraph(
          "Tipp: Erstellen Sie eine eigene Team-Seite unter Seiten → Neu. Vergeben Sie den Slug 'team' und verlinken Sie sie in der Navigation unter Settings → Header.",
        ),
      ]),
      meta: {
        title: "Über uns | Mein Unternehmen",
        description:
          "Lernen Sie uns kennen. Bearbeiten Sie diese Seite im Admin-Panel.",
      },
    },
  });

  // Kontakt
  await payload.create({
    collection: "pages",
    data: {
      title: "Kontakt",
      slug: "kontakt",
      _status: "published",
      publishedAt: new Date().toISOString(),
      content: lexicalRoot([
        heading("h2", "Ihre Kontakt-Seite"),
        paragraph(
          "Machen Sie es Ihren Besuchern einfach, Sie zu erreichen. Zeigen Sie Ihre E-Mail-Adresse, Telefonnummer und Adresse.",
        ),
        heading("h3", "Kontaktformular hinzufügen"),
        paragraph(
          "OpenKERN enthält standardmäßig kein Kontaktformular. Sie können eines mit einem Payload-Plugin oder einem externen Service wie Formspree oder Typeform einbinden. Fragen Sie uns: support@kern.technology",
        ),
        paragraph(
          "E-Mail: hello@example.com | Telefon: +49 123 456789 | Adresse: Musterstraße 1, 80331 München",
        ),
      ]),
      meta: {
        title: "Kontakt | Mein Unternehmen",
        description:
          "Nehmen Sie Kontakt mit uns auf. Bearbeiten Sie diese Seite im Admin-Panel.",
      },
    },
  });

  payload.logger.info("   4 pages created.");
}

async function seedCorporatePosts(payload: Payload): Promise<void> {
  if (!(await collectionIsEmpty(payload, "posts"))) {
    payload.logger.info("-- Posts collection is not empty, skipping.");
    return;
  }

  payload.logger.info("-- Seeding Posts (corporate)...");

  const daysAgo = makeDateHelper();

  // Post 1: Welcome to your blog
  await payload.create({
    collection: "posts",
    data: {
      title: "Willkommen auf Ihrem neuen Blog",
      slug: "willkommen-blog",
      _status: "published",
      publishedAt: daysAgo(0),
      category: "blog",
      excerpt:
        "Ihr Blog ist eingerichtet und bereit für Ihre Inhalte. Hier erfahren Sie, wie er funktioniert.",
      content: lexicalRoot([
        heading("h2", "Ihr Blog ist startklar"),
        paragraph(
          "Dieser Beitrag ist einer von vier Beispiel-Artikeln, die Ihnen zeigen, wie der Blog funktioniert. Sie finden alle Beiträge im Admin-Panel unter 'Posts'.",
        ),
        paragraph(
          "Ihr Blog ist unter /blog erreichbar. Neue Beiträge erscheinen automatisch in der Übersicht, sortiert nach Veröffentlichungsdatum. Jeder Beitrag hat seine eigene URL unter /blog/[slug].",
        ),
        heading("h3", "Was Sie mit Ihrem Blog tun können"),
        paragraph(
          "Ein Blog hilft Ihnen, bei Google gefunden zu werden, Ihre Expertise zu zeigen und mit Ihrer Zielgruppe in Kontakt zu bleiben. Veröffentlichen Sie regelmäßig Beiträge zu Themen, die Ihre Kunden interessieren.",
        ),
        paragraph(
          "Löschen Sie diese Beispiel-Beiträge, sobald Sie Ihre eigenen Inhalte erstellt haben. Oder bearbeiten Sie sie als Vorlage für Ihre ersten Artikel.",
        ),
      ]),
      meta: {
        title: "Willkommen auf Ihrem neuen Blog",
        description:
          "Ihr Blog ist eingerichtet. Erfahren Sie, wie er funktioniert und wie Sie ihn nutzen.",
      },
    },
  });

  // Post 2: How to write your first post
  await payload.create({
    collection: "posts",
    data: {
      title: "So schreiben Sie Ihren ersten Beitrag",
      slug: "erster-beitrag",
      _status: "published",
      publishedAt: daysAgo(3),
      category: "blog",
      excerpt:
        "Schritt-für-Schritt-Anleitung: So erstellen und veröffentlichen Sie einen Blog-Beitrag im Admin-Panel.",
      content: lexicalRoot([
        heading("h2", "Einen Beitrag erstellen — so geht's"),
        heading("h3", "1. Admin-Panel öffnen"),
        paragraph(
          "Gehen Sie zu /admin und melden Sie sich an. In der Seitenleiste finden Sie den Punkt 'Posts'.",
        ),
        heading("h3", "2. Neuen Beitrag anlegen"),
        paragraph(
          "Klicken Sie auf 'Create New'. Sie sehen den Editor mit allen Feldern: Titel, Slug, Kategorie, Excerpt, Inhalt und Vorschaubild.",
        ),
        heading("h3", "3. Inhalt schreiben"),
        paragraph(
          "Der Rich-Text-Editor unterstützt Überschriften, fett/kursiv, Listen, Links und Bilder. Schreiben Sie Ihren Text und formatieren Sie ihn nach Belieben.",
        ),
        heading("h3", "4. Veröffentlichen"),
        paragraph(
          "Setzen Sie den Status auf 'Published' und speichern Sie. Ihr Beitrag ist sofort unter /blog/[slug] verfügbar.",
        ),
        paragraph(
          "Tipp: Speichern Sie zunächst als 'Draft', wenn Sie den Beitrag noch nicht veröffentlichen möchten. Entwürfe sind nur im Admin-Panel sichtbar.",
        ),
      ]),
      meta: {
        title: "So schreiben Sie Ihren ersten Beitrag",
        description:
          "Schritt-für-Schritt-Anleitung zum Erstellen eines Blog-Beitrags in OpenKERN.",
      },
    },
  });

  // Post 3: SEO tips
  await payload.create({
    collection: "posts",
    data: {
      title: "SEO-Tipps für Ihre Website",
      slug: "seo-tipps",
      _status: "published",
      publishedAt: daysAgo(7),
      category: "blog",
      excerpt:
        "Einfache Maßnahmen, mit denen Sie Ihre Website für Suchmaschinen optimieren — auch ohne SEO-Vorkenntnisse.",
      content: lexicalRoot([
        heading("h2", "Suchmaschinenoptimierung leicht gemacht"),
        paragraph(
          "SEO klingt kompliziert, aber die wichtigsten Grundlagen sind einfach umzusetzen. Hier sind die Maßnahmen, die den größten Unterschied machen.",
        ),
        heading("h3", "Seitentitel und Meta-Beschreibung"),
        paragraph(
          "Jede Seite und jeder Beitrag in OpenKERN hat Felder für 'Meta Title' und 'Meta Description'. Diese Texte erscheinen in den Google-Suchergebnissen. Formulieren Sie sie so, dass sie zum Klicken einladen und das Thema der Seite klar benennen.",
        ),
        heading("h3", "Sprechende URLs (Slugs)"),
        paragraph(
          "Der Slug bestimmt die URL Ihrer Seite. Verwenden Sie kurze, beschreibende Slugs: 'leistungen' statt 'page-2', 'seo-tipps' statt 'post-12345'. OpenKERN generiert Slugs automatisch aus dem Titel — prüfen Sie trotzdem, ob er passt.",
        ),
        heading("h3", "Überschriften-Hierarchie"),
        paragraph(
          "Verwenden Sie H2 für Hauptabschnitte und H3 für Unterabschnitte. Eine klare Überschriften-Struktur hilft Suchmaschinen und Besuchern gleichermaßen, Ihre Inhalte zu verstehen.",
        ),
        heading("h3", "Regelmäßig neue Inhalte"),
        paragraph(
          "Suchmaschinen bevorzugen Websites, die regelmäßig aktualisiert werden. Ihr Blog ist das perfekte Werkzeug dafür. Schon ein bis zwei Beiträge pro Monat machen einen Unterschied.",
        ),
      ]),
      meta: {
        title: "SEO-Tipps für Ihre Website",
        description:
          "Einfache SEO-Maßnahmen für Ihre OpenKERN-Website — Meta-Titel, Slugs, Überschriften und mehr.",
      },
    },
  });

  // Post 4: Using images effectively
  await payload.create({
    collection: "posts",
    data: {
      title: "Bilder richtig einsetzen",
      slug: "bilder-einsetzen",
      _status: "published",
      publishedAt: daysAgo(12),
      category: "blog",
      excerpt:
        "So verwalten Sie Bilder in OpenKERN: hochladen, optimieren und in Ihren Seiten und Beiträgen einsetzen.",
      content: lexicalRoot([
        heading("h2", "Medienverwaltung in OpenKERN"),
        paragraph(
          "Bilder machen Ihre Website lebendig. OpenKERN bietet eine integrierte Medienverwaltung, die das Hochladen und Verwalten von Bildern einfach macht.",
        ),
        heading("h3", "Bilder hochladen"),
        paragraph(
          "Gehen Sie im Admin-Panel zu 'Media' und klicken Sie auf 'Upload'. Sie können einzelne Bilder oder mehrere Dateien gleichzeitig hochladen. Unterstützte Formate: JPG, PNG, WebP, SVG.",
        ),
        heading("h3", "Bilder in Seiten verwenden"),
        paragraph(
          "In Layout-Blöcken wie Hero oder Portfolio können Sie Bilder direkt aus der Medienbibliothek auswählen. Im Rich-Text-Editor fügen Sie Bilder über den Image-Button in der Toolbar ein.",
        ),
        heading("h3", "Tipps für gute Bilder"),
        paragraph(
          "Verwenden Sie Bilder in hoher Auflösung — OpenKERN generiert automatisch verschiedene Größen für unterschiedliche Bildschirme. Achten Sie auf aussagekräftige Dateinamen und fügen Sie Alt-Texte hinzu, damit Suchmaschinen und Screenreader Ihre Bilder verstehen.",
        ),
        heading("h3", "Speicherplatz"),
        paragraph(
          "Ihre Medien werden auf Ihrem eigenen AWS S3-Bucket gespeichert. Sie haben die volle Kontrolle über Ihre Daten und keine Speicherlimits durch Drittanbieter.",
        ),
      ]),
      meta: {
        title: "Bilder richtig einsetzen",
        description:
          "So verwalten und nutzen Sie Bilder in OpenKERN — Upload, Optimierung und Best Practices.",
      },
    },
  });

  payload.logger.info("   4 posts created.");
}

async function seedCorporateGlobals(
  payload: Payload,
  theme: ThemeName,
): Promise<void> {
  payload.logger.info("-- Seeding globals (corporate)...");

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
        label: "Admin-Panel",
        url: "/admin",
      },
    },
  });

  await payload.updateGlobal({
    slug: "footer",
    data: {
      columns: [
        {
          heading: "Seiten",
          links: [
            { label: "Startseite", url: "/" },
            { label: "Leistungen", url: "/leistungen" },
            { label: "Über uns", url: "/ueber-uns" },
            { label: "Kontakt", url: "/kontakt" },
          ],
        },
        {
          heading: "Blog",
          links: [{ label: "Alle Beiträge", url: "/blog" }],
        },
        {
          heading: "OpenKERN",
          links: [
            { label: "Admin-Panel", url: "/admin" },
            {
              label: "GitHub",
              url: "https://github.com/KERNTechnology/openkern",
            },
            {
              label: "Support",
              url: "mailto:support@kern.technology",
            },
          ],
        },
      ],
      copyright: "Erstellt mit OpenKERN",
    },
  });

  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      theme,
      siteName: "Mein Unternehmen",
      siteDescription:
        "Professionelle Website erstellt mit OpenKERN. Bearbeiten Sie alle Inhalte im Admin-Panel.",
    },
  });
}

/* ===========================================================================
   THEME: bold — Schoenberg Digital Agency Showcase
   =========================================================================== */

async function seedBoldPages(payload: Payload): Promise<void> {
  if (!(await collectionIsEmpty(payload, "pages"))) {
    payload.logger.info("-- Pages collection is not empty, skipping.");
    return;
  }

  payload.logger.info("-- Seeding Pages (bold)...");

  // 1. Startseite (Home) — uses layout blocks
  await payload.create({
    collection: "pages",
    data: {
      title: "Startseite",
      slug: "home",
      _status: "published",
      publishedAt: new Date().toISOString(),
      layout: [
        {
          blockType: "hero",
          headline: "Wir gestalten digitale Erlebnisse",
          subheadline:
            "Schönberg Digital ist Ihre Boutique-Agentur für Webdesign, Branding und digitale Strategie. Wir helfen Unternehmen im DACH-Raum, online zu überzeugen.",
          primaryCta: { label: "Projekt starten", url: "/kontakt" },
          secondaryCta: { label: "Unsere Arbeit", url: "/leistungen" },
        },
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

  // 2. Leistungen
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

  // 3. Ueber uns
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

  // 4. Kontakt
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

async function seedBoldPosts(payload: Payload): Promise<void> {
  if (!(await collectionIsEmpty(payload, "posts"))) {
    payload.logger.info("-- Posts collection is not empty, skipping.");
    return;
  }

  payload.logger.info("-- Seeding Posts (bold)...");

  const daysAgo = makeDateHelper();

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
        title: "Unser Prozess in 4 Schritten | Schönberg Digital",
        description:
          "So arbeiten wir: Von der Analyse bis zum Launch — unser Webprojekt-Prozess im Überblick.",
      },
    },
  });

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

async function seedBoldGlobals(
  payload: Payload,
  theme: ThemeName,
): Promise<void> {
  payload.logger.info("-- Seeding globals (bold)...");

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
 * Content is theme-aware:
 * - "minimal" — Starter one-pager with instructional content
 * - "corporate" — Professional multi-page site with guided subpages
 * - "bold" — Schoenberg Digital agency showcase
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

  if (resolvedTheme === "minimal") {
    await seedMinimalPages(payload);
    await seedMinimalPosts(payload);
    await seedMinimalGlobals(payload, resolvedTheme);
  } else if (resolvedTheme === "corporate") {
    await seedCorporatePages(payload);
    await seedCorporatePosts(payload);
    await seedCorporateGlobals(payload, resolvedTheme);
  } else {
    // bold — existing Schoenberg Digital content
    await seedBoldPages(payload);
    await seedBoldPosts(payload);
    await seedBoldGlobals(payload, resolvedTheme);
  }

  payload.logger.info("=== OpenKERN Seed: Complete ===");
}

export default seed;

// Auto-execute when called via `payload run src/seed/index.ts`
import { getPayload } from "payload";
import config from "@payload-config";

const run = async () => {
  const payload = await getPayload({ config });
  await seed(payload);
  payload.logger.info("Seed complete. Exiting.");
  process.exit(0);
};

await run();
