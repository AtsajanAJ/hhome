# Tasks / To-do Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add the first Home Office module at `/tasks`, allowing each authenticated user to create, edit, delete, search, filter, and update the status of only their own tasks.

**Architecture:** Store tasks in Prisma with a required `userId` relation and a `TaskStatus` enum. Read tasks in a protected Server Component and perform all mutations through authenticated Server Actions that scope every query by the current user id. Use a client component only for interactive form, search, filter, and optimistic-feeling UI state.

**Tech Stack:** Next.js 16 App Router, React 19, Prisma 7 + Neon PostgreSQL, Better Auth, Zod, Tailwind CSS 4, existing App Shell, Bun.

**Spec:** User request: Tasks / To-do module with create, edit, delete, Todo / In progress / Done, due date, filter, search, and per-user visibility.

## Global Constraints

- Use Bun commands, not npm.
- Use the installed Next.js 16.4.1 APIs and preserve the protected layout's `instant = false` behavior.
- Every read and mutation must authenticate with Better Auth and scope database access by `userId`.
- Task titles are required and limited to 120 characters; descriptions are optional and limited to 1000 characters.
- Passwords and secrets must never enter client components or task responses.
- Preserve the existing H/Office visual language and responsive App Shell.

---

### Task 1: Add the task data model and validation

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/lib/validations/task.ts`

**Produces:** A Prisma `Task` model with a user relation and shared Zod validation for create/update input.

- [ ] Add `TaskStatus` with `TODO`, `IN_PROGRESS`, and `DONE` values.
- [ ] Add `Task` fields: `id`, `title`, `description`, `status`, `dueDate`, `createdAt`, `updatedAt`, and required `userId`; add `User.tasks` with cascade delete and indexes for `(userId, status)` and `(userId, dueDate)`.
- [ ] Add schemas that trim title, enforce 1–120 characters, allow a nullable description up to 1000 characters, validate status, and accept an optional ISO date string.
- [ ] Run `bun run db:generate` and verify the generated Prisma client exposes `TaskStatus` and `task`.

### Task 2: Add secure Server Actions

**Files:**
- Create: `src/lib/auth-helpers.ts`
- Create: `src/app/(protected)/tasks/actions.ts`

**Produces:** Authenticated `createTask`, `updateTask`, `deleteTask`, and `toggleTaskStatus` actions.

- [ ] Implement a server-only session helper using `headers()` and `auth.api.getSession` that returns the current user or throws an unauthorized error.
- [ ] Validate all untrusted input with the task schemas before database access.
- [ ] Create tasks with `userId` from the session, never from form/client input.
- [ ] Update and delete with `where: { id, userId }` so another user's task cannot be modified even if its id is known.
- [ ] Revalidate `/tasks` after every successful mutation and return serializable success/error objects.
- [ ] Run TypeScript/build checks before adding UI.

### Task 3: Build the Tasks page and interactive UI

**Files:**
- Create: `src/app/(protected)/tasks/page.tsx`
- Create: `src/components/tasks/tasks-page.tsx`
- Create: `src/components/tasks/task-form.tsx`
- Modify: `src/components/app-shell.tsx`

**Produces:** Responsive Tasks page with create/edit modal, task cards, status controls, search, filters, due dates, errors, pending states, and empty state.

- [ ] Fetch the current user's tasks in the Server Component using the authenticated user id and pass only task fields needed by the client.
- [ ] Add a `/tasks` navigation item and make the App Shell header title reflect the current route.
- [ ] Build a shared task form for create and edit with title, description, status, and due date fields; show field-level validation and pending feedback.
- [ ] Add status filter tabs for All, Todo, In progress, and Done plus a search input that filters title and description locally.
- [ ] Add task actions for edit, delete with confirmation, and status cycling/selecting; show clear due-date labels and overdue styling.
- [ ] Make the layout usable on mobile without horizontal overflow and provide an accessible modal close path.

### Task 4: Migrate and verify the module

**Files:**
- Create: `prisma/migrations/<generated-task-migration>/migration.sql`

**Produces:** Database schema deployed locally and a verified production build.

- [ ] Run `bunx prisma migrate dev --name add_tasks` against the configured Neon database.
- [ ] Run `bun run lint`, `bun run build`, and the Impeccable detector against changed UI files.
- [ ] Verify `/tasks` is protected, task ownership is enforced in action queries, and the build contains the `/tasks` route.
- [ ] Manually test create, edit, status update, search, filter, delete, due date, refresh persistence, and mobile layout in `bun dev`.

### Task 5: Connect Tasks to the Dashboard

**Files:**
- Modify: `src/app/(protected)/dashboard/page.tsx`
- Create: `src/components/dashboard/dashboard-overview.tsx`

**Produces:** A dashboard with live task counts, today/overdue visibility, and a quick-add task form.

- [ ] Fetch the authenticated user's task summary and a small upcoming-task list on the server, scoped by `userId`.
- [ ] Render Todo, In progress, Done, and overdue counts using the existing H/Office visual language.
- [ ] Add a quick-add form that accepts a title and optional due date and calls the existing authenticated `createTask` action.
- [ ] Link the dashboard task list to `/tasks` and show a useful empty state for new users.
- [ ] Run `bun run lint` and `bun run build`; verify dashboard data is request-time rendered and no task from another user can appear.
