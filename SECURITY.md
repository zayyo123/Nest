# Security Policy

## Supported Versions

This project is currently maintained from the `main` branch.

## Reporting a Vulnerability

Please do not create a public GitHub issue for security reports.

Send a private report to the repository owner with:

- A clear description of the vulnerability
- Steps to reproduce it
- Expected impact
- Any suggested fix, if available

Avoid including real credentials, production tokens, or sensitive data in the
report.

## Security Notes

- Set a strong `JWT_SECRET` outside local development.
- Keep `.env` files out of version control.
- Use TypeORM migrations instead of `DB_SYNCHRONIZE=true` for production.
- Place the backend behind HTTPS and a trusted reverse proxy in production.
