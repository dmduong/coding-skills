# Conventional Commit Types

Commit message format: `type(scope): short description`

| Type       | When to use                                                | Example                                           |
| ---------- | ---------------------------------------------------------- | ------------------------------------------------- |
| `feat`     | Add a new feature                                          | `feat(auth): add password reset endpoint`         |
| `fix`      | Fix a bug                                                  | `fix(auth): reject expired refresh tokens`        |
| `docs`     | Add or update documentation                                | `docs(auth): document login request fields`       |
| `refactor` | Improve code structure without changing external behavior | `refactor(auth): extract token validation logic`  |
| `test`     | Add or update tests                                        | `test(auth): cover invalid login credentials`     |
| `chore`    | Maintenance, tooling updates, or configuration changes    | `chore: update eslint configuration`              |
