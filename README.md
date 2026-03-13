# Helios - On-Call Follow the Sun Visualizer

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A human-centric on-call modeling platform that helps engineering managers design fair, sustainable rotation schedules across global teams. Visualize coverage gaps, sleep interruption risks, and fairness scores before publishing schedules.

![Helios Dashboard](public/static/images/og.png)

## Features

### Dashboard Visualizer

- **Real-time Global Map** - Interactive world map with day/night terminator overlay showing which engineers are in daylight
- **Engineer Locations** - Avatar markers at geographic locations with local time badges
- **Smart Sidebar** - 320px fixed sidebar with search, filters (Team/Role), and engineer list
- **Active State Highlighting** - Green glow border on currently selected on-call engineer
- **Glassmorphism Tooltips** - Hover over map markers for quick contact info (Slack, Phone, Email)
- **Responsive Design** - Mobile drawer for <768px, split-pane for desktop
- **Dark/Light Themes** - System preference with manual toggle, optimized color palettes for both modes

### Schedule Modeling

- **Strategy Templates** - Four rotation strategies:
  - Follow the Sun (12-hour rotating shifts)
  - 12-hour Split (day/night rotations)
  - Weekly Rotation (7-day blocks)
  - Custom (manual configuration)
- **Sunlight Timeline** - Visual timeline showing business hours (white), evening (grey), and sleep (black) zones
- **Burnout Risk Detection** - Red warning when shifts overlap sleep zones
- **Fairness Radar** - 4-axis comparison chart (Waking Hours, Sleep Risk, Weekend Liability, Handover Friction)
- **Risk Heatmap** - Define incident probability windows (e.g., high-traffic sporting events)
- **Time Slider** - Adjust UTC handover times and see immediate local time impact
- **Scenario Comparison** - Side-by-side A/B comparison of different rotation strategies

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) with App Router
- **UI Library:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Components:** [Shadcn UI](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Maps:** [react-simple-maps](https://www.react-simple-maps.io/) + [D3 Geo](https://d3js.org/d3-geo)
- **Charts:** [Recharts](https://recharts.org/)
- **Forms:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Themes:** [next-themes](https://github.com/pacocoursey/next-themes)
- **Icons:** [Lucide React](https://lucide.dev/)

## Quick Start

### Prerequisites

- Node.js >= 22.0.0
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone git@github.com:willis7/helios.git
cd helios

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:6006](http://localhost:6006) to view the application.

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm run serve
```

### Code Quality

```bash
# Run ESLint with auto-fix
npm run lint

# Format code with Prettier
npm run pretty

# Analyze bundle size
npm run analyze
```

## Project Structure

```
app/
├── page.tsx                    # Main dashboard (visualizer)
├── model/
│   ├── page.tsx               # Modeling page (server)
│   └── ModelPageClient.tsx    # Modeling page (client logic)
├── layout.tsx                 # Root layout with providers
├── theme-providers.tsx        # Theme configuration
└── seo.tsx                    # SEO utilities

components/
├── dashboard/
│   ├── DashboardLayout.tsx     # Main layout wrapper
│   ├── sidebar/               # Sidebar components
│   │   ├── DashboardSidebar.tsx
│   │   ├── EngineerCard.tsx
│   │   ├── EngineerList.tsx
│   │   ├── EngineerSearch.tsx
│   │   └── EngineerFilters.tsx
│   ├── map/                   # Map components
│   │   ├── GlobalMap.tsx
│   │   ├── TerminatorOverlay.tsx
│   │   ├── EngineerMarker.tsx
│   │   ├── EngineerTooltip.tsx
│   │   └── TimeStepper.tsx
│   └── modeling/              # Modeling components
│       ├── ModelingSidebar.tsx
│       ├── StrategySelector.tsx
│       ├── SunlightTimeline.tsx
│       ├── FairnessRadar.tsx
│       ├── RiskHeatmap.tsx
│       ├── TimeSlider.tsx
│       └── ScenarioComparison.tsx
└── shared/
    ├── ui/                    # Shadcn UI components
    └── ThemeSwitch.tsx        # Theme toggle

models/
└── engineer.ts               # TypeScript interfaces & enums

data/
├── dashboard/
│   └── engineers.ts          # Mock engineer data
└── config/
    ├── site.settings.js      # Site configuration
    └── metadata.js           # SEO metadata

lib/
└── utils.ts                  # Utility functions (cn, etc.)
```

## Architecture

### Design System

The project follows a strict design system defined in `ai_docs/design_bried.jsonc`:

- **Primary Color:** `#4ADE80` (bright mint/neon green)
- **Dark Mode:** Deep zinc grays (`#09090B` to `#27272A`) with high-contrast white text
- **Light Mode:** Inverted backgrounds maintaining green accent hierarchy
- **Typography:** Inter font family with defined hierarchy (h1: 20px, h2: 16px, body: 14px, caption: 12px)
- **Breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)

### Key Components

#### TerminatorOverlay

Uses D3 geo projections to calculate the day/night terminator line based on current time. Updates automatically every minute to show real-time sunlight across the globe.

#### SunlightTimeline

Visualizes a 24-hour timeline with color-coded zones:

- White: Business hours (9 AM - 6 PM)
- Grey: Evening/personal time (6 PM - 11 PM)
- Black: Sleep hours (11 PM - 7 AM)
- Red warning: When on-call shifts overlap sleep zones

#### FairnessRadar

4-axis radar chart comparing scenarios on:

- Waking Hours Coverage (higher is better)
- Sleep Interruption Risk (lower is better)
- Weekend Liability (lower is better)
- Handover Friction (lower is better)

## Development Guidelines

### Code Style

- **Named Exports:** Always use named exports, avoid default exports
- **Parameter Pattern:** Pass parameters as single object (named parameters)
- **Type Safety:** Never use `any`, prefer explicit types or `unknown` with guards
- **Functional:** No classes, use functional components and hooks
- **Comments:** Only document extraordinary changes or complex logic

### Styling (Tailwind)

Organize classes in this order:

1. Layout/positioning
2. Sizing
3. Spacing (margin/padding)
4. Visual styles (colors, borders)
5. Typography
6. Interactive states
7. Responsive variants

Example:

```tsx
className =
  'flex flex-col gap-4 w-full p-6 bg-primary-100/20 text-sm hover:bg-primary-200/30 md:flex-row';
```

### Git Workflow

This project uses [Conventional Commits](https://www.conventionalcommits.org/) with emoji prefixes:

- ✨ `feat`: New feature
- 🐛 `fix`: Bug fix
- 📝 `docs`: Documentation
- ♻️ `refactor`: Code refactoring
- 🔧 `chore`: Tooling/configuration
- ✅ `test`: Tests

Pre-commit hooks run ESLint and Prettier on staged files automatically.

## Documentation

- **Design Brief:** `ai_docs/design_bried.jsonc`
- **UI Implementation:** `ai_docs/001_mapping_daylight/implementation_plan.md`
- **Product Requirements:** `ai_docs/002_oncall_modelling/PRD_on-call_modelling_feat`

## Roadmap

### MVP (Current)

- ✅ Dashboard visualizer with real-time map
- ✅ Schedule modeling with 4 strategy templates
- ✅ Sunlight timeline and fairness radar
- ✅ Risk heatmap and scenario comparison

### v1.1 (Next)

- Team management UI (create/edit teams)
- Complete burden score algorithm with probability weighting
- Daylight Savings Time (DST) handling
- Per-engineer bio-rhythm customization

### v2.0 (Future)

- PagerDuty/Opsgenie API integration
- Cost calculator with labor law compliance
- Historical incident density analysis
- Advanced analytics and reporting

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Design system inspired by modern fintech dashboards
- Map visualization powered by [react-simple-maps](https://www.react-simple-maps.io/)
- UI components from [Shadcn UI](https://ui.shadcn.com/)

---

Built with ❤️ for engineering managers who care about their teams' well-being.
