# Flow Forge – Field Reference

Welcome to the **Flow Forge** system — a task and project management platform built with a creative theme. This document serves as a **field-level guide** for the database and API layer, describing the schema and valid values for each entity.

---

## 🔥 Forge (Project)

| Field         | Type           | Description                                      | Allowed Values / Notes                         |
|---------------|----------------|--------------------------------------------------|------------------------------------------------|
| `id`          | `string` (UUID) | Unique ID of the forge                          | Auto-generated                                 |
| `name`        | `string`       | Name of the forge                               | Required, 1–255 chars                          |
| `description` | `string`       | Description of the forge                        | Optional                                       |
| `created_at`  | `datetime`     | When the forge was created                      | Auto-generated, timezone-aware                |
| `updated_at`  | `datetime`     | Last update timestamp                           | Auto-updated                                  |
| `owner_id`    | `string` (UUID) | User who owns the forge                         | Required                                       |
| `status`      | `string`       | Current state of the forge                      | `"active"`, `"archived"`                      |
| `start_date`  | `date`         | Optional project start                          | Optional                                       |
| `end_date`    | `date`         | Optional project end                            | Optional                                       |
| `members`     | `list[string]` | Team members involved                           | UUIDs of users                                 |
| `tags`        | `list[string]` | Project-specific tags                           | Free-form (e.g. `["backend", "urgent"]`)      |

---

## 📘 Blueprint (Epic)

| Field         | Type           | Description                                      | Allowed Values / Notes                         |
|---------------|----------------|--------------------------------------------------|------------------------------------------------|
| `id`          | `string` (UUID) | Unique ID of the blueprint                      | Auto-generated                                 |
| `forge_id`    | `string` (UUID) | Parent forge ID                                 | Required                                       |
| `name`        | `string`       | Name of the blueprint                           | Required                                       |
| `description` | `string`       | Description                                     | Optional                                       |
| `created_at`  | `datetime`     | Created timestamp                               | Auto-generated                                 |
| `updated_at`  | `datetime`     | Last updated                                    | Auto-updated                                  |
| `owner_id`    | `string` (UUID) | User who created the blueprint                  | Optional                                       |
| `status`      | `string`       | Current state of the blueprint                  | `"queued"`, `"forging"`, `"jammed"`, `"crafted"` |
| `start_date`  | `date`         | Blueprint start                                 | Optional                                       |
| `end_date`    | `date`         | Blueprint end                                   | Optional                                       |
| `priority`    | `string`       | Importance level                                | `"low"`, `"medium"`, `"high"`, `"critical"`    |
| `tags`        | `list[string]` | Custom tags                                     | Optional                                       |

---

## 📦 Module (Story)

| Field                 | Type           | Description                                      | Allowed Values / Notes                         |
|-----------------------|----------------|--------------------------------------------------|------------------------------------------------|
| `id`                  | `string` (UUID) | Unique module ID                                | Auto-generated                                 |
| `blueprint_id`        | `string`       | Associated blueprint                             | Required                                       |
| `forge_id`            | `string`       | Associated forge                                 | Required                                       |
| `title`               | `string`       | Module title                                     | Required, max 255 chars                        |
| `description`         | `string`       | Module description                               | Optional                                       |
| `created_at`          | `datetime`     | Timestamp created                                | Auto-generated                                 |
| `updated_at`          | `datetime`     | Timestamp updated                                | Auto-updated                                  |
| `owner_id`            | `string`       | Module creator                                   | Optional                                       |
| `status`              | `string`       | Module state                                     | `"queued"`, `"forging"`, `"jammed"`, `"crafted"` |
| `story_points`        | `integer`      | Effort estimation                                | Typically 1–13 (Fibonacci)                     |
| `priority`            | `string`       | Urgency level                                    | `"low"`, `"medium"`, `"high"`, `"critical"`    |
| `acceptance_criteria` | `list[string]` | Conditions for acceptance                        | Optional                                       |
| `tags`                | `list[string]` | Tags for classification                         | Optional                                       |

---

## ⚙️ Action (Task / Bug)

| Field                 | Type           | Description                                      | Allowed Values / Notes                         |
|-----------------------|----------------|--------------------------------------------------|------------------------------------------------|
| `id`                  | `string` (UUID) | Unique action ID                                | Auto-generated                                 |
| `module_id`           | `string`       | Associated module                                | Required                                       |
| `blueprint_id`        | `string`       | Optional parent blueprint                        | Optional                                       |
| `forge_id`            | `string`       | Optional parent forge                            | Optional                                       |
| `title`               | `string`       | Action title                                     | Required                                       |
| `description`         | `string`       | Action details                                   | Optional                                       |
| `assignee_id`         | `string`       | Assigned user ID                                 | Optional                                       |
| `created_at`          | `datetime`     | Creation time                                    | Auto-generated                                 |
| `updated_at`          | `datetime`     | Last update time                                 | Auto-updated                                  |
| `status`              | `string`       | Workflow status                                  | `"queued"`, `"forging"`, `"jammed"`, `"crafted"` |
| `due_date`            | `date`         | Deadline                                          | Optional                                       |
| `priority`            | `string`       | Action priority                                  | `"low"`, `"medium"`, `"high"`, `"critical"`    |
| `type`                | `string`       | Action type                                      | `"task"` or `"glitch"`                         |
| `severity`            | `string`       | Bug severity (glitch only)                      | `"minor"`, `"major"`, `"critical"`             |
| `reproducible`        | `boolean`      | Can it be reproduced? (glitch only)             | `true` / `false`                               |
| `steps_to_reproduce`  | `list[string]` | Reproduction steps (glitch only)                | Optional                                       |
| `attachments`         | `list[dict]`   | List of file objects                             | `[{ "file_name": "error.log", "url": "..." }]` |
| `tags`                | `list[string]` | Labels                                            | Optional                                       |

---

## 🧭 Status Field: Universal Values

These apply to `Blueprint`, `Module`, and `Action`:

| Status      | Description                      |
|-------------|----------------------------------|
| `queued`    | Task is created but not started  |
| `forging`   | Task is currently in progress    |
| `jammed`    | Task is blocked or delayed       |
| `crafted`   | Task is completed                |

---

## 🧱 Type Field in `Action`

| Type     | Meaning                  |
|----------|--------------------------|
| `task`   | Regular task/action item |
| `glitch` | Bug or defect            |

---

## ⚠️ Severity Field in Glitches

| Severity   | Meaning                            |
|------------|------------------------------------|
| `minor`    | Small, low-impact issue            |
| `major`    | High-impact but not blocking       |
| `critical` | Must fix immediately               |

---

## 📌 Notes

- All UUIDs are strings (`str`) and must follow the UUID format.
- All timestamps (`created_at`, `updated_at`) should be **timezone-aware UTC**.
- `tags`, `members`, `acceptance_criteria`, and `steps_to_reproduce` are stored as `JSON` arrays.
- Validation should be enforced both in the backend and UI.

---

## ✨ Future Enhancements

- Add `comments`, `activity_logs`, `labels`, `dependencies`
- Separate `glitch` fields into a child table (polymorphic model)