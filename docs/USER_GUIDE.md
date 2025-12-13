# User Guide
## SkyTrack - Air Freight Tracking Platform

**Version:** 1.0  
**Date:** December 2025  
**Audience:** End Users

---

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Shipments](#managing-shipments)
4. [Live Flight Tracking](#live-flight-tracking)
5. [Weather Analysis](#weather-analysis)
6. [Generating Reports](#generating-reports)
7. [Tips & Best Practices](#tips--best-practices)

---

## 1. Getting Started

### Creating an Account

1. Navigate to the SkyTrack application URL
2. Click **"Get Started"** or **"Sign up"**
3. Enter your details:
   - Full Name (optional)
   - Email Address
   - Password (minimum 6 characters)
4. Click **"Create Account"**
5. Check your email for a confirmation link
6. Click the confirmation link to activate your account

### Logging In

1. Go to the Login page
2. Enter your email and password
3. Click **"Sign In"**
4. You will be redirected to the Dashboard

### Logging Out

1. Click your profile or the logout button in the navigation bar
2. You will be redirected to the landing page

---

## 2. Dashboard Overview

The Dashboard provides a quick overview of your shipment activity.

### Dashboard Statistics

| Metric | Description |
|--------|-------------|
| **Total Shipments** | All shipments you've created |
| **Active Shipments** | Shipments currently in transit |
| **Delivered Today** | Shipments that arrived today |
| **Delayed** | Shipments experiencing delays |
| **Weather Alerts** | Shipments affected by weather |

### Recent Shipments

The dashboard displays your most recent shipments with:
- Tracking number
- Route (Origin → Destination)
- Current status
- Quick link to view details

---

## 3. Managing Shipments

### Creating a New Shipment

1. Click **"+ New Shipment"** button
2. Fill in the required fields:
   - **Origin** *(required)*: Departure location (e.g., "New York, JFK Airport")
   - **Destination** *(required)*: Arrival location (e.g., "Los Angeles, LAX Airport")
3. Fill in optional fields:
   - **Cargo Type**: Select from General, Fragile, Hazardous, Perishable, Valuable, Documents
   - **Weight (kg)**: Enter cargo weight
   - **Estimated Arrival**: Select expected arrival date/time
   - **Coordinates**: Add latitude/longitude for precise tracking
4. Click **"Create Shipment"**
5. A tracking number will be automatically generated

### Viewing Shipment Details

1. Go to **Shipments** page
2. Click on any shipment in the list
3. The detail page shows:
   - Route information
   - Current status
   - Tracking timeline
   - Weather conditions
   - Assigned flight (if any)
   - Cargo details

### Updating Shipment Status

1. Open the shipment detail page
2. In the sidebar, find **"Update Status"**
3. Click the new status:
   - **Pending** → Shipment created, not yet departed
   - **Departed** → Shipment has left origin
   - **In Transit** → Shipment is on its way
   - **Arrived** → Shipment reached destination
   - **Delayed** → Shipment experiencing delays
4. Status change is saved automatically
5. A tracking event is recorded in the timeline

### Assigning a Flight to Shipment

1. Open a shipment with status **Pending** or **Departed**
2. Find **"Assign to Flight"** in the sidebar
3. Click **"Browse Available Flights"**
4. Search for a flight by:
   - Callsign (e.g., "UAL123")
   - ICAO code
   - Country
5. Click on a flight to assign it
6. The shipment will show live flight tracking with ETA

### Deleting a Shipment

1. Open the shipment detail page
2. Click the **"Delete"** button
3. Confirm the deletion
4. The shipment and all associated data will be removed

### Searching Shipments

1. Go to the **Shipments** page
2. Use the search filters:
   - **Tracking Number**: Search by tracking number
   - **Status**: Filter by shipment status
   - **Origin**: Search by origin location
   - **Destination**: Search by destination location
   - **Date Range**: Filter by creation date
   - **Cargo Type**: Filter by cargo type
3. Results update automatically as you type/select filters

---

## 4. Live Flight Tracking

### Viewing Live Flights

1. Go to the **Tracking** page
2. The map displays all currently airborne flights
3. Each airplane icon represents a live flight

### Interacting with the Map

- **Zoom**: Use scroll wheel or +/- buttons
- **Pan**: Click and drag the map
- **Click Flight**: Click an airplane icon to see details

### Flight Information

When you select a flight, you'll see:
- **Callsign**: Flight identifier
- **Airline**: Detected airline name (if recognized)
- **Altitude**: Current altitude in feet
- **Speed**: Ground speed in knots
- **Heading**: Direction of travel
- **Position**: Latitude/Longitude coordinates
- **Status**: In Flight or On Ground

### External Flight Information

Click the links at the bottom of flight details to view:
- **FlightRadar24**: Full route and schedule
- **FlightAware**: Detailed flight history
- **Google Maps**: Current position on map

### Auto-Refresh

- Enable **"Auto-refresh"** checkbox to update every 30 seconds
- Click **"🔄 Refresh"** for manual update

---

## 5. Weather Analysis

### Checking Weather by City

1. Go to the **Weather** page
2. Enter a city name in the search box
3. Press Enter or click Search
4. View current weather conditions:
   - Temperature
   - Weather description
   - Wind speed
   - Humidity
   - Flight impact assessment

### Weather Impact on Shipments

When viewing a shipment with coordinates:
1. Open the shipment detail page
2. Weather is automatically displayed for:
   - Origin location
   - Destination location
3. Weather data is recorded for reporting

### Understanding Weather Impact Levels

| Level | Color | Meaning |
|-------|-------|---------|
| **None** | Green | No impact on flights |
| **Low** | Blue | Minor delays possible |
| **Medium** | Yellow | Moderate delays expected |
| **High** | Orange | Significant delays likely |
| **Critical** | Red | Flights may be grounded |

### Weather-Adjusted ETA

When a flight is assigned to a shipment:
- ETA automatically adjusts for weather conditions
- Weather delays are shown separately
- Color-coded by severity

---

## 6. Generating Reports

### Available Reports

1. **Shipment Activity Report**
   - All shipment data with 8 columns
   - Tracking #, Origin, Destination, Status, Cargo Type, Weight, Created, ETA

2. **Weather Impact Analysis Report**
   - Weather conditions affecting shipments
   - Tracking #, Location, Weather, Impact Level, Delay Risk, Temp, Wind, Recorded At

3. **Route Performance Report**
   - Performance metrics by route
   - Route, Total Shipments, On-Time %, Avg Delay, Weather Delays, Weight

### Generating a Report

1. Go to the **Reports** page
2. Select a report type
3. (Optional) Set date range filters
4. Click **"Generate Report"**
5. Report will display in the browser

### Exporting Reports

Choose export format:
- **CSV**: Open in Excel, Google Sheets
- **JSON**: For data processing
- **HTML**: View/print in browser

Reports include:
- Title at the top
- Generated timestamp
- All matching data rows
- Total row count

---

## 7. Tips & Best Practices

### For Better Tracking

✅ **Add coordinates** when creating shipments for accurate weather data

✅ **Set estimated arrival** to track on-time performance

✅ **Assign flights** to shipments for real-time ETA updates

✅ **Update status** promptly to maintain accurate tracking history

### For Accurate Reports

✅ **Record weather impacts** by viewing shipment weather regularly

✅ **Use date filters** to focus on specific time periods

✅ **Export to CSV** for further analysis in spreadsheet software

### For Optimal Performance

✅ **Use search filters** instead of scrolling through all shipments

✅ **Enable auto-refresh** on tracking page for live updates

✅ **Check weather** before creating shipments for delay forecasting

---


## Status Indicators

### Shipment Status Colors

| Status | Color | Description |
|--------|-------|-------------|
| Pending | Gray | Awaiting departure |
| Departed | Blue | Left origin |
| In Transit | Indigo | On the way |
| Arrived | Green | Reached destination |
| Delayed | Red | Experiencing delays |
| Cancelled | Gray | Shipment cancelled |

### Flight Status Colors

| Status | Color | Description |
|--------|-------|-------------|
| In Flight | Green | Currently airborne |
| On Ground | Yellow | At airport |

---

## Getting Help

If you encounter issues:

1. **Check error messages** - They often explain what went wrong
2. **Refresh the page** - Clears temporary issues
3. **Log out and log in** - Resets your session
4. **Clear browser cache** - Fixes display issues

