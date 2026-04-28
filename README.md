# Cittilenz Frontend

Cittilenz Frontend is the React + Vite web client for the civic issue reporting platform. It gives citizens, officials, ward superiors, and admins a role-based interface for reporting issues, tracking progress, resolving complaints, and managing the system.

The app connects to:

- the Spring Boot backend API for authentication, dashboards, issues, users, analytics, and administration
- the AI service for image-based issue prediction during report creation

## What This Frontend Does

- Public landing page with role-aware redirects after login
- Citizen registration and login
- JWT-based session handling in local storage
- Role-protected navigation and routes
- Citizen issue reporting with:
  - image upload
  - browser geolocation
  - ward lookup
  - AI-assisted issue type prediction
  - manual fallback when AI confidence is low or the AI service is unavailable
- Dashboards for `CITIZEN`, `OFFICIAL`, `WARD_SUPERIOR`, and `ADMIN`
- Issue detail and issue list screens by role
- Admin management for users, issue types, issues, and analytics
- Theme switching and responsive navigation

## Tech Stack

- React 19
- Vite 7
- React Router
- TanStack Query
- Axios
- React Hook Form
- Zod
- Framer Motion
- Radix UI primitives
- Recharts

## Project Structure

```text
src
├── api           # API clients for backend and AI services
├── app           # app providers and router
├── components    # shared layout, routing, and UI components
├── features      # route-level feature modules by domain/role
├── lib           # env, storage, helpers, guards, formatting
├── styles        # global styles
└── main.jsx      # frontend entry point

doc              # API and module reference documents
public           # static assets
```

## Routes Overview

Public routes:

- `/`
- `/login`
- `/register`

Citizen routes:

- `/citizen/dashboard`
- `/citizen/report-issue`
- `/citizen/issues`
- `/citizen/issues/:id`

Official routes:

- `/official/dashboard`
- `/official/issues`
- `/official/issues/:id`

Ward superior routes:

- `/superior/dashboard`
- `/superior/issues`
- `/superior/issues/:id`
- `/analytics`

Admin routes:

- `/admin/dashboard`
- `/admin/users`
- `/admin/issue-types`
- `/admin/issues`
- `/admin/analytics`

Shared protected route:

- `/profile`

## Environment Configuration

This app reads the following Vite environment variables:

- `VITE_BASE_URL`: backend API base URL
- `VITE_AI_URL`: direct AI service base URL

If not provided, the frontend defaults to:

- `VITE_BASE_URL=http://localhost:8080`
- `VITE_AI_URL=http://localhost:8000`

Create a local env file such as `.env.local`:

```bash
VITE_BASE_URL=http://localhost:8080
VITE_AI_URL=http://localhost:8000
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

The Vite dev server runs on:

```text
http://localhost:3000
```

### 3. Start the required backend services

For the full app flow to work, run:

- the backend API on `http://localhost:8080`
- the AI service on `http://localhost:8000`

If those services run on different ports or hosts, update `.env.local`.

## Available Scripts

- `npm run dev` starts the Vite dev server on port `3000`
- `npm run build` creates a production build in `dist/`
- `npm run preview` serves the production build locally on port `3000`
- `npm run lint` runs ESLint

## Authentication and Session Behavior

- Login uses the backend `POST /auth/login` endpoint.
- The frontend stores the JWT token in local storage under `cittilenz_token`.
- The logged-in user payload is stored under `cittilenz_user`.
- Authenticated API requests automatically send `Authorization: Bearer <token>`.
- If the backend returns `401`, the frontend clears the session and redirects to `/login`.

## Report Issue Flow

The citizen reporting flow is one of the main frontend workflows:

1. The user enters a title and description.
2. The user uploads an image.
3. The browser captures geolocation.
4. The frontend looks up the ward from the backend.
5. The frontend requests AI prediction for the uploaded image.
6. If the AI result is confident and matches a known issue type, the issue type is auto-selected.
7. If AI prediction is weak or unavailable, the user can continue with manual issue type selection after the AI attempt.
8. The frontend submits the issue as `FormData` to the backend.

## Notes for Development

- The UI is role-driven, so most screens depend on the authenticated user role.
- Data fetching is handled with TanStack Query.
- Shared API configuration lives in `src/api/client.js`.
- Route protection is enforced in the router and protected route components.
- The frontend expects backend responses to follow the shared API response wrapper used across the app.

## Additional Documentation

The `doc/` folder contains supporting documentation for the wider system, including:

- API contract details
- JWT contract details
- environment configuration notes
- module-specific backend documentation

## Build Output

Production builds are generated in:

```text
dist/
```
