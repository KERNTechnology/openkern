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
curl -fsSL https://openkern.dev/install.sh | bash
```

The installer will:
1. Run preflight checks (AWS CLI, Node.js, Pulumi)
2. Ask for your KERN database credentials
3. Ask for project name, AWS region, and template choice
4. Deploy Lambda + S3 + CloudFront on your AWS account
5. Run Payload CMS database migration
6. Output your site URL and admin panel URL

## After Installation

- Visit `/admin` to log into the Payload CMS admin panel
- Add pages, posts, and media through the visual editor
- Your site auto-updates when you publish content

## Custom Domain

To use your own domain instead of the CloudFront URL:

1. Register your domain (or use an existing one)
2. Create an ACM certificate in `us-east-1` (required for CloudFront)
3. Run `openkern domain set yourdomain.com`
4. Update your DNS to point to the CloudFront distribution

## Upgrading to Professional

When you need full data sovereignty or higher performance:

```bash
openkern upgrade
```

This provisions Aurora Serverless v2 on your own AWS account, migrates your data, and updates the configuration. No data loss, no downtime.
