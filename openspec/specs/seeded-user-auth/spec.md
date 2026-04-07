# Purpose

Define the seeded authentication behavior for the local demo application.

## Requirements

### Requirement: Users can authenticate with seeded credentials
The system SHALL allow a user to authenticate with a seeded username and password combination stored in the persistent SQLite database.

#### Scenario: Successful login with seeded credentials
- **WHEN** a user submits a valid seeded username and password
- **THEN** the system authenticates the user and returns an authenticated session or token context that the frontend can use for subsequent requests

#### Scenario: Login fails with invalid credentials
- **WHEN** a user submits an unknown username or incorrect password
- **THEN** the system rejects the request and does not create an authenticated session or token context

### Requirement: The system exposes the authenticated user identity
The system SHALL provide a way for the frontend to retrieve the currently authenticated user after login.

#### Scenario: Authenticated user requests current identity
- **WHEN** an authenticated client requests the current user identity
- **THEN** the system returns the authenticated user's identifier and username

#### Scenario: Unauthenticated client requests current identity
- **WHEN** a client without valid authentication requests the current user identity
- **THEN** the system responds that the client is not authenticated

### Requirement: Seed data is available in persistent storage
The system SHALL initialize persistent storage with at least two demo users suitable for exercising ownership-aware task behavior.

#### Scenario: Application starts against an empty database
- **WHEN** the application initializes a new SQLite database
- **THEN** it creates the required auth tables and inserts the seeded demo users

#### Scenario: Application restarts with an existing database
- **WHEN** the application starts with a previously initialized SQLite database
- **THEN** it preserves existing user records without duplicating the seeded demo users
