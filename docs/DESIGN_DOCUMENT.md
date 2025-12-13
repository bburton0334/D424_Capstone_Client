# Design Document
## SkyTrack - Air Freight Tracking Platform

**Version:** 1.0  
**Date:** December 2025  
**Author:** Software Engineering Capstone Project

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Design](#architecture-design)
3. [Class Diagram](#class-diagram)
4. [Database Design](#database-design)
5. [Component Design](#component-design)
6. [API Design](#api-design)

---

## 1. System Overview

SkyTrack is a full-stack web application for tracking air freight shipments with integrated weather impact analysis. The system provides real-time flight tracking, weather monitoring, and comprehensive reporting capabilities.

### Key Features
- Shipment CRUD operations with status tracking
- Live flight tracking via OpenSky Network API
- Weather impact analysis via OpenWeatherMap API
- Multi-criteria search functionality
- Report generation (CSV, JSON, HTML)
- User authentication and authorization

### Technology Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL (Supabase) |
| Authentication | Supabase Auth (JWT) |
| APIs | OpenSky Network, OpenWeatherMap |

---

## 2. Architecture Design

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    React Frontend (TypeScript)                    │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │   │
│  │  │  Pages   │ │Components│ │ Services │ │  Types   │            │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/REST
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              SERVER LAYER                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                  Express.js Backend (TypeScript)                  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │   │
│  │  │  Routes  │ │Middleware│ │ Services │ │ Classes  │            │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │   │
│  │                                                                   │   │
│  │  Routes:        Middleware:      Services:       Classes:        │   │
│  │  - auth         - auth           - search        - Vehicle       │   │
│  │  - shipments    - validation     - report        - Flight        │   │
│  │  - tracking     - errorHandler   - openweather   - ShipmentStatus│   │
│  │  - weather                       - opensky       - WeatherCondition│  │
│  │  - reports                                       - Report         │   │
│  │  - analytics                                                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
┌─────────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    DATA LAYER       │ │  EXTERNAL APIs  │ │  EXTERNAL APIs  │
│  ┌───────────────┐  │ │ ┌─────────────┐ │ │ ┌─────────────┐ │
│  │   Supabase    │  │ │ │   OpenSky   │ │ │ │OpenWeather  │ │
│  │  PostgreSQL   │  │ │ │   Network   │ │ │ │    Map      │ │
│  │    + Auth     │  │ │ │   (Flights) │ │ │ │  (Weather)  │ │
│  └───────────────┘  │ │ └─────────────┘ │ │ └─────────────┘ │
└─────────────────────┘ └─────────────────┘ └─────────────────┘
```

### Request Flow Diagram

```
┌────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐     ┌──────────┐
│ Client │────▶│  Nginx/  │────▶│   Express  │────▶│Middleware│────▶│  Route   │
│(React) │     │  Proxy   │     │   Server   │     │  Chain   │     │ Handler  │
└────────┘     └──────────┘     └────────────┘     └──────────┘     └──────────┘
                                                                          │
    ┌─────────────────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Service  │────▶│ Database │────▶│ Response │
│  Layer   │     │  Query   │     │  JSON    │
└──────────┘     └──────────┘     └──────────┘
```

---

## 3. Class Diagram

### OOP Class Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VEHICLE HIERARCHY                                  │
│                                                                             │
│                        ┌─────────────────────┐                              │
│                        │  <<abstract>>       │                              │
│                        │     Vehicle         │                              │
│                        ├─────────────────────┤                              │
│                        │ # id: string        │                              │
│                        │ # latitude: number  │                              │
│                        │ # longitude: number │                              │
│                        │ # speed: number     │                              │
│                        │ # lastUpdate: Date  │                              │
│                        ├─────────────────────┤                              │
│                        │ + getId(): string   │                              │
│                        │ + getPosition()     │                              │
│                        │ + getSpeed(): number│                              │
│                        │ + distanceTo()      │                              │
│                        │ <<abstract>>        │                              │
│                        │ + getDisplayName()  │                              │
│                        │ + getVehicleType()  │                              │
│                        │ + toJSON()          │                              │
│                        └──────────┬──────────┘                              │
│                                   │                                         │
│                                   │ extends                                 │
│                                   ▼                                         │
│                        ┌─────────────────────┐                              │
│                        │      Flight         │                              │
│                        ├─────────────────────┤                              │
│                        │ - icao24: string    │                              │
│                        │ - callsign: string  │                              │
│                        │ - altitude: number  │                              │
│                        │ - heading: number   │                              │
│                        │ - originCountry     │                              │
│                        ├─────────────────────┤                              │
│                        │ + getDisplayName()  │                              │
│                        │ + getVehicleType()  │                              │
│                        │ + toJSON()          │                              │
│                        │ + calculateETA()    │                              │
│                        │ + fromOpenSkyData() │                              │
│                        └─────────────────────┘                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        SHIPMENT STATUS HIERARCHY                             │
│                                                                             │
│                        ┌─────────────────────┐                              │
│                        │  <<abstract>>       │                              │
│                        │  ShipmentStatus     │                              │
│                        ├─────────────────────┤                              │
│                        │ # statusName: string│                              │
│                        │ # timestamp: Date   │                              │
│                        ├─────────────────────┤                              │
│                        │ + getStatusName()   │                              │
│                        │ + canTransitionTo() │                              │
│                        │ + toJSON()          │                              │
│                        └──────────┬──────────┘                              │
│                                   │                                         │
│           ┌───────────┬───────────┼───────────┬───────────┬────────────┐   │
│           │           │           │           │           │            │   │
│           ▼           ▼           ▼           ▼           ▼            ▼   │
│    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────┐│
│    │ Pending  │ │ Departed │ │InTransit │ │ Arrived  │ │ Delayed  │ │Cancel││
│    │  Status  │ │  Status  │ │  Status  │ │  Status  │ │  Status  │ │Status││
│    └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └─────┘│
│                                                                             │
│                        ┌─────────────────────┐                              │
│                        │   StatusFactory     │                              │
│                        ├─────────────────────┤                              │
│                        │ + createStatus()    │                              │
│                        └─────────────────────┘                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        WEATHER CONDITION HIERARCHY                           │
│                                                                             │
│                        ┌─────────────────────┐                              │
│                        │  <<abstract>>       │                              │
│                        │  WeatherCondition   │                              │
│                        ├─────────────────────┤                              │
│                        │ # temperature       │                              │
│                        │ # windSpeed         │                              │
│                        │ # humidity          │                              │
│                        ├─────────────────────┤                              │
│                        │ + assessImpact()    │                              │
│                        │ + getDelayFactor()  │                              │
│                        │ + shouldGround()    │                              │
│                        │ + toJSON()          │                              │
│                        └──────────┬──────────┘                              │
│                                   │                                         │
│      ┌────────────┬───────────────┼───────────────┬────────────┬──────────┐│
│      │            │               │               │            │          ││
│      ▼            ▼               ▼               ▼            ▼          ▼│
│ ┌─────────┐ ┌─────────┐    ┌─────────┐    ┌─────────┐  ┌─────────┐ ┌──────┐│
│ │  Clear  │ │ Cloudy  │    │  Rain   │    │  Storm  │  │   Fog   │ │ Snow ││
│ │ Weather │ │ Weather │    │ Weather │    │ Weather │  │ Weather │ │Weathr││
│ └─────────┘ └─────────┘    └─────────┘    └─────────┘  └─────────┘ └──────┘│
│                                                                             │
│                        ┌─────────────────────┐                              │
│                        │   WeatherFactory    │                              │
│                        ├─────────────────────┤                              │
│                        │ + createFromApi()   │                              │
│                        └─────────────────────┘                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           REPORT HIERARCHY                                   │
│                                                                             │
│                        ┌─────────────────────┐                              │
│                        │  <<abstract>>       │                              │
│                        │      Report         │                              │
│                        ├─────────────────────┤                              │
│                        │ # title: string     │                              │
│                        │ # columns: Column[] │                              │
│                        │ # data: Object[]    │                              │
│                        │ # generatedAt: Date │                              │
│                        ├─────────────────────┤                              │
│                        │ + generate()        │                              │
│                        │ + getFileExtension()│                              │
│                        │ + getMimeType()     │                              │
│                        └──────────┬──────────┘                              │
│                                   │                                         │
│              ┌────────────────────┼────────────────────┐                   │
│              │                    │                    │                   │
│              ▼                    ▼                    ▼                   │
│       ┌─────────────┐     ┌─────────────┐     ┌─────────────┐             │
│       │  CSVReport  │     │ JSONReport  │     │ HTMLReport  │             │
│       └─────────────┘     └─────────────┘     └─────────────┘             │
│                                                                             │
│                        ┌─────────────────────┐                              │
│                        │   ReportFactory     │                              │
│                        ├─────────────────────┤                              │
│                        │ + createReport()    │                              │
│                        └─────────────────────┘                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Database Design

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                                      │
│                                                                             │
│  ┌──────────────────┐         ┌──────────────────┐                         │
│  │    auth.users    │         │    shipments     │                         │
│  │   (Supabase)     │         ├──────────────────┤                         │
│  ├──────────────────┤    1:N  │ id (PK)          │                         │
│  │ id (PK)          │────────▶│ user_id (FK)     │                         │
│  │ email            │         │ tracking_number  │                         │
│  │ encrypted_pass   │         │ origin           │                         │
│  └──────────────────┘         │ destination      │                         │
│                               │ status           │                         │
│                               │ cargo_type       │                         │
│                               │ weight_kg        │                         │
│                               │ origin_lat/lon   │                         │
│                               │ dest_lat/lon     │                         │
│                               │ estimated_arrival│                         │
│                               │ created_at       │                         │
│                               │ updated_at       │                         │
│                               └────────┬─────────┘                         │
│                                        │                                    │
│                    ┌───────────────────┼───────────────────┐               │
│                    │                   │                   │               │
│                    ▼ 1:N               ▼ 1:N               ▼ 1:N           │
│         ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐    │
│         │ tracking_events  │ │ weather_impacts  │ │shipment_assignments│  │
│         ├──────────────────┤ ├──────────────────┤ ├──────────────────┤    │
│         │ id (PK)          │ │ id (PK)          │ │ id (PK)          │    │
│         │ shipment_id (FK) │ │ shipment_id (FK) │ │ shipment_id (FK) │    │
│         │ status           │ │ impact_type      │ │ flight_id (FK)   │    │
│         │ location         │ │ description      │ │ assigned_at      │    │
│         │ latitude         │ │ severity         │ └──────────────────┘    │
│         │ longitude        │ │ weather_condition│           │             │
│         │ timestamp        │ │ recorded_at      │           │             │
│         │ notes            │ └──────────────────┘           │ 1:1         │
│         └──────────────────┘                                ▼             │
│                                                   ┌──────────────────┐    │
│  ┌──────────────────┐    ┌──────────────────┐    │ tracked_flights  │    │
│  │   weather_data   │    │  weather_alerts  │    ├──────────────────┤    │
│  │   (cache)        │    │   (unused)       │    │ id (PK)          │    │
│  ├──────────────────┤    ├──────────────────┤    │ icao24 (UNIQUE)  │    │
│  │ id (PK)          │    │ id (PK)          │    │ callsign         │    │
│  │ location_name    │    │ location_name    │    │ origin_country   │    │
│  │ latitude         │    │ event            │    │ latitude         │    │
│  │ longitude        │    │ severity         │    │ longitude        │    │
│  │ temperature      │    │ description      │    │ altitude         │    │
│  │ wind_speed       │    │ start_time       │    │ velocity         │    │
│  │ humidity         │    │ end_time         │    │ heading          │    │
│  │ conditions       │    └──────────────────┘    │ on_ground        │    │
│  │ fetched_at       │                            │ last_updated     │    │
│  └──────────────────┘                            └──────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Row Level Security (RLS) Policies

```
shipments:
  - SELECT: auth.uid() = user_id
  - INSERT: auth.uid() = user_id
  - UPDATE: auth.uid() = user_id
  - DELETE: auth.uid() = user_id

tracking_events:
  - SELECT: user owns parent shipment
  - INSERT: user owns parent shipment

weather_impacts:
  - SELECT: user owns parent shipment
  - INSERT: user owns parent shipment

tracked_flights:
  - SELECT: public read access
```

---

## 5. Component Design

### Frontend Component Hierarchy

```
App
├── Layout
│   └── Navbar
├── Pages
│   ├── Landing (public)
│   ├── Login (public)
│   ├── Register (public)
│   ├── Dashboard (protected)
│   │   ├── DashboardStats
│   │   └── RecentShipments
│   ├── Shipments (protected)
│   │   ├── ShipmentSearch
│   │   └── ShipmentList
│   ├── ShipmentNew (protected)
│   │   └── ShipmentForm
│   ├── ShipmentDetail (protected)
│   │   └── Flight Assignment Modal
│   ├── Reports (protected)
│   │   └── ReportGenerator
│   ├── Tracking (protected)
│   │   └── MapContainer (Leaflet)
│   └── Weather (protected)
│       └── WeatherWidget
└── ProtectedRoute (HOC)
```

---

## 6. API Design

### REST API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/logout` | User logout | Yes |
| GET | `/api/auth/user` | Get current user | Yes |
| GET | `/api/shipments` | List user shipments | Yes |
| POST | `/api/shipments` | Create shipment | Yes |
| GET | `/api/shipments/:id` | Get shipment details | Yes |
| PUT | `/api/shipments/:id` | Update shipment | Yes |
| DELETE | `/api/shipments/:id` | Delete shipment | Yes |
| GET | `/api/shipments/search` | Search shipments | Yes |
| GET | `/api/tracking/flights` | Get live flights | No |
| POST | `/api/tracking/assign` | Assign flight to shipment | Yes |
| GET | `/api/weather/city/:name` | Get weather by city | No |
| GET | `/api/weather/impact/:id` | Get shipment weather | Yes |
| GET | `/api/reports/shipments` | Shipment activity report | Yes |
| GET | `/api/reports/weather-impact` | Weather impact report | Yes |
| GET | `/api/reports/performance` | Route performance report | Yes |
| GET | `/api/analytics/dashboard` | Dashboard statistics | Yes |

---

## Appendix: Design Patterns Used

| Pattern | Implementation |
|---------|---------------|
| **Factory Pattern** | StatusFactory, WeatherFactory, ReportFactory |
| **Singleton Pattern** | Service instances (searchService, reportService) |
| **Abstract Factory** | Report class hierarchy |
| **Strategy Pattern** | Different weather impact calculations |
| **Repository Pattern** | Supabase data access layer |
| **Middleware Pattern** | Express authentication & validation |

