````markdown
> Illustrative example only. The API, names, and values below are fictional.

## Purpose

Record a climate reading for a monitored terrarium.

## Endpoint

| Component | Value |
| --------- | ----- |
| Method    | POST  |
| Path      | /v1/terrariums/{terrariumCode}/readings |
| Roles     | TerrariumOperator |

## Header

| Header       | Required | Value            |
| ------------ | -------- | ---------------- |
| Content-Type | Y        | application/json |

## Request

### Path Variables

| Name          | Type   | Required | Constraints                       | Description                       |
| ------------- | ------ | -------- | --------------------------------- | --------------------------------- |
| terrariumCode | string | Y        | 1-24 uppercase letters, digits, or hyphens | Code of the monitored terrarium |

### Query Params

None.

### Body (Raw)

```json
{
  "recordedAt": "2026-04-12T09:30:00Z",
  "temperatureC": 24.5,
  "humidityPercent": 68
}
```

| Field          | Type   | Required | Constraints                         | Description                                  |
| -------------- | ------ | -------- | ----------------------------------- | -------------------------------------------- |
| recordedAt     | string | Y        | ISO 8601 timestamp in UTC           | Time when the sensor reading was recorded    |
| temperatureC   | number | Y        | From -10 through 60, inclusive      | Terrarium temperature in degrees Celsius     |
| humidityPercent| number | Y        | Integer from 0 through 100          | Relative humidity percentage                 |

### Body (Form data)

Not used.

## Processing Flow

### Entity/Schema

| Table          | Role  | Documentation |
| -------------- | ----- | ------------- |
| terrarium      | read  | Terrarium record, identified by `code` |
| climate_reading| write | A recorded temperature and humidity sample |

### Detail

<details>
  <summary>Step 1: Find</summary>

- **Target:** `terrarium`
- **Details:**
  - Find the terrarium whose `code` matches the `terrariumCode` path variable.
- **Output:** `terrarium`
- **Next:** 2
- **On failure:** `ERR_TERRARIUM_LOOKUP_FAILED`

</details>

<details>
  <summary>Step 2: Check</summary>

- **Target:** `terrarium`
- **Details:**
  - If no terrarium was found, return `TERRARIUM_NOT_FOUND`.
  - Confirm the terrarium's monitoring status is `MONITORED`.
  - If it is not monitored, return `TERRARIUM_NOT_MONITORED`.
- **Output:** -
- **Next:** 3
- **On failure:** `TERRARIUM_NOT_FOUND`, `TERRARIUM_NOT_MONITORED`

</details>

<details>
  <summary>Step 3: Create</summary>

- **Target:** `climate_reading`
- **Details:**
  - Create a reading linked to the found terrarium.
  - Set `recorded_at`, `temperature_c`, and `humidity_percent` from the request body.
  - If the record cannot be created, return `ERR_CLIMATE_READING_CREATE_FAILED`.
- **Output:** `climateReading`
- **Next:** 4
- **On failure:** `ERR_CLIMATE_READING_CREATE_FAILED`

</details>

<details>
  <summary>Step 4: Return</summary>

- **Target:** API response
- **Details:**
  - Return the created reading's `id` and `recordedAt` with HTTP status 201.
- **Output:** -
- **Next:** -
- **On failure:** -

</details>

## Response

### Success

| Status | Description                                  |
| ------ | -------------------------------------------- |
| 201    | The climate reading was recorded.            |

| Property   | Type   | Description                                  |
| ---------- | ------ | -------------------------------------------- |
| readingId  | string | Identifier assigned to the created reading  |
| recordedAt | string | Recording time in ISO 8601 UTC format        |

### Error

| Status | Message                             | Raised at |
| ------ | ----------------------------------- | --------- |
| 404    | `TERRARIUM_NOT_FOUND`               | Step 2    |
| 500    | `ERR_TERRARIUM_LOOKUP_FAILED`       | Step 1    |
| 409    | `TERRARIUM_NOT_MONITORED`           | Step 2    |
| 500    | `ERR_CLIMATE_READING_CREATE_FAILED` | Step 3    |
````
