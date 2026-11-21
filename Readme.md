# DHLFastLink Logistics Platform

A logistics and operations dashboard for DHLFastLink built with Next.js. It includes a public landing page, shipment tracking flow, staff login, and role-based dashboard experiences for operations teams.

## Project Overview

This app is designed to mimic a modern logistics company experience with:

- public DHLFastLink homepage
- shipment tracking page
- staff login and access flow
- operations dashboard for admin and driver roles
- AI-style operational assistant panel
- logistics data and route/tracking interfaces

## Tech Stack

- Next.js
- TypeScript
- React
- Tailwind CSS
- Prisma
- NextAuth
- Lucide Icons

## Main Features

- Responsive public homepage using DHLFastLink branding
- Tracking search for consignments and shipments
- Secure login flow for staff users
- Role-based dashboard structure
- Logistics operations overview
- AI assistant support and operational controls
- Routing and shipment management interfaces

## Project Structure

```bash
app/
  dashboard/
  login/
  track/
  agent/
  api/
components/
  public/
  dashboard/
  auth/
context/
lib/
prisma/
server/
store/
```

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Configure the database

The app uses local SQLite when neither Turso variable is set. To use Turso, set both `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`; setting only one is a configuration error. Keep `DATABASE_URL` pointed at the local SQLite database; Prisma uses it for schema generation and as the source for the initial data copy.

```env
DATABASE_URL=<your-local-file-url>
TURSO_DATABASE_URL=libsql://<your-database>.turso.io
TURSO_AUTH_TOKEN=<your-token>
```

To copy the local schema and data into a new, empty Turso database:

```bash
bun run db:migrate:turso
```

The importer applies the checked-in Prisma SQL migrations and copies all app tables in a transaction. It refuses to copy into a Turso database that already contains app data or has an unexpected schema. It does not delete or overwrite remote data.

For later schema changes, create migrations against local SQLite with Prisma, then apply each migration SQL file with `turso db shell <database-name> < path/to/migration.sql`; Prisma Migrate does not apply migrations directly to Turso in this setup.

### 3. Run the app locally

```bash
bun run dev
```

Then open:

```bash
http://localhost:3001
```

## Available Scripts

```bash
bun run dev
bun run build
bun run start
bun run lint
```

## Default Public Pages

- Home page: `/`
- Tracking page: `/track`
- Staff login: `/login`
- Dashboard: `/dashboard`
- AI agent center: `/agent`

## Notes

This logistics operations prototype demonstrates DHLFastLink workflows and is not intended as a production-grade shipping system.

## License

This project is for demo and learning purposes.
