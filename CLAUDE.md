# CLAUDE.md - Agent Guidelines for orleans2

## Development Commands
- Build: `npm run build` (runs TypeScript build and Vite build)
- Lint: `npm run lint` (runs ESLint on all files)
- Dev server: `npm run dev` (starts Vite dev server with HMR)
- Preview build: `npm run preview` (previews production build)
- Typecheck: `tsc --noEmit` (verify TypeScript without emitting files)

## Code Style Guidelines
- **TypeScript**: Strict mode enabled with no unused locals/parameters
- **Formatting**: Follow existing code indent (2 spaces)
- **Imports**: Group by: 1) React/libraries 2) Components 3) Assets/CSS
- **Components**: Use function components with explicit return types
- **State Management**: Use React hooks (useState, useEffect, etc.)
- **Error Handling**: Use try/catch with typed errors
- **Naming**:
  - Components: PascalCase
  - Functions/variables: camelCase
  - File names: Match component name (PascalCase.tsx)
- **React**: Use functional components with hooks, not class components
- **JSX**: Fragment syntax `<>...</>` for multiple elements