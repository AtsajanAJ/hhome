- Create: src/lib/auth-client.ts
- Create: src/app/api/auth/[...all]/route.ts
- Create: src/lib/validations/auth.ts

**Produces:** Server-side session lookup, browser auth methods, and auth API endpoint.

- [ ] Create Zod schemas with these exact rules:

    emailSchema = z.string().trim().toLowerCase().email().max(254)
    passwordSchema = z.string().min(8).max(72)
    loginSchema = z.object({ email: emailSchema, password: passwordSchema })
    registerSchema = z.object({
      name: z.string().trim().min(2).max(80),
      email: emailSchema,
      password: passwordSchema,
    })

- [ ] Configure Better Auth with the Prisma adapter, prisma, email/password authentication, BETTER_AUTH_SECRET, and BETTER_AUTH_URL. Keep email verification disabled for this first milestone unless a mail provider is added.

- [ ] Create the catch-all route and export Better Auth’s GET and POST handlers according to the installed version’s App Router documentation.

- [ ] Create auth-client.ts with the browser-safe Better Auth client. Export authClient with signIn.email, signUp.email, and signOut. Do not import Prisma or server-only modules here.

- [ ] Run bun run lint and bun run db:generate; fix server/client boundary errors.

## Task 4: Build accessible login and registration UI

**Files:**

- Create: src/components/auth/auth-form-shell.tsx
- Create: src/components/auth/login-form.tsx
- Create: src/components/auth/register-form.tsx
- Create: src/app/(auth)/login/page.tsx
- Create: src/app/(auth)/register/page.tsx

**Produces:** Responsive login and registration pages using shadcn/ui primitives.

- [ ] Add Card, Input, Label, and Button using the project’s configured shadcn workflow.

- [ ] Build the shared auth shell with a responsive centered card, heading, description, content area, and footer navigation.

- [ ] Implement login with controlled email/password fields, loginSchema, pending state, generic “Invalid email or password” errors, and redirect to /dashboard after success.

- [ ] Implement registration with name/email/password/password-confirmation fields, registerSchema, local confirmation validation, pending state, and redirect to /dashboard after success.

- [ ] Add metadata and login/register navigation. Every input needs a label; invalid fields need aria-invalid and aria-describedby; errors need role="alert".

- [ ] Manually verify empty fields, malformed email, short password, mismatched confirmation, pending submit, and successful navigation with bun dev.

## Task 5: Protect authenticated routes and add logout

**Files:**

- Create: src/app/(protected)/layout.tsx
- Create: src/app/(protected)/dashboard/page.tsx
- Create: src/components/auth/user-menu.tsx
- Modify: src/app/page.tsx

**Produces:** A server-guarded dashboard and working logout behavior.

- [ ] In the protected layout, call Better Auth’s server session API using request headers/cookies. If no valid session exists, call redirect("/login"); do not rely only on client-side route hiding.

- [ ] Render the dashboard as a server component showing the authenticated user’s name or email and a clear logout control.

- [ ] Implement logout in a client component with authClient.signOut, pending/error handling, and navigation to /login after success.

- [ ] Update the public landing page with login and registration links; authenticated users should see a dashboard link. Avoid database access from client components.

- [ ] Verify in a private browser window that /dashboard redirects to /login, and verify that an authenticated refresh preserves the session.

## Task 6: Add automated tests and security checks

**Files:**

- Create: tests/auth-validation.test.ts
- Create: tests/auth-flow.spec.ts
- Create or modify: vitest.config.ts, playwright.config.ts

**Produces:** Repeatable validation, browser-flow, and production-build checks.

- [ ] Unit-test valid input, missing name, malformed email, passwords shorter than 8 characters, passwords longer than 72 characters, and whitespace/case normalization.

- [ ] Add end-to-end coverage for registration, dashboard rendering, logout, failed login with generic error text, and unauthenticated dashboard redirection. Use a unique test email per run and clean up test records afterward.

- [ ] Assert that passwords are not rendered in HTML, secrets are absent from client bundles, protected pages redirect server-side, and login errors do not distinguish unknown email from incorrect password.

- [ ] Run:

    bun run lint
    bun run test
    bun run test:e2e
    bun run build

Expected: all checks pass with production environment variables configured.

## Task 7: Document local and production setup

**Files:**

- Modify: README.md
- Modify: .env.example

- [ ] Document Neon project creation, pooled/direct connection strings, BETTER_AUTH_SECRET generation, bun install, bun run db:generate, bun run db:migrate, and bun dev.

- [ ] Document production variables and running bun run db:deploy during deployment before serving the application.

- [ ] State the first-milestone scope: email/password registration, login, logout, and sessions. Keep email verification, password reset, OAuth, rate limiting, and role-based authorization as follow-up work.

- [ ] Perform a clean-checkout review: no secrets committed, migrations tracked, generated client reproducible, protected routes server-guarded, and README instructions working.

## Follow-up Milestones

1. Email verification and password reset with a transactional email provider.
2. Login rate limiting, audit logging, and suspicious-login detection.
3. User profile and account settings.
4. Roles and permissions for future home-office modules.
5. Home-office modules such as inventory, tasks, maintenance, and documents.

