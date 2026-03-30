# OpenKERN Architecture

## Starter Tier

```
Customer AWS Account                     KERN (managed)
┌──────────────────────────┐            ┌──────────────────────┐
│                          │            │                      │
│  <random>.openkern.org   │            │  Route53: openkern.org│
│  CloudFront (CDN)        │            │  ACM: *.openkern.org │
│  ├── /_next/static/*     │            │                      │
│  │   └── S3 (assets)     │            │  Aurora Serverless   │
│  ├── /_next/image        │            │  (PostgreSQL 16)     │
│  │   └── Lambda (image)  │  SSL/TLS   │                      │
│  ├── /media/*            │            │  Per customer:       │
│  │   └── S3 (media)      │            │  - Own database      │
│  └── /* (default)        │            │  - Own user          │
│      └── Lambda (server)─┼────────────┤  - Own password      │
│         OpenNext         │            │  - Conn limit        │
│         Payload CMS      │            │                      │
│         Next.js SSR      │            └──────────────────────┘
│                          │
└──────────────────────────┘

Customer cost: ~$0-5/month
```

### Domain Model

Every Starter site gets a subdomain under `openkern.org`:

```
<random>.openkern.org   (e.g. a7f3x9bc.openkern.org)
```

- The `openkern.org` Route53 zone and wildcard ACM certificate (`*.openkern.org`) are managed in the KERN AWS account.
- The installer generates a random 8-character subdomain and creates the CNAME record automatically.
- **Custom domains are free:** customers can add their own domain (e.g. `www.example.com`) by creating an ACM certificate in their AWS account (us-east-1) and pointing a CNAME to their `<random>.openkern.org` subdomain.

### Request Flow

1. User visits `https://a7f3x9bc.openkern.org` (or custom domain)
2. CloudFront routes the request:
   - Static assets (`/_next/static/*`) → S3 assets bucket (cached)
   - Image optimization (`/_next/image`) → Image optimization Lambda (arm64)
   - Media files (`/media/*`) → S3 media bucket (cached)
   - Everything else → Server Lambda function
3. Server Lambda runs Payload CMS via OpenNext (Next.js serverless adapter)
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
