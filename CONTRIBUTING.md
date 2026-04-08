# Contributing to OpenKERN

We welcome contributions! Before submitting a pull request, please read this guide.

## Contributor License Agreement (CLA)

All external contributors must sign the [CLA](CLA.md) before their pull request can be merged. This is handled automatically — when you open your first PR, the CLA bot will post a comment asking you to sign by replying with:

> I have read the CLA Document and I hereby sign the CLA

You only need to sign once. The CLA grants nice solutions GmbH the right to re-license your contribution, which is necessary to maintain the BSL 1.1 licensing model.

## How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Test locally: `npm run build` in `packages/cms`
5. Commit with a clear message
6. Open a pull request against `main`

## Code Style

- TypeScript for all code
- Follow existing patterns in the codebase
- Comments and documentation in English
- German content for user-facing text (seed data, admin descriptions)

## Reporting Issues

Open an issue on GitHub. Please include:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Your environment (OS, Node.js version, AWS region)

## Security

If you discover a security vulnerability, do **not** open a public issue. Instead, email security@kern.technology. See [SECURITY.md](SECURITY.md) for details.

## Questions?

Open a discussion on GitHub or reach out at hello@kern.technology
