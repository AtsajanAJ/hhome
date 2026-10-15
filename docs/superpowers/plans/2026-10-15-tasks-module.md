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

### Task 6: Add task priority and sorting

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/lib/validations/task.ts`
- Modify: `src/app/(protected)/tasks/actions.ts`
- Modify: `src/app/(protected)/tasks/page.tsx`
- Modify: `src/components/tasks/task-form.tsx`
- Modify: `src/components/tasks/tasks-page.tsx`
- Modify: `src/app/(protected)/dashboard/page.tsx`
- Modify: `src/components/dashboard/dashboard-overview.tsx`

**Produces:** Low / Medium / High priority on every task, visible priority badges, priority-aware sorting, and a migration that preserves existing tasks as Medium.

- [ ] Add `TaskPriority` with `LOW`, `MEDIUM`, and `HIGH`, defaulting the database field to `MEDIUM`.
- [ ] Include priority in validation, Server Actions, server selects, forms, cards, dashboard rows, and sorting controls.
- [ ] Keep ownership checks unchanged and run the migration, lint, build, and UI detector.

### Task 7: Add task detail pages

**Files:**
- Create: `src/app/(protected)/tasks/[id]/page.tsx`
- Create: `src/components/tasks/task-detail.tsx`
- Modify: `src/components/tasks/tasks-page.tsx`

**Produces:** A user-scoped task detail route with full edit, status, delete, and back navigation.

- [ ] Fetch one task with `id + userId` and return not-found for missing or foreign tasks.
- [ ] Link task titles from the list to `/tasks/[id]`.
- [ ] Reuse the existing task form and Server Actions for edits and deletion.
- [ ] Run lint and production build and verify a foreign task id never renders.

### Task 8: Add automated task validation tests

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/task-validation.test.ts`

**Produces:** Repeatable unit coverage for task title, description, status, priority, and due-date validation.

- [ ] Configure Vitest with the project `@/*` alias and Node test environment.
- [ ] Test valid task input, whitespace trimming, invalid empty/overlong title, invalid priority/status, description limit, and date format.
- [ ] Run `bun test` and keep the tests independent from Neon credentials.

### Task 9: Start the Routines module

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/lib/validations/routine.ts`
- Create: `src/app/(protected)/routines/actions.ts`
- Create: `src/app/(protected)/routines/page.tsx`
- Create: `src/components/routines/routines-page.tsx`
- Modify: `src/components/app-shell.tsx`

**Produces:** User-scoped recurring routines with daily/weekly frequency, next-due dates, completion rollover, pause/resume, and deletion.

- [ ] Add a `Routine` model with `RoutineFrequency`, required owner, active state, next due date, and completion timestamp.
- [ ] Add authenticated create, complete, toggle-active, and delete actions with `id + userId` ownership checks.
- [ ] Build a responsive `/routines` page with create form, routine cards, next-due labels, and empty state.
- [ ] Run Prisma migration, unit checks, lint, build, and UI detector.

### Task 10: Add routine history and editing

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/lib/validations/routine.ts`
- Modify: `src/app/(protected)/routines/actions.ts`
- Modify: `src/app/(protected)/routines/page.tsx`
- Modify: `src/components/routines/routines-page.tsx`

**Produces:** Routine completion history, editable routine details, and cadence-preserving rollover for overdue routines.

- [ ] Add `RoutineCompletion` linked to the owner routine with completion timestamps.
- [ ] Create a completion record on every successful Complete action and calculate the next due date from the prior schedule until it reaches a future date.
- [ ] Add an authenticated update action and edit mode for title, notes, frequency, and next due date.
- [ ] Show recent completion dates on each routine card and preserve ownership checks.
- [ ] Run the migration, lint, build, tests, and UI detector.

### Task 11: Add routine dashboard summary

**Files:**
- Modify: `src/app/(protected)/dashboard/page.tsx`
- Modify: `src/components/dashboard/dashboard-overview.tsx`

**Produces:** Dashboard visibility for active routines due today/overdue and completions this week.

- [ ] Query only the authenticated user's active routines and completion records.
- [ ] Show a compact due-routine list with a link to `/routines` and a weekly completion count.
- [ ] Preserve the existing task summary and quick-add flow.
- [ ] Run lint, build, and UI detector.

### Task 12: Start the Projects module

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/lib/validations/project.ts`
- Create: `src/app/(protected)/projects/actions.ts`
- Create: `src/app/(protected)/projects/page.tsx`
- Create: `src/components/projects/projects-page.tsx`
- Modify: `src/components/app-shell.tsx`

**Produces:** User-scoped project management with active/completed state and a responsive project list.

- [ ] Add a `Project` model with name, description, status, timestamps, and owner relation.
- [ ] Add authenticated create, toggle-status, and delete actions with ownership checks.
- [ ] Build `/projects` with create form, project cards, complete/reopen, delete, and empty state.
- [ ] Run migration, lint, build, and UI detector.

### Task 13: Connect Tasks to Projects

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/lib/validations/task.ts`
- Modify: `src/app/(protected)/tasks/actions.ts`
- Modify: `src/app/(protected)/tasks/page.tsx`
- Modify: `src/components/tasks/task-form.tsx`
- Modify: `src/components/tasks/tasks-page.tsx`
- Modify: `src/app/(protected)/tasks/[id]/page.tsx`
- Modify: `src/components/tasks/task-detail.tsx`

**Produces:** Optional project assignment for tasks with server-side project ownership validation.

- [ ] Add nullable `projectId` relation and index to `Task`.
- [ ] Load only the current user's projects into task forms and validate selected project ownership in every mutation.
- [ ] Show and edit project assignment in task list and task detail.
- [ ] Run migration, tests, lint, build, and UI detector.

### Task 14: Add project detail pages

**Files:**
- Create: `src/app/(protected)/projects/[id]/page.tsx`
- Create: `src/components/projects/project-detail.tsx`
- Modify: `src/app/(protected)/projects/actions.ts`
- Modify: `src/components/projects/projects-page.tsx`
- Modify: `src/components/tasks/tasks-page.tsx`

**Produces:** Project detail views with project editing and the task list assigned to that project.

- [ ] Fetch a project with `id + userId`, include only that user's tasks, and return not-found for foreign ids.
- [ ] Add authenticated project update action and edit form.
- [ ] Link project names and cards to the detail route.
- [ ] Run lint, build, and UI detector.

### Task 15: Start the Inventory module

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/lib/validations/inventory.ts`
- Create: `src/app/(protected)/inventory/actions.ts`
- Create: `src/app/(protected)/inventory/page.tsx`
- Create: `src/components/inventory/inventory-page.tsx`
- Modify: `src/components/app-shell.tsx`

**Produces:** User-scoped home-office inventory with item name, category, quantity, location, notes, edit, quantity controls, and delete.

- [ ] Add an `InventoryItem` model with owner relation and indexes.
- [ ] Add authenticated create, update, quantity-adjustment, and delete actions with ownership checks.
- [ ] Build a responsive `/inventory` page with search, category display, quantity controls, and empty state.
- [ ] Run migration, lint, build, and UI detector.

### Task 16: Add inventory dashboard summary

**Files:**
- Modify: `src/app/(protected)/dashboard/page.tsx`
- Modify: `src/components/dashboard/dashboard-overview.tsx`

**Produces:** Dashboard inventory overview with item count, total units, low-stock count, and a short low-stock list.

- [ ] Query inventory aggregates and low-stock items for the authenticated user only.
- [ ] Show the summary with a link to `/inventory` without changing task or routine sections.
- [ ] Run lint, build, and UI detector.
