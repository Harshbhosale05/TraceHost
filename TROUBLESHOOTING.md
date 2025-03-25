# TraceHost Troubleshooting Guide

This document provides solutions for common issues you might encounter when running the TraceHost application.

## API Connection Issues

### Problem: Frontend can't connect to Backend API

**Symptoms:**
- "API: disconnected" badge appears in the header
- Console shows errors like `Not Found: /api/api/analyze`
- The application falls back to mock data

**Solution:**

1. **Check API Base URL Configuration**

   The Next.js frontend and Django backend need to have matching URL configurations.

   In `Frontend/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

   This sets the base URL for API requests. Make sure it doesn't include `/api` at the end.

2. **Check if Django server is running**

   Make sure your Django server is running at http://localhost:8000:
   ```
   cd Backend
   python manage.py runserver
   ```

3. **Check Django URL patterns**

   In `Backend/project/urls.py`, ensure your endpoints are properly defined:
   ```python
   urlpatterns = [
       path('admin/', admin.site.urls),
       path('api/analyze', check_domain, name='check_domain'),
       # other endpoints...
   ]
   ```

4. **Check Django CORS settings**

   In `Backend/project/settings.py`, ensure CORS is properly configured:
   ```python
   CORS_ALLOWED_ORIGINS = ['http://localhost:3000']
   ```

5. **Check for duplicate `/api` in requests**

   Look at network requests in your browser's dev tools. The URL should be:
   - Correct: `http://localhost:8000/api/analyze`
   - Incorrect: `http://localhost:8000/api/api/analyze`

   If you see duplicate `/api/api`, check the `API_BASE_URL` in `Frontend/lib/api.ts`.

## Google Maps Issues

### Problem: Google Maps doesn't display

**Symptoms:**
- Empty or error message in the map area
- Console shows "Google Maps API key is missing" or similar errors

**Solution:**

1. **Check Google Maps API Key**

   Ensure your API key is set in `Frontend/.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

2. **Enable required APIs in Google Cloud Console**

   Make sure you've enabled the required APIs in your Google Cloud project:
   - Maps JavaScript API
   - Geocoding API
   - Places API

3. **Check for billing issues**

   Google Maps Platform requires a billing account. Verify that your billing is set up correctly.

4. **Check for restrictions**

   Ensure your API key doesn't have restrictions that would prevent it from working on your development URL.

## Database Migrations Issues

### Problem: Django migrations errors

**Solution:**

Reset migrations if necessary:

```bash
cd Backend
rm -rf checker/migrations/
rm db.sqlite3
python manage.py makemigrations checker
python manage.py migrate
```

## Mock Data vs. Real Data

TraceHost will automatically fall back to mock data when it cannot connect to the Django backend. This is intended behavior to enable frontend development without requiring the backend to be running.

If you want to force the use of real data only, set in `Frontend/.env.local`:
```
NEXT_PUBLIC_USE_MOCK_DATA=false
```

## Diagnosing Issues with Console Logs

Both the frontend and backend have detailed console logging:

1. **Frontend Console Logs**
   - Open your browser's developer tools
   - Navigate to the Console tab
   - Look for logs prefixed with "API:"

2. **Backend Console Logs**
   - Check the terminal where you're running the Django server
   - Look in `logs/django.log` for detailed logs

## Other Common Issues

### Port conflicts

If port 8000 or 3000 is already in use:

For Django:
```bash
python manage.py runserver 8001
```

Then update `NEXT_PUBLIC_API_URL=http://localhost:8001` in `.env.local`

For Next.js:
```bash
npm run dev -- -p 3001
```

### Slow performance

If the application is slow:

1. Check for excessive network requests
2. Ensure caching is working correctly
3. Check for memory leaks in the browser

## Contact Support

If you continue to experience issues, please open an issue on GitHub or contact the project maintainers. 