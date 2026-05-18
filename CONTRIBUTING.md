# Contributing

Thanks for taking the time to improve Nest Manager.

## Development Setup

Install dependencies for each app:

```bash
cd nest-app
npm install

cd ../frontend/vue-app
npm install
```

Run the backend and frontend in separate terminals:

```bash
cd nest-app
npm run start:dev
```

```bash
cd frontend/vue-app
npm run dev
```

## Pull Request Checklist

- Keep changes focused on one problem or feature.
- Add or update tests when behavior changes.
- Run the relevant checks before opening a PR.
- Update documentation when commands, APIs, or setup steps change.
- Do not commit secrets, local database files, logs, or generated dependencies.

## Recommended Checks

Backend:

```bash
cd nest-app
npm run build
npm run test
npm run test:e2e
```

Frontend:

```bash
cd frontend/vue-app
npm run typecheck
npm run build
```

## Commit Style

Use short, imperative commit messages:

```text
Add project ownership guard
Fix task status filtering
Document Docker setup
```
