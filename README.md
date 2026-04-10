# OpenKERN

[![CI](https://github.com/KERNTechnology/openkern/actions/workflows/ci.yml/badge.svg)](https://github.com/KERNTechnology/openkern/actions/workflows/ci.yml)
[![License: BSL 1.1](https://img.shields.io/badge/license-BSL%201.1-blue.svg)](LICENSE)
[![Payload CMS](https://img.shields.io/badge/Payload%20CMS-3.81.0-6366f1.svg)](https://payloadcms.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org)
[![Tests](https://img.shields.io/badge/tests-114-brightgreen.svg)](#testing)

**Modern web publishing stack on your own AWS. Open source. One command.**

OpenKERN deploys Payload CMS + Next.js as a serverless stack on your AWS account — Lambda, S3, CloudFront, Infrastructure as Code. Everything runs on your infrastructure, nothing is locked in.

Built by [KERN](https://www.kern.technology) as the foundation for client projects. **Free to use for everyone** — whether you're a KERN client or just want a modern CMS stack on AWS.

**Try it:** [Register for a free API token](https://install.openkern.org/register.html) and deploy in under 30 minutes.  
**Want KERN to build your site?** [Let's talk](https://www.kern.technology#kontakt)

---

## What You Get

- **Payload CMS 3.x** — headless CMS with visual editing, built on Next.js
- **Next.js 16** — App Router, server components, static + dynamic rendering
- **AWS infrastructure** — Lambda, S3, CloudFront, deployed via Pulumi (TypeScript)
- **Starter templates** — ready-to-use designs for agencies and landing pages

---

## Quick Start

### Prerequisites

- AWS account with CLI configured (`aws configure`)
- Node.js >= 20
- Pulumi CLI (`curl -fsSL https://get.pulumi.com | sh`)

### Install

```bash
# 1. Register at install.openkern.org to get your API token

# 2. Run the installer
curl -fsSL https://install.openkern.org/install.sh | bash

# 3. Follow the prompts:
#    - Enter your API token
#    - Choose a project name and AWS region
#    - Pick a template (agency / landing)

# 4. Done. Your site is live.
```

The installer deploys Lambda + S3 + CloudFront on your AWS account and connects to the KERN managed database. No VPC, no NAT gateway, no database setup required.

### Redeploy

After making changes to your CMS or templates:

```bash
cd packages/installer && ./deploy.sh
```

This rebuilds Next.js with OpenNext, uploads to Lambda + S3, and invalidates CloudFront.

### Cleanup & Uninstall

**Scan** what OpenKERN created on your account:

```bash
curl -fsSL https://install.openkern.org/cleanup.sh | bash
```

**Remove** a specific installation:

```bash
./cleanup.sh --destroy --site my-site
```

**Remove everything** OpenKERN created:

```bash
./cleanup.sh --destroy
```

The cleanup script discovers all OpenKERN resources by tags (`Project=openkern`), handles S3 bucket emptying, CloudFront disabling, IAM policy detachment, and deletes resources in the correct dependency order. If you have multiple installations, it lists them separately and asks which one to remove.

Alternatively, if you still have the Pulumi state:

```bash
cd packages/infra/pulumi/starter
pulumi destroy
pulumi stack rm <stack-name> --yes
```

### Updates

Your OpenKERN project is your own codebase. Updates to Payload CMS, Next.js, and other dependencies are your responsibility.

**Check for outdated packages:**

```bash
cd packages/cms
npm outdated
```

**Update Payload CMS (patch/minor):**

```bash
npm update @payloadcms/db-postgres @payloadcms/richtext-lexical @payloadcms/storage-s3 @payloadcms/next @payloadcms/ui payload
```

**Update Next.js:**

```bash
npm update next eslint-config-next
```

**After updating, generate new migrations and redeploy:**

```bash
# Generate migration for schema changes
NODE_TLS_REJECT_UNAUTHORIZED=0 npx payload migrate:create update

# Test locally
npm run build

# Deploy
bash packages/installer/deploy.sh

# Run migrations on the live DB
NODE_TLS_REJECT_UNAUTHORIZED=0 npx payload migrate
```

**Important:**
- Always test `npm run build` locally before deploying
- Major version updates (e.g. Payload 3 → 4, Next.js 16 → 17) may require code changes — check the release notes
- Follow [@KERNTechnology on GitHub](https://github.com/KERNTechnology/openkern/releases) for OpenKERN-specific update notes

---

## Tiers

### Starter (Free)

The fastest way to get started. Free for everyone.

```
Your AWS Account                          KERN (managed)
┌───────────────────────┐                ┌──────────────────┐
│  Lambda (Payload CMS) │── SSL/TLS ──►  │  PostgreSQL DB   │
│  S3 (media + assets)  │                │  (shared Aurora)  │
│  CloudFront (CDN)     │                └──────────────────┘
└───────────────────────┘
```

**How it works:**
- You deploy Lambda + S3 + CloudFront on your AWS account
- Your database runs on KERN's managed Aurora instance (isolated per customer)
- Your AWS costs: **~$0-5/month** (Lambda and CloudFront free tiers)

**What this means:**
- Your CMS content (pages, posts, media metadata) is stored on KERN's managed database
- Your media files (images, documents) are stored on your own S3
- The database is for **publishing content only** — no passwords, no user data, no PII
- Each customer gets a fully isolated PostgreSQL database with dedicated credentials
- All connections are SSL-encrypted

---

### Professional

Full control. Your own database on your own AWS account.

```
Your AWS Account
┌─────────────────────────────────────┐
│  Lambda or ECS Fargate (Payload)    │
│  Aurora Serverless v2 (PostgreSQL)  │
│  S3 (media + assets)               │
│  CloudFront (CDN)                  │
│  VPC + networking                  │
└─────────────────────────────────────┘
```

**How it works:**
- Everything runs on your AWS account — compute, database, storage, CDN
- Aurora Serverless v2 with dedicated instance (scales with demand)
- Optional: ECS Fargate instead of Lambda for always-warm compute

**Your AWS costs:** ~$75+/month (Aurora ~$43, NAT Gateway ~$32, compute varies)

**Upgrade path:** `openkern upgrade` migrates from Starter to Professional (zero data loss, automated via pg_dump/pg_restore).

---

### Enterprise

Custom infrastructure, dedicated support, SLAs. Contact: enterprise@kern.technology

---

## Project Structure

```
openkern/
├── packages/
│   ├── installer/             # CLI scripts
│   │   ├── install.sh         # Main installer (curl | bash)
│   │   ├── deploy.sh          # Build & deploy (Next.js → Lambda + S3)
│   │   └── cleanup.sh         # Discover & remove OpenKERN resources
│   ├── infra/                 # Infrastructure as Code (Pulumi)
│   │   └── pulumi/
│   │       ├── starter/       # Starter tier: Lambda + S3 + CloudFront
│   │       └── professional/  # Pro tier: + VPC + Aurora + optional Fargate
│   ├── cms/                   # Payload CMS + Next.js app
│   │   ├── payload.config.ts
│   │   ├── collections/       # Pages, Posts, Media, Users
│   │   └── globals/           # Header, Footer, SiteSettings
│   └── templates/             # Starter website templates
│       ├── agency/            # Multi-page agency site
│       └── landing/           # Single landing page
└── docs/
    ├── getting-started.md
    └── architecture.md
```

---

## Technology Stack

| Layer | Technology | Why |
|---|---|---|
| CMS | Payload CMS 3.x | Open source, TypeScript-native, built on Next.js |
| Frontend | Next.js 16 (App Router) | Payload runs natively inside it — single deployment |
| Database (Starter) | KERN Managed Aurora | Zero cost, zero setup for the customer |
| Database (Pro) | Aurora Serverless v2 | Full control, scales with demand |
| Media Storage | S3 + Payload S3 Adapter | Your files on your account |
| CDN | CloudFront | Fast, cheap, AWS-native |
| Compute | Lambda via OpenNext | Serverless, $0 at idle |
| IaC | Pulumi (TypeScript) | Same language as the rest of the stack |

---

## Testing

OpenKERN has 114+ automated tests across all layers. Every push triggers CI.

```bash
# CMS unit tests (themes, access control, BlockRenderer, seed helpers)
cd packages/cms && npm test

# Installer tests (preflight, OS detection, argument parsing)
bats packages/installer/test/

# Shellcheck (strict, no warnings allowed)
shellcheck packages/installer/install.sh packages/installer/deploy.sh packages/installer/cleanup.sh
```

| Layer | Framework | Tests | What's covered |
|---|---|---|---|
| CMS | Vitest + React Testing Library | 46 | Theme resolution, access control, block rendering, media resolution, Lexical seed helpers |
| Installer | bats-core | 36 | Preflight checks, OS/WSL detection, argument parsing, dependency auto-install, logging |
| Installer | Shellcheck | 3 scripts | Strict lint, zero warnings |
| Infrastructure | TypeScript | tsc | Type safety for all Pulumi resources |

CI runs on every push and pull request:
1. **Lint & Type Check** — ESLint + TypeScript
2. **Unit Tests** — Vitest (46 tests)
3. **Build** — Next.js + OpenNext (ensures deployable artifact)
4. **Infra Check** — Pulumi TypeScript validation
5. **Installer Lint & Test** — Shellcheck strict + bats (36 tests)

---

## Troubleshooting

### CloudFront returns 403

**Symptom:** Your CloudFront distribution returns a 403 error.

**Cause:** Usually a mismatch between the CloudFront origin and Lambda/API Gateway configuration.

**Fix:** Re-run `pulumi up` to ensure all resources are in sync:
```bash
cd packages/infra/pulumi/starter
pulumi up
```

### Database connection warning during install

Non-blocking. Your local machine can't reach the database directly — the Lambda function connects from AWS. If the site fails after deployment, verify your credentials.

### Site shows "awaiting deployment"

Infrastructure was created but app code not deployed yet. Run:
```bash
cd packages/installer && ./deploy.sh
```

### Static assets return 404

Re-run the deploy script to upload assets to S3 and invalidate CloudFront:
```bash
cd packages/installer && ./deploy.sh
```

### Need help?

Contact **support@kern.technology** with your project name, error output, and AWS region.

---

## FAQ

**Who is this for?**
Anyone who wants a modern CMS on their own AWS infrastructure. Developers, agencies, tech leads — if you want Payload CMS + Next.js deployed as a serverless stack without managing infrastructure yourself, OpenKERN is for you. KERN clients get additional support and custom development.

**Is my data safe on Starter?**
Your database on KERN's Aurora is fully isolated (own PostgreSQL database, own credentials, SSL-only). Starter is for publishing content — blog posts, pages, media. For full data sovereignty, upgrade to Professional.

**Can I migrate from Starter to Professional?**
Yes. `openkern upgrade` provisions Aurora on your AWS, migrates data, updates config. Zero data loss.

**What if I need to leave KERN?**
Everything is on your AWS account. The code is open source. Export the database with `pg_dump` and point Payload at your own PostgreSQL instance.

**Why Pulumi?**
The entire stack is TypeScript — Payload, Next.js, the installer. Pulumi keeps it that way. Terraform support is planned as a community option.

---

## License

[Business Source License 1.1](LICENSE). Free for private and agency use. Commercial SaaS requires a license. Converts to Apache 2.0 after four years.

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
