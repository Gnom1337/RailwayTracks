# Railway Defect Control — React + MUI

Frontend for the ASP.NET Core Clean Architecture backend.

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

Set:

```env
VITE_API_URL=https://localhost:5001/api
```

to your ASP.NET Core API URL.

## Expected auth endpoints

The frontend expects:

- `POST /api/auth/login`
- `POST /api/auth/refresh`

Login response:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresAt": "...",
  "user": {
    "id": "...",
    "userName": "...",
    "email": "...",
    "roles": ["Admin"]
  }
}
```

Refresh response:

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

## Main backend endpoints used

- `/api/defects`
- `/api/defects/{id}/status`
- `/api/defects/{id}/repair-team`
- `/api/defect-types`
- `/api/locations`
- `/api/inspectors`
- `/api/repair-teams`
- `/api/data-sources`
- `/api/defect-status-history`

## Important: railway schematic

The UI deliberately does **not** use Yandex/OSM or a geographic map.

`TrackSchemePage` renders a dispatcher-style SVG schematic:

- track sections are lines;
- sensors are markers on lines;
- defects are associated with sections/locations;
- admin can add a new section without editing React code.

The current backend `Location` model only has one latitude/longitude pair. For the full "start/end coordinates + sensors" requirement, add dedicated backend entities/endpoints:

```text
TrackSegment
- Id
- Name
- StartKilometer
- EndKilometer
- StartX / StartY (or a geometry/normalized SVG coordinate)
- EndX / EndY
- Sensors

TrackSensor
- Id
- Name
- Serial
- TrackSegmentId
- Position
```

Recommended endpoints:

```text
GET    /api/track-scheme/segments
POST   /api/track-scheme/segments
PUT    /api/track-scheme/segments/{id}
DELETE /api/track-scheme/segments/{id}

GET    /api/track-scheme/sensors
POST   /api/track-scheme/sensors
PUT    /api/track-scheme/sensors/{id}
DELETE /api/track-scheme/sensors/{id}
```

The frontend already isolates these calls in `src/api/services.ts`, so the rest of the application does not need to change when the backend endpoints are added.

## Enum note

The sample frontend treats your C# enum values as numeric values. If your ASP.NET Core API is configured with:

```csharp
options.JsonSerializerOptions.Converters.Add(
    new JsonStringEnumConverter());
```

then replace the numeric enum fields in the forms with the corresponding string enum values.
