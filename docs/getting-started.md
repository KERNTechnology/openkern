# Getting Started with OpenKERN

## Overview

OpenKERN deploys a Payload CMS website on your AWS account. The Starter tier uses a KERN-managed database, so you only need Lambda, S3, and CloudFront on your end.

## Prerequisites

1. **macOS** (the installer currently supports macOS only)
2. **AWS account** with CLI configured (`aws configure`)
3. **Node.js >= 20** installed
4. **Pulumi CLI** installed (`curl -fsSL https://get.pulumi.com | sh`)

## Installation

```bash
curl -fsSL https://install.openkern.org/install.sh | bash
```

The installer will:

1. Run preflight checks (AWS CLI, Node.js, Pulumi)
2. Read your API token from Secrets Manager (or prompt you to enter it manually)
3. Ask for project name, AWS region, and theme (Starter / Bold / Professional)
4. Deploy Lambda + S3 + CloudFront on your AWS account
5. Build and deploy via OpenNext (Next.js to Lambda)
6. Run database migrations
7. Seed demo content based on your theme choice

## After Installation

1. The installer prints your CloudFront URL at the end (e.g. `https://d1234567890.cloudfront.net`)
2. Visit that URL with `/admin` appended (e.g. `https://d1234567890.cloudfront.net/admin`)
3. Payload shows a first-user registration form — create your admin account there
4. Start editing content through the admin panel

## Custom Domain

Sites run on their CloudFront domain by default. To use your own domain:

1. Create an ACM certificate for your domain in **us-east-1** (required by CloudFront)
2. Add your domain as an alias to your CloudFront distribution
3. Point a CNAME (or A-record alias) from your domain to your CloudFront distribution domain

There are no `openkern.org` subdomains. Your site is served from CloudFront directly.

## Redeploying

After making code changes, redeploy with:

```bash
bash packages/installer/deploy.sh
```

## Your Code, Your Repo

The installed project is yours. Set up your own Git remote and manage your codebase however you like:

```bash
git remote add origin git@github.com:your-org/your-site.git
git push -u origin main
```

## Cleanup

To tear down all deployed resources:

```bash
./cleanup.sh --destroy
```

## Upgrading to Professional

When you need full data sovereignty or higher performance:

```bash
openkern upgrade
```

This provisions Aurora Serverless v2 on your own AWS account, migrates your data, and updates the configuration. No data loss, no downtime.
