# DHL Clone Logistics Platform

A simple DHL-inspired logistics and operations dashboard built with Next.js. This project includes a public landing page, shipment tracking flow, staff login, and role-based dashboard experiences for operations teams.

## Project Overview

This app is designed to mimic a modern logistics company experience with:

- public DHL-style homepage
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

- Responsive public homepage inspired by DHL branding
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

### 2. Run the app locally

```bash
bun run dev
```

Then open:

```bash
http://localhost:3000
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

This is a frontend-heavy DHL-inspired clone and operations prototype. It is intended to demonstrate a logistics platform UI and workflow rather than a production-grade shipping system.

## License

This project is for demo and learning purposes.
