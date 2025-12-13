# Web Application Hosting
## SkyTrack - Air Freight Tracking Platform

**Version:** 1.0  
**Date:** December 2025

---

## Local URL
```
http://localhost:5173/
```

## Hosting Platform
- **Frontend Once Deployed:** Vercel
- **Backend Once Deployed:** Railway
- **Database:** Supabase (PostgreSQL)

---

## HTML Entry Point

The application is served from `client/index.html` but navigating directly to the root URL will navigate automatically to the main page:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Air Freight Tracking Platform with Weather Impact Analysis" />
    <title>SkyTrack - Air Freight Tracking</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

