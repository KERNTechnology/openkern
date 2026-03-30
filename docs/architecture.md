# OpenKERN Architecture

## Starter Tier

```
Customer AWS Account                     KERN (managed)
┌────────────────────────┐              ┌──────────────────┐
│                        │              │                  │
│  CloudFront (CDN)      │              │  Aurora Serverless│
│  ├── /_next/static/*   │              │  (PostgreSQL 16) │
│  │   └── S3 (assets)   │              │                  │
│  ├── /media/*          │   SSL/TLS    │  Per customer:   │
│  │   └── S3 (media)    │              │  - Own database  │
│  └── /* (default)      │              │  - Own user      │
│      └── Lambda ───────┼──────────────┤  - Own password  │
│         (OpenNext)     │              │  - Conn limit    │
│         Payload CMS    │              │                  │
│         Next.js SSR    │              └──────────────────┘
│                        │
└────────────────────────┘

Customer cost: ~$0-5/month
```

### Request Flow

1. User visits `https://example.com`
2. CloudFront routes the request:
   - Static assets (`/_next/static/*`) → S3 assets bucket (cached)
   - Media files (`/media/*`) → S3 media bucket (cached)
   - Everything else → Lambda function
3. Lambda runs Payload CMS via OpenNext (Next.js serverless adapter)
4. Payload queries the KERN managed PostgreSQL database (SSL-encrypted)
5. Response flows back through CloudFront (compressed, HTTP/2)

### Why No VPC?

The Lambda function connects to the KERN database over the public internet with SSL encryption. This eliminates the need for:
- VPC (~$0 but adds complexity)
- NAT Gateway (~$32/month)
- VPC endpoints

This is the same model used by Neon, Supabase, and PlanetScale.

## Professional Tier

```
Customer AWS Account
┌─────────────────────────────────────────┐
│                                         │
│  CloudFront (CDN)                       │
│  └── Lambda or ECS Fargate              │
│      └── Payload CMS + Next.js          │
│                                         │
│  VPC                                    │
│  ├── Public Subnets                     │
│  │   └── NAT Gateway                   │
│  └── Private Subnets                    │
│      └── Aurora Serverless v2           │
│          (PostgreSQL, dedicated)        │
│                                         │
│  S3 (media + assets)                    │
│                                         │
└─────────────────────────────────────────┘

Customer cost: ~$75+/month
```

Everything runs on the customer's AWS account. Full data sovereignty. No external dependencies.

## Technology Choices

| Decision | Choice | Rationale |
|---|---|---|
| CMS | Payload 3.x | TypeScript-native, runs inside Next.js, open source |
| Framework | Next.js 15 | App Router, SSR + static, Payload's native runtime |
| Serverless adapter | OpenNext | Deploys Next.js to Lambda with proper routing |
| IaC | Pulumi (TypeScript) | Same language as the application code |
| Database | PostgreSQL (Aurora) | Payload's recommended adapter, relational queries |
| Media storage | S3 + @payloadcms/storage-s3 | Direct upload to customer's bucket |
| CDN | CloudFront | AWS-native, free tier (1TB/month), HTTP/2 |

## Security Model (Starter Tier)

- **Database isolation:** Each customer gets a dedicated PostgreSQL database (not just a schema)
- **Credentials:** Unique username + auto-generated 40-character password per customer
- **Encryption in transit:** SSL/TLS enforced (`sslmode=require`, `rds.force_ssl=1`)
- **Encryption at rest:** Aurora storage encrypted with AWS KMS
- **Connection limits:** Per-user connection limit (default: 20) prevents resource abuse
- **No shared data:** Customers cannot access each other's databases

## Data Classification

OpenKERN Starter is designed for **publishing content**:
- CMS pages and posts
- Media metadata (file references)
- Navigation and site settings
- Form submissions (contact forms)

It is **not designed** for:
- User authentication / PII storage
- Financial or payment data
- Health records
- Any data requiring regulatory compliance beyond standard web publishing

For these use cases, upgrade to Professional (own database, own infrastructure).
