# Pengelolaan e-Document

Minimal README with quick setup steps for this Laravel + React (Vite) starter.

## Requirements

- PHP ^8.2
- Composer
- Node.js & npm

## Quick setup (development)

1. Install PHP dependencies

```bash
composer install
```

2. Copy environment file and generate app key

```bash
cp .env.example .env
php artisan key:generate
```

3. Create the local database (if using sqlite)

```bash
mkdir -p database
touch database/database.sqlite
```

4. Run migrations

```bash
php artisan migrate
```

5. Install frontend deps and start dev servers

```bash
npm install
npm run dev
```

Alternatively, start everything (server, queue, vite) via Composer script:

```bash
composer run dev
```

## Build for production

```bash
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Tests & linting

- Run PHP tests: `php artisan test` or `composer test`
- PHP lint/format: `composer run test:lint` (uses Pint)
- JS/TS linting: `npm run lint`

## Useful Composer scripts

- `composer setup` — installs deps, copies .env, runs migrations and builds assets (useful for CI)
- `composer dev` — starts dev helpers (see `composer.json`)
- `composer test` — clears config cache, lints, and runs tests

## Troubleshooting

- If migrations fail, ensure DB connection in `.env` is correct.
- If Vite fails, check Node version and reinstall `node_modules`.
