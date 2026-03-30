# Getting Started with OpenKERN

## Overview

OpenKERN deploys a Payload CMS website on your AWS account. The Starter tier uses a KERN-managed database, so you only need Lambda, S3, and CloudFront on your end.

## Prerequisites

1. **AWS account** with CLI configured (`aws configure`)
2. **Node.js >= 20** installed
3. **Pulumi CLI** installed (`curl -fsSL https://get.pulumi.com | sh`)
4. **KERN database credentials** — register at kern.technology

## Installation

```bash
curl -fsSL https://install.openkern.org/install.sh | bash
```

The installer will:
1. Run preflight checks (AWS CLI, Node.js, Pulumi)
2. Ask for your KERN database credentials
3. Ask for project name, AWS region, and template choice
4. Deploy Lambda + S3 + CloudFront on your AWS account
5. Assign a random subdomain (`<random>.openkern.org`)
6. Build and deploy via OpenNext (Next.js → Lambda)
7. Create your admin account
8. Output your site URL and admin panel URL

## After Installation

- Visit `/admin` to log into the Payload CMS admin panel
- Add pages, posts, and media through the visual editor
- Your site auto-updates when you publish content

## Domains

Every site gets a free subdomain: `<random>.openkern.org` (e.g. `a7f3x9bc.openkern.org`). This is assigned automatically during installation.

### Custom Domain (Free)

To use your own domain alongside the openkern.org subdomain:

1. Create an ACM certificate for your domain in **us-east-1** (required by CloudFront)
2. During installation, enter your domain and the ACM certificate ARN when prompted
3. After deployment, point a CNAME from your domain to `<random>.openkern.org`

You can also add a custom domain after installation by updating the Pulumi config:

```bash
cd packages/infra/pulumi/starter
pulumi config set openkern:customDomain yourdomain.com
pulumi config set openkern:customCertArn arn:aws:acm:us-east-1:123:certificate/abc
pulumi up --yes
```

Then point your DNS CNAME to your `<random>.openkern.org` subdomain.

## Upgrading to Professional

When you need full data sovereignty or higher performance:

```bash
openkern upgrade
```

This provisions Aurora Serverless v2 on your own AWS account, migrates your data, and updates the configuration. No data loss, no downtime.
