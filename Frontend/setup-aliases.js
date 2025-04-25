// This is a build-time helper script to create module files
const fs = require('fs');
const path = require('path');

// Create the directory structure
console.log('Setting up module aliases for build...');

try {
  // Make sure the directory exists
  const targetDir = path.join(__dirname, 'node_modules', '@');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Create @/lib directory
  const libTargetPath = path.join(targetDir, 'lib');
  
  // Remove existing directory if it exists
  if (fs.existsSync(libTargetPath)) {
    if (fs.lstatSync(libTargetPath).isSymbolicLink()) {
      fs.unlinkSync(libTargetPath);
    } else {
      fs.rmSync(libTargetPath, { recursive: true, force: true });
    }
  }
  
  // Create directory
  fs.mkdirSync(libTargetPath, { recursive: true });
  
  // Create api.ts file
  const apiFilePath = path.join(libTargetPath, 'api.ts');
  const apiContent = `// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Analyzes a domain and returns security information
 * @param domain The domain to analyze
 * @returns Analysis results
 */
export async function analyzeDomain(domain: string) {
  try {
    const response = await fetch(\`\${API_BASE_URL}/analyze/?domain=\${encodeURIComponent(domain)}\`);
    
    if (!response.ok) {
      throw new Error(\`Error analyzing domain: \${response.status}\`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing domain:', error);
    throw error;
  }
}

/**
 * Checks if the API is available
 * @returns True if the API is available
 */
export async function checkApiHealth() {
  try {
    const response = await fetch(\`\${API_BASE_URL}/health\`, {
      method: 'HEAD',
    });
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}

/**
 * Flags a domain for investigation
 * @param domain Domain to flag
 * @param flag Whether to flag (true) or unflag (false)
 * @returns Response from the API
 */
export async function flagDomain(domain: string, flag: boolean = true) {
  try {
    const response = await fetch(\`\${API_BASE_URL}/flag_domain/\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain, flag }),
    });
    
    if (!response.ok) {
      throw new Error(\`Error flagging domain: \${response.status}\`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error flagging domain:', error);
    throw error;
  }
}

/**
 * Gets dashboard data
 * @returns Dashboard statistics and data
 */
export async function getDashboardData() {
  try {
    const response = await fetch(\`\${API_BASE_URL}/dashboard/\`);
    
    if (!response.ok) {
      throw new Error(\`Error fetching dashboard data: \${response.status}\`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}`;
  
  // Create utils.ts file
  const utilsFilePath = path.join(libTargetPath, 'utils.ts');
  const utilsContent = `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`;
  
  // Write the files
  fs.writeFileSync(apiFilePath, apiContent);
  console.log(`Created ${apiFilePath}`);
  
  fs.writeFileSync(utilsFilePath, utilsContent);
  console.log(`Created ${utilsFilePath}`);
  
  console.log('Module aliases setup completed successfully!');
} catch (error) {
  console.error('Error setting up module aliases:', error);
  process.exit(1);
} 