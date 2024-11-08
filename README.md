# Domain Security Analyzer 🔍💻

A comprehensive tool that analyzes domain ownership, hosting, and security data to detect suspicious or malicious domains. It integrates multiple services to provide a full, 360-degree analysis of domains, helping users identify potential threats.

## 🛠️ **Tools and Technologies Used**

### Backend Tools:
1. **Whois Lookup** 🔎  
   Retrieves domain registration details (e.g., registrar, owner) to verify legitimacy.  
   *Integration*: Use `whois` library in Python or Django.

2. **Shodan API** 🌐  
   Provides server details, open ports, and vulnerabilities.  
   *Integration*: Fetch data with the Shodan API.

3. **Amass (Subdomain Enumeration)** 🕵️‍♂️  
   Identifies hidden subdomains related to the main domain.  
   *Integration*: Use the Amass API to enumerate subdomains and store results.

4. **SecurityTrails (Historical DNS Records)** 🗓️  
   Reveals past DNS records to expose hidden IPs or hosting.  
   *Integration*: Use SecurityTrails API for historical DNS data.

5. **SSL Certificate Logs (CRT.sh)** 🔒  
   Displays SSL certificates, validity, expiration, and vulnerabilities.  
   *Integration*: Query CRT.sh API for SSL logs.

### Frontend Technologies:
1. **React** ⚛️  
   For building dynamic and interactive UI components.  
   *Usage*: Handles user input, displays results, and manages state.

2. **Axios / Fetch API** 📡  
   For HTTP requests to the Django backend.  
   *Usage*: Fetches Whois, Shodan, subdomains, DNS, SSL data, and vulnerabilities.

3. **Material-UI / Bootstrap** 🎨  
   Ensures a responsive and clean UI.  
   *Usage*: Uses cards, tables, collapsible sections for consistent design.

4. **Interactive Map (Optional)** 🗺️  
   Displays server location data.  
   *Usage*: Shows geographical server data via an interactive map.

5. **Chart.js (Optional)** 📊  
   Visualizes open ports or vulnerabilities.  
   *Usage*: Creates charts for quick risk assessment.

---

## 📈 **How Data Flows**

1. **User Input** 🧑‍💻  
   User enters the domain to analyze on the frontend. The frontend sends the domain data to the backend.

2. **Backend Analysis** ⚙️  
   The backend processes the domain by calling APIs (Whois, Shodan, Amass, etc.), compiling the data into a structured format.

3. **Data Processing** 🔄  
   Data is organized, formatted, and temporarily stored in PostgreSQL for easy retrieval.

4. **Frontend Display** 👀  
   The frontend displays the analyzed data in an organized manner using tables, cards, and charts.

---

## 💡 **Key Challenges Addressed**

1. **Bypassing Cloudflare/Proxies** 🚫  
   Uses SecurityTrails and Amass to uncover real hosting details hidden behind Cloudflare or other proxies.

2. **Comprehensive Data** 🛡️  
   Integrates multiple tools to provide a full, 360-degree view of a domain’s security and ownership.

3. **User-Friendly Interface** 🖥️  
   Offers an interactive and clean UI to help users quickly analyze domains and assess potential security risks.

---

## ⚙️ **Scalability and Performance**

- **Backend**: Optimized to handle multiple API requests and large datasets efficiently.  
- **Database**: PostgreSQL is used for storing and retrieving large-scale data quickly.  
- **Frontend**: Optimized for responsiveness, ensuring a smooth experience on both desktop and mobile devices.

---

## 🚀 **Conclusion**

This tool provides a detailed, user-friendly solution for analyzing suspicious websites by integrating multiple services, including Whois, Shodan, Amass, SecurityTrails, and SSL data. With the power of the Django and React stack, it efficiently handles and displays domain data, helping users detect and assess potential security threats.

---

Feel free to fork, clone, or contribute to this project! 🛠️  
[GitHub Repository Link](https://github.com/Atharva-Dhavale/website_checker)

---

This version is formatted for clarity and engagement, making it easy for users to understand and navigate your project. Let me know if you need further adjustments!
