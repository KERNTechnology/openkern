# OpenKERN

**Standardized AWS stack for KERN client projects.**

OpenKERN deploys a modern web publishing stack (Payload CMS + Next.js) on your AWS account. It's the technical tool behind [kern.technology](https://www.kern.technology) — designed for tech leads who need to roll out the KERN stack on their infrastructure.

**Sent here by KERN?** [Register for your API token](https://install.openkern.org/register.html) and deploy in under 30 minutes.

---

## What You Get

- **Payload CMS 3.x** — headless CMS with visual editing, built on Next.js
- **Next.js 15** — App Router, server components, static + dynamic rendering
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

---

## Tiers

### Starter (Free)

The default for new KERN client projects.

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

## Troubleshooting

### CloudFront returns 403

**Symptom:** Your site at `<subdomain>.openkern.org` shows a CloudFront 403 error.

**Fix:**
```bash
cd packages/infra/pulumi/starter
pulumi config get openkern:wildcardCertArn

# If empty, fetch from KERN API:
CERT_ARN=$(curl -s -H "Authorization: Bearer $YOUR_TOKEN" \
  https://api.openkern.org/v1/config | grep -o '"wildcardCertArn":"[^"]*"' | cut -d'"' -f4)
pulumi config set openkern:wildcardCertArn "$CERT_ARN"
pulumi up
```

### InvalidViewerCertificate error

CloudFront requires certificates in `us-east-1`. Verify your cert ARN starts with `arn:aws:acm:us-east-1:`.

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

### DNS not resolving

```bash
dig <subdomain>.openkern.org CNAME

# If missing, re-create:
CF_DOMAIN=$(cd packages/infra/pulumi/starter && pulumi stack output distributionDomain)
curl -s -X POST -H "Authorization: Bearer $YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"subdomain\":\"<subdomain>\",\"cloudfrontDomain\":\"$CF_DOMAIN\"}" \
  https://api.openkern.org/v1/dns
```

### Need help?

Contact **support@kern.technology** with your project name, subdomain, error output, and AWS region.

---

## FAQ

**Who is this for?**
Tech leads and developers at agencies that work with KERN. If your agency uses KERN for web projects, this is the tool to deploy the stack on your AWS.

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
