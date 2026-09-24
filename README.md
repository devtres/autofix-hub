# Autofix Hub
# AutoFix Hub

A direct-to-consumer web store for automotive and motorcycle parts. Customers can filter parts by vehicle **make, model, year and engine displacement**, place orders, and track them. Admins manage products, stock, orders and suppliers.

> **Prototype / showroom build.** There is no payment integration. Checkout uses "Cash on Delivery (demo)" and no real transactions occur.

## Objectives

1. Develop a product management system.
2. Provide an ordering and tracking module.

## Features

**Customer**
- Browse parts by category, search, and filter by vehicle compatibility
- Cart ("Your Garage") and checkout
- Track an order by order number and email
- Order history (signed-in users)

**Admin**
- Product management: create, edit, deactivate, fitment, categories
- Inventory: automatic stock deduction, low-stock alerts, manual restocking
- Order management and status updates
- Suppliers and store settings

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React-Bootstrap, Sass |
| Backend | Node.js, Express |
| Database | MySQL 8 |
| Authentication | Auth0 (JWT, role-based access) |

## Project Structure

```
autofix-hub/
├── client/     # React app (storefront + admin)
├── server/     # Express REST API
├── database/   # SQL schema, seed data, views
└── docs/       # ERD, API notes, design references
```

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8
- An Auth0 account (free tier)

### 1. Clone
```bash
git clone https://github.com/<your-username>/autofix-hub.git
cd autofix-hub
git checkout develop
```

### 2. Database
```bash
mysql -u root -p -e "CREATE DATABASE autofix_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p autofix_hub < database/01_schema.sql
mysql -u root -p autofix_hub < database/02_seed.sql
mysql -u root -p autofix_hub < database/03_views_and_indexes.sql
```

### 3. Environment variables
Copy `.env.example` to `.env` in `server/` and `client/`, then fill in your values.
Never commit `.env` files.

### 4. Run the API
```bash
cd server
npm install
npm run dev
```

### 5. Run the client
```bash
cd client
npm install
npm run dev
```

## Git Workflow

| Branch | Purpose |
|---|---|
| `main` | Stable, demo-ready. Tagged releases only. |
| `develop` | Integration branch. All features merge here via pull request. |
| `feature/<name>` | One branch per feature, created from `develop`. |
| `hotfix/<name>` | Urgent fixes to `main`. |

- Never push directly to `main` or `develop`. Open a pull request and get one review.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/), for example `feat(orders): add stock deduction transaction`.

## Order Status Lifecycle

```
pending → confirmed → packed → shipped → out_for_delivery → delivered
                    ↘ cancelled (only before "shipped")
```

## Team

| Name | Role |
|---|---|
| _Name_ | _e.g. Database_ |
| _Name_ | _e.g. Backend_ |
| _Name_ | _e.g. Storefront UI_ |
| _Name_ | _e.g. Admin UI_ |

## Status

Work in progress. See the GitHub Issues and Projects board for the current roadmap.
