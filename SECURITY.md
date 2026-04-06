# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in OpenKERN, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, email us at: **security@kern.technology**

We will acknowledge your report within 48 hours and provide a timeline for a fix.

## Scope

This policy covers:

- The OpenKERN installer (`install.sh`, `deploy.sh`, `cleanup.sh`)
- The Payload CMS configuration and themes
- The Pulumi infrastructure code
- The OpenKERN onboarding API (`api.openkern.org`)

## Out of Scope

- Vulnerabilities in third-party dependencies (Payload CMS, Next.js, AWS SDK, Pulumi) — please report these to the respective projects
- Issues in customer-deployed infrastructure (your own AWS account)

## Security Model

- **Database credentials** are encrypted with AWS KMS and never exposed to the client
- **API tokens** are SHA-256 hashed before storage
- **SSL/TLS** is enforced on all database connections
- **Each customer** gets an isolated PostgreSQL database with dedicated credentials
- **No long-lived AWS keys** — the installer uses the customer's existing AWS CLI credentials
