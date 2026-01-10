# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start development server (http://localhost:5173)
pnpm build      # Type-check with tsc then build for production
pnpm preview    # Preview production build
```

## Architecture

Capitol Trades is a SolidJS application for tracking congressional stock trades. It uses Vite as the build tool and @solidjs/router for client-side routing.

### Tech Stack
- **Framework**: SolidJS with TypeScript
- **Router**: @solidjs/router
- **Build**: Vite with vite-plugin-solid
- **TypeScript**: Strict mode with ES2022 target

### Directory Structure
- `src/routes/` - Page components (home, trades, politicians)
- `src/components/` - Reusable UI components (header, stats-row, trades-table, politician-card, filter-bar)
- `src/data/` - Static data and TypeScript types
- `src/styles/` - Global CSS; route-specific styles are co-located with route components

### Routing
Three routes defined in `App.tsx`:
- `/` - Home dashboard with latest trades, featured politicians, and issuers
- `/trades` - Full trades listing with filtering
- `/politicians` - Politicians listing

### Data Model
Core types in `src/data/types.ts`:
- `Trade` - Stock transaction with embedded politician and issuer info
- `Politician` - Congress member with party, chamber, state
- `Issuer` - Company/entity being traded
- Union types: `Party`, `Chamber`, `TradeType`, `OwnerType`

Currently uses static mock data in `src/data/`.
