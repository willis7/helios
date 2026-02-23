# AGENTS.md

Guidelines for AI coding agents working in this repository.

## Build, Lint, and Test Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Lint (with auto-fix)
npm run lint

# Format code
npm run pretty

# Analyze bundle
npm run analyze
```

**Note:** No test commands are configured. If tests are added, update this file.

## Project Overview

This is a Next.js 15 application using the App Router, React 19, TypeScript, Tailwind CSS, and Shadcn UI components. It's an app that visualizes global on-call engineering schedules.

## Code Style Guidelines

### Parameter Passing

Always pass parameters as a single object (named parameters pattern):

```ts
// Good
function doSomething({ id, name }: { id: string; name: string }) {
  /* ... */
}

// Bad
function doSomething(id: string, name: string) {
  /* ... */
}
```

### Type Safety

- Never use `any` as a type. Use explicit types, interfaces, or `unknown` with type guards.
- Reuse interfaces and place them in a `models/` directory when shared across files.
- Use named exports; avoid default exports.

### Imports

- Use path aliases (`@/components/...`, `@/lib/...`, `@/data/...`, `@/app/...`) instead of relative paths.
- Do not use index exports. Import modules directly:

```ts
// Good
import { Button } from '@/components/shared/ui/button';

// Bad
import { Button } from '@/components/shared/ui';
```

### Functional Programming

- Do not use classes. Use functional methods and hooks.
- Always wrap `if` statements in curly braces, even for single-line blocks.
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`).

### Comments and Documentation

- Do not comment obvious things.
- Do not explain changes in comments.
- Only document extraordinary changes or complex logic.
- Use JSDoc for top-level functions when needed.

### Naming Conventions

- Use camelCase for variables and functions.
- Use PascalCase for React components and constructors.
- Use lowercase with dashes for directories (e.g., `components/auth-wizard`).
- Use named exports; avoid default exports:

```ts
// Good
export const Button = () => {
  /* ... */
};

// Bad
export default Button;
```

## Tailwind CSS Styling

Organize Tailwind classes in logical groups:

1. Layout/positioning classes first
2. Sizing classes
3. Spacing (margin/padding)
4. Visual styles (colors, borders)
5. Typography
6. Interactive states
7. Responsive variants last

```tsx
className =
  'flex flex-col gap-4 w-full p-6 bg-primary-100/20 text-sm hover:bg-primary-200/30 md:flex-row';
```

### Responsive Design

- Mobile-first approach (base classes for mobile, prefixed classes for larger screens)
- Use responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`

### Color System

- Use semantic color naming with numeric scale: `primary-100`, `primary-900`
- Apply opacity with slash notation: `bg-primary-100/20`
- Dark mode variants: `dark:bg-primary-900/10`

## UI Components

All UI components from `@/components/shared/ui` are Shadcn UI primitives. Always prefer importing from this location:

```tsx
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Dialog } from '@/components/shared/ui/dialog';
```

Use the `cn()` utility for conditional classes:

```tsx
import { cn } from '@/lib/utils';

className={cn('base-classes', conditional && 'conditional-class')}
```

## Forms and Validation

- Use React Hook Form for all forms.
- Use Zod for schema validation.
- Use `@hookform/resolvers/zod` for integration.

## Page Metadata

Use `genPageMetadata` from `@/app/seo` for page metadata:

```ts
import { genPageMetadata } from '@/app/seo';

export const metadata = genPageMetadata({
  title: 'Home',
  description: 'Welcome!',
});
```

## Error Handling

- Handle errors and edge cases at the beginning of functions.
- Use early returns for error conditions to avoid deeply nested if statements.
- Place the happy path last in the function for improved readability.
- Always handle the error parameter in try/catch blocks.

```ts
function process({ data }: { data: string | null }) {
  if (!data) {
    return null;
  }

  // Happy path
  return processData(data);
}
```

## Directory Structure

```
app/                 # Next.js App Router routes and API endpoints
components/
  landing/           # Landing page components
  shared/            # Shared UI components
    ui/              # Shadcn UI primitives
  icons/             # SVG and icon components
lib/                 # Utility functions (cn, helpers)
data/config/         # Site configuration (site.settings.js, metadata)
css/                 # Global CSS and syntax highlighting
scripts/             # Build and automation scripts
```

## Pre-commit Hooks

Husky and lint-staged are configured:

- ESLint auto-fix on staged `.js/.jsx/.ts/.tsx` files
- Prettier format on staged files

## Node Version

Requires Node.js >= 22.0.0

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com/docs)
