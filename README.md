# 🛡️ TraceHost

<div align="center">

![TraceHost Banner](https://via.placeholder.com/800x200/0a1929/ffffff?text=TraceHost+Security+Analysis)

**A modern domain intelligence and security analysis platform for detecting malicious domains and analyzing security threats.**

[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

## 👥 Collaborators

- [Atharva Dhavale](https://github.com/Atharva-Dhavale) 
- [Harshvardhan Bhosale](https://github.com/Harshbhosale05) 
- [Sarish Sonawane](https://github.com/Sarish05) 
- [Aayush Meghal](https://github.com/Assassin2306) 
- [Kartik Sirsilla](https://github.com/kartiksirsilla09) 

## ✨ Features

- 🔍 **Domain Analysis**: Analyze domains for suspicious patterns and security risks
- 🦠 **Threat Intelligence**: Check domains against known threat databases
- 🌎 **Geolocation Tracking**: Visualize server locations on an interactive map
- 📊 **Security Reporting**: Generate detailed security reports with risk scores
- 📑 **PDF Export**: Export analysis results as PDF for reporting
- 🎨 **Minimalist UI**: Clean, modern interface focused on data clarity

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- 📦 **Node.js** 18.x or higher
- 📦 **npm** 9.x or higher
- 🐍 **Python** 3.9 or higher
- 📦 **pip** (Python package installer)
- 🖥️ **Backend dependencies**:
  - Django 4.2.10
  - djangorestframework 3.14.0
  - django-cors-headers 4.3.1
  - requests 2.31.0
  - python-whois 0.8.0
  - dnspython 2.4.2
  - ipinfo 4.4.3
  - shodan 1.30.1
  - google-generativeai 0.3.2
  - python-decouple 3.8
  - Pillow 10.2.0

  (All backend dependencies are listed in `Backend/requirements.txt` and will be installed during setup)

### 🔧 Installation

#### 1️⃣ Clone the repository:
```bash
git clone https://github.com/Atharva-Dhavale/TraceHost.git
cd TraceHost
```

#### 2️⃣ Install dependencies:
```bash
npm install
```

#### 3️⃣ Set up environment variables:
```bash
cp .env.example .env
```
Then edit the `.env` file with your specific configuration values.

#### 4️⃣ Start the development server:
```bash
npm run dev
```

#### 5️⃣ Open in your browser:
Navigate to [http://localhost:3000](http://localhost:3000) in your browser

## 🔄 Complete Process to Run the Project

### First-time Setup

1. **Clone and configure the project**:
   ```bash
   # Clone the repository
   git clone https://github.com/Atharva-Dhavale/TraceHost.git
   cd TraceHost
   
   # Install dependencies for frontend
   cd Frontend
   npm install
   
   # Create environment file for frontend
   cp .env.example .env
   cd ..
   
   # Set up backend environment
   cd Backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install all backend dependencies from requirements.txt
   pip install -r requirements.txt
   
   # The requirements.txt includes all necessary packages:
   # - Django, DRF, CORS headers for the API server
   # - requests, python-whois, dnspython for domain analysis
   # - ipinfo, shodan for threat intelligence
   # - google-generativeai for AI-powered analysis
   # - python-decouple for environment management
   # - Pillow for image processing
   
   # Create environment file for backend
   cp .env.example .env
   cd ..
   ```

2. **Configure environment variables**:
   - Edit `Frontend/.env` file with your API keys and configuration:
     - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` for map functionality
     - `NEXT_PUBLIC_API_URL` pointing to your backend server
   
   - Edit `Backend/.env` file with your backend configuration:
     - Database credentials
     - API keys for external services
     - Secret key for Django

3. **Run backend migrations**:
   ```bash
   cd Backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python manage.py migrate
   cd ..
   ```

### Starting the Application

#### 🚀 Using the Automated Script (Recommended)

The easiest way to run both frontend and backend together:

```bash
# Make the script executable (only needed once)
chmod +x start-dev.sh

# Run the script
./start-dev.sh
```

This script will:
- Start the Django backend on http://localhost:8000
- Start the Next.js frontend on http://localhost:3000
- Create logs in the `logs` directory
- Allow stopping both servers with Ctrl+C

#### 👨‍💻 Running Manually

**For backend**:
```bash
cd Backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python manage.py runserver
```

**For frontend**:
```bash
cd Frontend
npm run dev
```

### 🧪 Testing
Run the test suite to ensure everything is working:
```bash
# Run all tests
npm test

# Run with coverage report
npm test -- --coverage
```

### 🔍 Linting and Code Quality
Maintain code quality with:
```bash
# Check code style
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

## ⚙️ Environment Configuration

This project uses environment variables for configuration. To set up your environment:

### 🔑 Client-side Environment Variables

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

### 🔒 Server-side Environment Variables

These variables are used server-side and are not exposed to the browser:

| Category | Variables |
|----------|-----------|
| API Keys | WHOIS_API_KEY, DNS_LOOKUP_API_KEY, THREAT_INTELLIGENCE_API_KEY, etc. |
| Database | DATABASE_URL, DB_USERNAME, DB_PASSWORD, etc. |
| Authentication | JWT_SECRET, JWT_EXPIRY |
| Security | ENCRYPTION_KEY, CORS_ALLOWED_ORIGINS |
| Email | SMTP_HOST, SMTP_USER, SMTP_PASSWORD, etc. |

## 📂 Project Structure

```
TraceHost/
├── Frontend/                  # Next.js frontend application
│   ├── app/                   # Next.js app router
│   │   ├── page.tsx           # Home page
│   │   ├── analyze/           # Domain analysis pages
│   │   ├── suspicious/        # Suspicious domains listing
│   │   └── api-docs/          # API documentation
│   ├── components/            # Reusable React components
│   │   ├── analyze/           # Analysis-related components
│   │   ├── common/            # Common UI components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # Basic UI elements
│   ├── lib/                   # Utilities and API services
│   │   ├── api.ts             # API client
│   │   └── utils.ts           # Utility functions
│   ├── public/                # Static assets
│   │   ├── images/            # Images and icons
│   │   └── fonts/             # Font files
│   └── styles/                # Global CSS styles
└── Backend/                   # Backend API server (separate repo)
```

## 🛠️ Development

### Commands

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## 🔐 Security Best Practices

1. 🚫 Never commit `.env` files to version control
2. 🔄 Use different values for development and production
3. 🔁 Regularly rotate sensitive credentials
4. 🔑 Use strong, unique values for secrets like JWT_SECRET and ENCRYPTION_KEY
5. 🛡️ Consider using a secrets manager for production deployments

## 🌐 Integration with External Services

TraceHost integrates with various external services for comprehensive domain analysis:

- **WHOIS Lookup**: Retrieves domain registration details
- **Geolocation APIs**: For mapping server locations
- **Threat Intelligence Databases**: To check for known malicious domains
- **DNS Lookup Services**: For domain name resolution and validation

## 🚀 Deployment

### Vercel (Recommended)
Deploy to Vercel for the easiest setup:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel
```

### Docker
Run with Docker:

```bash
# Build the Docker image
docker build -t tracehost .

# Run the container
docker run -p 3000:3000 tracehost
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Contact

Atharva Dhavale - [GitHub Profile](https://github.com/Atharva-Dhavale)

Project Link: [https://github.com/Atharva-Dhavale/TraceHost](https://github.com/Atharva-Dhavale/TraceHost)

## 🔐 Protecting Sensitive Information

To keep your API keys and other sensitive information secure when using this repository:

1. **Environment Variables**: 
   - Never commit `.env` files containing real credentials
   - Use the provided `.env.example` files as templates
   - Copy them to new `.env` files with your actual values: `cp .env.example .env`

2. **Before committing code**:
   - Check that `.gitignore` is properly excluding sensitive files
   - Run `git status` to verify no sensitive files are staged
   - Consider using `git-secret` or similar tools for team-based development

3. **If you've accidentally committed sensitive info**:
   - Use BFG Repo-Cleaner or `git filter-branch` to remove sensitive data
   - Change all exposed credentials immediately
   - Consider these credentials compromised

4. **For CI/CD pipelines**:
   - Use your platform's secrets management (GitHub Secrets, Vercel Environment Variables, etc.)
   - Never display environment variables in build logs

5. **Development Best Practices**:
   - Always ignore `node_modules/` directories (included in `.gitignore`)
   - Large dependencies should never be committed to the repository
   - For frontend dependencies, use `package.json` to document requirements
   - For backend dependencies, use `requirements.txt`

For more information on securing repositories, see [GitHub's guide on removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository). 