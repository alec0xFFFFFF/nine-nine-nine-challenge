# Reusable UI Components

This directory contains reusable UI components for the 9/9/9 Challenge application with consistent Masters Tournament branding.

## Core Components

### `MastersHeader`
A standardized header component with Masters Tournament styling.

**Usage:**
```tsx
<MastersHeader
  title="9/9/9 Challenge"
  subtitle="Tournament Director Dashboard"
  variant="light" // or "dark"
  size="lg" // "sm", "md", or "lg"
  className="mb-8"
/>
```

**Props:**
- `title`: Main header text
- `subtitle`: Descriptive text below title
- `variant`: "light" (dark text) or "dark" (white text)
- `size`: "sm", "md", or "lg" for different text sizes
- `className`: Additional CSS classes

### `TournamentStats`
Displays the iconic 9/9/9 challenge stats (9 holes, 9 dogs, 9 beers).

**Usage:**
```tsx
<TournamentStats
  variant="default" // or "compact"
  className="mb-6"
/>
```

**Props:**
- `variant`: "default" (full size) or "compact" (smaller for headers/sidebars)
- `className`: Additional CSS classes

### `AugustaBackground`
Augusta National inspired background patterns.

**Usage:**
```tsx
<AugustaBackground
  variant="pattern" // or "circles"
  opacity={5} // 1-10
  className="absolute inset-0"
/>
```

**Props:**
- `variant`: "pattern" (overlapping circles) or "circles" (small dots)
- `opacity`: 1-10 for background opacity
- `className`: Additional CSS classes

## Color System

All components use the consistent Masters Tournament color palette defined in `globals.css`:

- `--primary: #15803d` (Augusta green)
- `--secondary: #f8f6f0` (cream/beige)
- `--card: #fefdf8` (off-white for cards)
- `--border: #15803d` (consistent with primary)

## Usage Guidelines

1. **Consistency**: Use these components across all pages to maintain visual consistency
2. **Responsive**: All components are mobile-first responsive
3. **Accessibility**: Components follow ARIA guidelines and semantic HTML
4. **Performance**: Components are optimized and tree-shakeable

## Updated Components

The following existing components now use these reusable components:

- `src/app/page.tsx` - Homepage
- `src/app/dashboard/page.tsx` - Dashboard
- `src/components/CreateEvent.tsx` - Event creation form
- `src/components/PhoneAuth.tsx` - Authentication form
- `src/components/AuthForm.tsx` - Legacy auth form