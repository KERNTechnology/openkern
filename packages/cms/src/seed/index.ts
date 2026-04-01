// FILE: packages/cms/src/seed/index.ts
//
// Seed script that populates a fresh OpenKERN deployment with demo content.
// Called via:  payload run src/seed/index.ts   (or imported programmatically)
//
// Uses the Payload Local API — no HTTP server required.

import type { Payload } from "payload";

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

/* ---------------------------------------------------------------------------
   Seed: Pages
   -------------------------------------------------------------------------- */

async function seedPages(payload: Payload): Promise<void> {
  if (!(await collectionIsEmpty(payload, "pages"))) {
    payload.logger.info("-- Pages collection is not empty, skipping.");
    return;
  }

  payload.logger.info("-- Seeding Pages...");

  await payload.create({
    collection: "pages",
    data: {
      title: "Startseite",
      slug: "home",
      _status: "published",
      publishedAt: new Date().toISOString(),
      content: {
        root: {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "Willkommen auf deiner neuen OpenKERN-Website. Diese Seite wird vom Template gerendert. Bearbeite sie im Admin-Panel unter /admin.",
                },
              ],
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          version: 1,
        },
      },
      meta: {
        title: "Willkommen | OpenKERN",
        description:
          "Deine neue Website mit OpenKERN — Payload CMS + Next.js auf deinem eigenen AWS-Account.",
      },
    },
  });

  await payload.create({
    collection: "pages",
    data: {
      title: "Über uns",
      slug: "about",
      _status: "published",
      publishedAt: new Date().toISOString(),
      content: {
        root: {
          type: "root",
          children: [
            {
              type: "heading",
              tag: "h2",
              children: [{ type: "text", text: "Über OpenKERN" }],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "OpenKERN ist ein selbst-installierbarer JAM-Stack, der Payload CMS mit Next.js auf deinem eigenen AWS-Account verbindet. Volle Kontrolle, keine Vendor-Locks.",
                },
              ],
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          version: 1,
        },
      },
      meta: {
        title: "Über uns | OpenKERN",
        description:
          "Erfahre mehr über OpenKERN — den selbst-installierbaren JAM-Stack von KERN.",
      },
    },
  });

  await payload.create({
    collection: "pages",
    data: {
      title: "Features",
      slug: "features",
      _status: "published",
      publishedAt: new Date().toISOString(),
      content: {
        root: {
          type: "root",
          children: [
            {
              type: "heading",
              tag: "h2",
              children: [{ type: "text", text: "Features" }],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "Payload CMS mit Visual Editor, Next.js 15 mit App Router, serverlose Architektur auf AWS mit Lambda, S3 und CloudFront — alles automatisiert mit Pulumi.",
                },
              ],
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          version: 1,
        },
      },
      meta: {
        title: "Features | OpenKERN",
        description:
          "Alle Features im Überblick: Payload CMS, Next.js 15, AWS Lambda, S3, CloudFront und mehr.",
      },
    },
  });

  payload.logger.info("   3 pages created.");
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

  await payload.create({
    collection: "posts",
    data: {
      title: "Deine erste Website mit OpenKERN",
      slug: "erste-website-mit-openkern",
      _status: "published",
      publishedAt: new Date().toISOString(),
      category: "blog",
      excerpt:
        "So funktioniert der OpenKERN-Stack: Payload CMS, Next.js und AWS in einer schlüsselfertigen Lösung.",
      content: {
        root: {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "OpenKERN kombiniert Payload CMS mit Next.js 15 auf AWS. Der gesamte Stack wird über Pulumi auf deinem eigenen AWS-Account provisioniert. Du bekommst Lambda-Functions, S3-Buckets, CloudFront-Distributions und eine PostgreSQL-Datenbank — alles automatisch konfiguriert.",
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "Das Admin-Panel erreichst du unter /admin. Dort kannst du Seiten, Posts und Medien verwalten. Jede Änderung wird sofort live — dank Server-Side Rendering mit Next.js.",
                },
              ],
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          version: 1,
        },
      },
      meta: {
        title: "Deine erste Website mit OpenKERN",
        description:
          "So funktioniert der OpenKERN-Stack: Payload CMS, Next.js und AWS.",
      },
    },
  });

  await payload.create({
    collection: "posts",
    data: {
      title: "Warum Payload CMS?",
      slug: "warum-payload-cms",
      _status: "published",
      publishedAt: new Date().toISOString(),
      category: "blog",
      excerpt:
        "Payload CMS ist ein modernes Headless CMS, das direkt in Next.js integriert ist. Hier erfährst du, warum wir es gewählt haben.",
      content: {
        root: {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "Payload CMS ist ein TypeScript-first Headless CMS, das direkt als Next.js-Plugin läuft. Es gibt keinen separaten Server — das Admin-Panel und die API sind Teil deiner Next.js-App. Das bedeutet: ein Deployment, ein Repository, ein Tech-Stack.",
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "Mit Payload bekommst du: Collections (z.B. Pages, Posts, Media), Globals (z.B. Header, Footer, Settings), einen Lexical Rich-Text-Editor, Versionierung mit Drafts, und eine vollständige REST + GraphQL API.",
                },
              ],
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          version: 1,
        },
      },
      meta: {
        title: "Warum Payload CMS? | OpenKERN Blog",
        description:
          "Payload CMS ist TypeScript-first, läuft in Next.js, und gibt dir volle Kontrolle.",
      },
    },
  });

  await payload.create({
    collection: "posts",
    data: {
      title: "Serverlos auf AWS: So funktioniert die Architektur",
      slug: "serverlos-auf-aws",
      _status: "published",
      publishedAt: new Date().toISOString(),
      category: "news",
      excerpt:
        "Lambda, S3, CloudFront und PostgreSQL — der OpenKERN-Stack nutzt AWS-Services für maximale Skalierbarkeit bei minimalen Kosten.",
      content: {
        root: {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "OpenKERN nutzt OpenNext, um die Next.js-App als Lambda-Function auf AWS zu deployen. Statische Assets landen auf S3 und werden über CloudFront ausgeliefert. Die Datenbank ist eine verwaltete PostgreSQL-Instanz (RDS oder Aurora Serverless).",
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "Der gesamte Infrastruktur-Code liegt als Pulumi-Programm im Repository. Du kannst den Stack jederzeit anpassen, skalieren oder in eine andere Region verschieben. Alles unter deiner Kontrolle — kein Vendor-Lock-in.",
                },
              ],
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          version: 1,
        },
      },
      meta: {
        title: "Serverlos auf AWS | OpenKERN Blog",
        description:
          "Lambda, S3, CloudFront — so funktioniert die serverlose Architektur von OpenKERN.",
      },
    },
  });

  payload.logger.info("   3 posts created.");
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
        { label: "Features", url: "#features" },
        { label: "Blog", url: "#" },
      ],
      ctaButton: {
        enabled: true,
        label: "Admin Panel",
        url: "/admin",
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
          heading: "Links",
          links: [
            { label: "Admin Panel", url: "/admin" },
            { label: "GitHub", url: "https://github.com/niceSolutions" },
            { label: "KERN", url: "https://kern.de" },
          ],
        },
      ],
      copyright: `\u00A9 ${new Date().getFullYear()} OpenKERN. Alle Rechte vorbehalten.`,
      socialLinks: [
        { platform: "github", url: "https://github.com/niceSolutions" },
      ],
    },
  });
}

async function seedSiteSettings(payload: Payload): Promise<void> {
  payload.logger.info("-- Seeding SiteSettings global...");

  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      siteName: "OpenKERN",
      siteDescription:
        "Deine neue Website mit OpenKERN — Payload CMS + Next.js auf deinem eigenen AWS-Account.",
    },
  });
}

/* ---------------------------------------------------------------------------
   Public API
   -------------------------------------------------------------------------- */

/**
 * Seeds the database with demo content for a fresh OpenKERN deployment.
 *
 * Safe to call multiple times — collections that already contain documents
 * will be skipped. Globals are always overwritten with seed data.
 */
export async function seed(payload: Payload): Promise<void> {
  payload.logger.info("=== OpenKERN Seed: Starting ===");

  await seedPages(payload);
  await seedPosts(payload);
  await seedHeader(payload);
  await seedFooter(payload);
  await seedSiteSettings(payload);

  payload.logger.info("=== OpenKERN Seed: Complete ===");
}

export default seed;
