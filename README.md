# OpenKERN

**Self-installable, AWS-native web publishing stack powered by Payload CMS.**

Deploy a modern website on your own AWS account in under 10 minutes. No DevOps expertise required.

OpenKERN is built for **content publishing** — marketing sites, agency projects, blogs, landing pages. It is not designed for sensitive data, financial systems, or mission-critical applications.

---

## What You Get

- **Payload CMS 3.x** — headless CMS with visual editing, built on Next.js
- **Next.js 15** — App Router, server components, static + dynamic rendering
- **AWS infrastructure** — Lambda, S3, CloudFront, deployed via Pulumi (TypeScript)
- **Starter templates** — ready-to-use designs for agencies and landing pages

---

## Tiers

### Starter (Free)

The fastest way to get started. Perfect for personal projects, prototypes, dev environments, and small websites.

```
Your AWS Account                          KERN (managed)
┌───────────────────────┐                ┌──────────────────┐
│  Lambda (Payload CMS) │── SSL/TLS ──►  │  PostgreSQL DB   │
│  S3 (media + assets)  │                │  (shared Aurora)  │
│  CloudFront (CDN)     │                └──────────────────┘
└───────────────────────┘
```

**How it works:**
- You deploy Lambda + S3 + CloudFront on your own AWS account
- Your database runs on KERN's managed Aurora instance (isolated per customer)
- Your AWS costs: **~$0-5/month** (Lambda and CloudFront free tiers)

**What this means:**
- Your CMS content (pages, posts, media metadata) is stored on KERN's database
- Your media files (images, documents) are stored on your own S3
- The database is for **publishing content only** — no passwords, no user data, no PII
- Each customer gets a fully isolated PostgreSQL database with dedicated credentials
- All connections are SSL-encrypted

**Best for:** personal sites, small agency projects, prototypes, development environments

---

### Professional

Full control. Your own database on your own AWS account. No shared infrastructure.

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

**What this means:**
- Full data sovereignty — nothing leaves your AWS account
- You manage your own database (backups, scaling, access)
- Higher baseline cost, but no external dependencies

**Your AWS costs:** ~$75+/month (Aurora ~$43, NAT Gateway ~$32, compute varies)

**Best for:** production websites, client projects with SLAs, regulated industries, agencies that need full control

**Upgrade path:** migrate from Starter to Professional at any time with `openkern upgrade` (zero data loss, automated via pg_dump/pg_restore)

---

### Enterprise

Custom infrastructure, dedicated support, SLAs.

- Multi-region deployments
- Custom compliance requirements (GDPR, SOC 2)
- Dedicated Aurora instances with custom sizing
- Priority support with guaranteed response times
- Custom integrations and modules

**Contact:** enterprise@kern.technology

---

## Quick Start (Starter Tier)

### Prerequisites

- AWS account with CLI configured (`aws configure`)
- Node.js >= 20
- Pulumi CLI (`curl -fsSL https://get.pulumi.com | sh`)

### Install

```bash
# 1. Register at kern.technology to receive your database credentials

# 2. Run the installer
curl -fsSL https://install.openkern.org/verify-and-install.sh | bash

# 3. Follow the prompts:
#    - Enter your KERN API key and DB credentials
#    - Choose a project name and AWS region
#    - Pick a template (agency / landing)

# 4. Done! Your site is live.
```

The installer deploys Lambda + S3 + CloudFront on your AWS account and connects to the KERN managed database. No VPC, no NAT gateway, no database setup required.

---

## Project Structure

```
openkern/
├── LICENSE                    # BSL 1.1
├── README.md
├── CONTRIBUTING.md
├── packages/
│   ├── installer/             # CLI installer (shell + npx)
│   │   ├── install.sh         # curl | bash entry point
│   │   ├── bin/
│   │   │   └── create-kern-app.js
│   │   └── lib/
│   │       ├── prompts.js     # Interactive setup dialogs
│   │       ├── aws.js         # AWS preflight checks
│   │       └── deploy.js      # Deployment orchestration
│   ├── infra/                 # Infrastructure as Code (Pulumi)
│   │   └── pulumi/
│   │       ├── starter/       # Starter tier: Lambda + S3 + CloudFront
│   │       └── professional/  # Pro tier: + VPC + Aurora + optional Fargate
│   ├── cms/                   # Payload CMS configuration
│   │   ├── payload.config.ts
│   │   ├── collections/       # Pages, Posts, Media, Settings
│   │   └── plugins/
│   └── templates/             # Starter website templates
│       ├── agency/            # Multi-page agency site
│       └── landing/           # Single landing page
└── docs/
    ├── getting-started.md
    ├── architecture.md
    └── aws-prerequisites.md
```

---

## Technology Stack

| Layer | Technology | Why |
|---|---|---|
| CMS | Payload CMS 3.x | Open source, TypeScript-native, built on Next.js |
| Frontend | Next.js 15 (App Router) | Payload runs natively inside it — single deployment |
| Database (Starter) | KERN Managed Aurora | Zero cost, zero setup for the customer |
| Database (Pro) | Aurora Serverless v2 | Full control, scales with demand |
| Media Storage | S3 + Payload S3 Adapter | Your files on your account |
| CDN | CloudFront | Fast, cheap, AWS-native |
| Compute | Lambda via OpenNext | Serverless, $0 at idle |
| IaC | Pulumi (TypeScript) | Same language as the rest of the stack |

---

## FAQ

**Is my data safe on the Starter tier?**
Your database on KERN's Aurora is fully isolated (own PostgreSQL database, own credentials, SSL-only). But remember: Starter is designed for publishing content — blog posts, pages, media. It is not intended for sensitive data. If you need full data sovereignty, use the Professional tier.

**Can I migrate from Starter to Professional?**
Yes. Run `openkern upgrade` — it provisions Aurora on your AWS account, migrates your data, and updates the configuration. Zero data loss.

**What happens if KERN goes away?**
Payload CMS is open source. Your code runs on your AWS account. The only dependency on KERN (Starter tier) is the database. Export it anytime with `pg_dump` and point Payload at your own PostgreSQL instance.

**Why Pulumi and not Terraform?**
Everything in the stack is TypeScript — Payload, Next.js, the installer. Pulumi lets you write infrastructure in TypeScript too. One language, one mental model. Terraform support is planned as a community option.

---

## License

OpenKERN is licensed under the [Business Source License 1.1](LICENSE).

Free for private use, agency projects, and non-commercial use. Commercial SaaS and hosting services require a commercial license. Converts to Apache 2.0 after four years.

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
