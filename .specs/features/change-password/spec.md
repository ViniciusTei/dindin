# Change Password Specification

## Problem Statement

A logged-in user currently has no way to change their own password from within the application. If a user wants to update their credentials, there is no self-service flow — forcing an admin action or manual DB intervention. This is a basic security hygiene requirement.

## Goals

- [ ] Allow any authenticated user to change their own password via a self-service form
- [ ] Enforce password verification (require current password before allowing change)
- [ ] Maintain the existing security posture (Argon2, session integrity)

## Out of Scope

| Feature | Reason |
| --- | --- |
| Forgot password / password reset via email | No email infrastructure exists |
| Admin changing another user's password | Separate admin concern |
| Password strength meter UI | Adds complexity with minimal gain for MVP |
| Forced password rotation / expiry policies | Not needed at this stage |

---

## User Stories

### P1: Change own password ⭐ MVP

**User Story**: As a logged-in user, I want to change my password by confirming my current one and providing a new one, so that I can keep my account secure without admin help.

**Why P1**: Core self-service security feature. Without it, users are stuck with their initial password forever.

**Acceptance Criteria**:

1. WHEN a logged-in user submits the form with correct current password and a valid new password THEN system SHALL hash the new password and persist it to the database
2. WHEN the form is submitted with a wrong current password THEN system SHALL reject the request with a clear error message and NOT change the password
3. WHEN the new password is fewer than 8 characters THEN system SHALL reject the request with a validation error
4. WHEN the new password matches the current password THEN system SHALL reject the request (no point in "changing" to the same value)
5. WHEN password change succeeds THEN system SHALL display a success feedback to the user and keep them logged in on the current session
6. WHEN an unauthenticated request reaches the change-password route THEN system SHALL redirect to `/login`

**Independent Test**: Navigate to `/perfil/alterar-senha`, fill the form with correct current password + valid new password → see success message; then log out and log back in with the new password → succeeds.

---

### P2: Invalidate other sessions on password change

**User Story**: As a logged-in user, I want all other active sessions to be invalidated when I change my password, so that a compromised session elsewhere stops working.

**Why P2**: Good security practice but not blocking for MVP — the core feature works without it. Requires a `deleteOtherSessions(userId, currentSessionId)` repo method.

**Acceptance Criteria**:

1. WHEN password change succeeds THEN system SHALL delete all sessions for that user EXCEPT the currently active session
2. WHEN password change succeeds THEN system SHALL keep the current session alive so the user stays logged in

**Independent Test**: Log in from two browser tabs; change password in tab 1 → refresh tab 2 → tab 2 is logged out.

---

## Edge Cases

- WHEN the current password field is empty THEN system SHALL return a validation error before hitting the domain layer
- WHEN the new password field is empty THEN system SHALL return a validation error before hitting the domain layer
- WHEN the form is submitted twice rapidly (double-submit) THEN the second request SHALL be idempotent (second hash will simply overwrite with same value — acceptable)
- WHEN the database update fails THEN system SHALL return a generic error message and NOT expose internals

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| CHPWD-01 | P1: AC1 — hash and persist new password | Design | Pending |
| CHPWD-02 | P1: AC2 — reject wrong current password | Design | Pending |
| CHPWD-03 | P1: AC3 — minimum 8 chars validation | Design | Pending |
| CHPWD-04 | P1: AC4 — reject same password | Design | Pending |
| CHPWD-05 | P1: AC5 — success feedback, session preserved | Design | Pending |
| CHPWD-06 | P1: AC6 — unauthenticated redirect | Design | Pending |
| CHPWD-07 | P2: invalidate other sessions | - | Pending |

**Coverage:** 7 total, 0 mapped to tasks, 7 unmapped ⚠️

---

## Architecture Notes (Codebase Fit)

Based on codebase analysis, the feature maps cleanly to existing patterns:

- **New usecase**: `app/domain/users/usecases/change-password.ts`
  - Ports needed: `PasswordVerifier`, `PasswordHasher`, plus a new `UserPasswordRepo` interface (find by id + update hash)
- **New repo method**: add `updatePasswordHash(userId, newHash)` to users repo
- **New route**: `app/routes/account.change-password.tsx` (loader: requireAuth; action: parse form → call usecase → return result)
    - **Note**: need refactor current `app/routes/account.tsx` to split current "account deletion" functionality into its own route; Then we should create a new account page that links to both "change password" and "delete account" routes, to keep things organized.
- **UI**: simple form component at `app/domain/users/ui/ChangePasswordForm.tsx` using daisyUI

No new DB migrations needed — `password_hash` column already exists on `users` table.

---

## Success Criteria

- [ ] User can change their own password end-to-end without admin intervention
- [ ] Wrong current password is rejected with a user-friendly message
- [ ] Weak passwords (< 8 chars) are rejected before hitting the DB
- [ ] Current session remains active after a successful password change
