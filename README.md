# TraceHost

A modern domain intelligence and security analysis platform for detecting malicious domains and analyzing security threats.

## Features

- **Domain Analysis**: Analyze domains for suspicious patterns and security risks
- **Threat Intelligence**: Check domains against known threat databases
- **Geolocation Tracking**: Visualize server locations on an interactive map
- **Security Reporting**: Generate detailed security reports with risk scores
- **PDF Export**: Export analysis results as PDF for reporting
- **Minimalist UI**: Clean, modern interface focused on data clarity

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Backend server running (refer to backend documentation)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/TraceHost.git
   cd TraceHost
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see Environment Configuration section)

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Configuration

This project uses environment variables for configuration. To set up your environment:

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your specific configuration values, especially:
   - API keys for external services
   - Database connection details
   - Backend server URL

### Client-side Environment Variables

The following variables are exposed to the browser and should be prefixed with `NEXT_PUBLIC_`:

| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_GOOGLE_MAPS_API_KEY | Google Maps API Key for location visualization | - |
| NEXT_PUBLIC_API_URL | Base URL for API requests | http://localhost:5000/api |
| NEXT_PUBLIC_BACKEND_URL | Backend server URL | http://localhost:5000 |
| NEXT_PUBLIC_FRONTEND_URL | Frontend URL for callbacks | http://localhost:3000 |
| NEXT_PUBLIC_ENABLE_API_LOGGING | Enable detailed API request logging | true |
| NEXT_PUBLIC_CACHE_TTL | Cache duration in seconds | 300 |
| NEXT_PUBLIC_REQUEST_TIMEOUT | API request timeout in milliseconds | 120000 |
| NEXT_PUBLIC_FETCH_TIMEOUT | Fetch timeout in milliseconds | 10000 |
| NEXT_PUBLIC_API_CHECK_FREQUENCY | How often to check API status (ms) | 30000 |

### Server-side Environment Variables

These variables are used server-side and are not exposed to the browser:

| Category | Variables |
|----------|-----------|
| API Keys | WHOIS_API_KEY, DNS_LOOKUP_API_KEY, THREAT_INTELLIGENCE_API_KEY, etc. |
| Database | DATABASE_URL, DB_USERNAME, DB_PASSWORD, etc. |
| Authentication | JWT_SECRET, JWT_EXPIRY |
| Security | ENCRYPTION_KEY, CORS_ALLOWED_ORIGINS |
| Email | SMTP_HOST, SMTP_USER, SMTP_PASSWORD, etc. |

## Project Structure

```
TraceHost/
├── Frontend/                  # Next.js frontend application
│   ├── app/                   # Next.js app router
│   ├── components/            # Reusable React components
│   ├── lib/                   # Utilities and API services
│   ├── public/                # Static assets
│   └── styles/                # Global CSS styles
└── Backend/                   # Backend API server (separate repo)
```

## Development

### Commands

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Security Best Practices

1. Never commit `.env` files to version control
2. Use different values for development and production
3. Regularly rotate sensitive credentials
4. Use strong, unique values for secrets like JWT_SECRET and ENCRYPTION_KEY
5. Consider using a secrets manager for production deployments

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 