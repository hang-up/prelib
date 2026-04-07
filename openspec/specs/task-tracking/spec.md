# Purpose

Define the ownership-aware task tracking behavior for authenticated users.

## Requirements

### Requirement: Users can create tasks
The system SHALL allow an authenticated user to create a task with a required title, an optional description, and a status of `todo`, `in-progress`, or `done`.

#### Scenario: Create task with required fields
- **WHEN** an authenticated user submits a task title and a valid status
- **THEN** the system creates the task and associates it with that user as owner

#### Scenario: Create task without a title
- **WHEN** an authenticated user submits a task without a title
- **THEN** the system rejects the request with a validation error

### Requirement: Users can view tasks across all owners
The system SHALL return task lists that include tasks created by any user in the system.

#### Scenario: Authenticated user views the task list
- **WHEN** an authenticated user requests the task list
- **THEN** the system returns tasks owned by the authenticated user and tasks owned by other users

#### Scenario: Seed data is visible in the task list
- **WHEN** the seeded application data includes tasks for multiple users
- **THEN** the task list shows a mixed set of tasks across those users

### Requirement: Users can filter task lists by status
The system SHALL support filtering the task list by `todo`, `in-progress`, or `done`.

#### Scenario: Filter tasks to a single status
- **WHEN** a user applies a valid status filter to the task list
- **THEN** the system returns only tasks matching that status

#### Scenario: Request all tasks without a status filter
- **WHEN** a user requests the task list without a status filter
- **THEN** the system returns tasks across all supported statuses

### Requirement: Users can edit only their own tasks
The system SHALL allow an authenticated user to edit the title, description, and status of a task only when that task belongs to the authenticated user.

#### Scenario: Owner edits their task
- **WHEN** an authenticated user updates a task they own
- **THEN** the system persists the new task values

#### Scenario: Non-owner attempts to edit another user's task
- **WHEN** an authenticated user updates a task owned by another user
- **THEN** the system rejects the update and leaves the task unchanged

### Requirement: Users can update task status independently
The system SHALL allow an authenticated user to update a task's status through a dedicated status update flow when that task belongs to the authenticated user.

#### Scenario: Owner changes task status
- **WHEN** an authenticated user submits a valid status update for a task they own
- **THEN** the system updates only the task's status and audit-free metadata such as `updated_at`

#### Scenario: Non-owner changes task status
- **WHEN** an authenticated user submits a status update for a task owned by another user
- **THEN** the system rejects the update and leaves the task unchanged
