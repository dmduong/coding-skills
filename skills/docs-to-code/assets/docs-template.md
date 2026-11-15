```markdown
## Purpose

<purpose_of_documentation>

## Endpoint

| Component | Value         |
| --------- | ------------- |
| Method    | <method_name> |
| Path      | <path_name>   |
| Roles     | <role_name>   |

## Header

| Header        | Required | Value          |
| ------------- | -------- | -------------- |
| <header_name> | Y or N   | <header_value> |

## Request

### Path Variables

### Query Params

### Body (Raw)

### Body (Form data)

| Field        | Type         | Required | Constraints        | Description         |
| ------------ | ------------ | -------- | ------------------ | ------------------- |
| <field_name> | <field_type> | Y or N   | <constraints_name> | <description_field> |

## Processing Flow

### Entity/Schema

| Table        | Role in API | Documentation        |
| ------------ | ----------- | -------------------- |
| <table_name> | <role_name> | <link_documentation> |

### Detail

<details>
  <summary>Step [step_no]: [action_step]</summary>

- **Target:** <action_target>
- **Details:**
  - <action_detail_1>
  - <action_detail_2>
- **Output:** <variable_name>
- **Next:** <next_step>
- **On failure:** <error_message>

</details>

## Response

### Success

| Status        | Description          |
| ------------- | -------------------- |
| <http_status> | <description_status> |

| Property        | Type            | Description            |
| --------------- | --------------- | ---------------------- |
| <property_name> | <property_type> | <property_description> |

### Error

| Status         | Message         | Raised at        |
| -------------- | --------------- | ---------------- |
| <error_status> | <error_message> | <raised_at_step> |
```
