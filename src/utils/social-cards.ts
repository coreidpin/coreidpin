/**
 * Social Card Generator
 * Generate Open Graph images for social sharing
 */

interface SocialCardData {
  name: string;
  role: string;
  skills?: string[];
  stats?: {
    experience?: string;
    projects?: string;
    endorsements?: string;
  };
  pinNumber?: string;
}

/**
 * Generate Social Card HTML
 * This creates a beautiful card for og:image
 */
export function generateSocialCardHTML(data: SocialCardData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      width: 1200px;
      height: 630px;
      margin: 0;
      padding: 0;
      overflow: hidden;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    
    .card {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
      position: relative;
      overflow: hidden;
    }
    
    /* Animated gradient overlay */
    .gradient-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%);
      animation: gradientMove 8s ease-in-out infinite;
    }
    
    @keyframes gradientMove {
      0%, 100% {
        background: radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%);
      }
      50% {
        background: radial-gradient(circle at 70% 50%, rgba(139, 92, 246, 0.2) 0%, transparent 50%);
      }
    }
    
    /* Grid pattern */
    .grid-pattern {
      position: absolute;
      inset: 0;
      opacity: 0.1;
      background-image: 
        linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
      background-size: 32px 32px;
    }
    
    /* Content */
    .content {
      position: relative;
      z-index: 10;
      height: 100%;
      padding: 80px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    /* Top Section */
    .top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .logo {
      color: white;
      font-size: 32px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #3B82F6, #8B5CF6);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }
    
    .beta-badge {
      background: rgba(59, 130, 246, 0.2);
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: #60A5FA;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    /* Middle Section */
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .name {
      color: white;
      font-size: 72px;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 16px;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }
    
    .role {
      color: #60A5FA;
      font-size: 36px;
      font-weight: 600;
      margin-bottom: 32px;
    }
    
    .skills {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 32px;
    }
    
    .skill-pill {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 10px 20px;
      border-radius: 24px;
      font-size: 18px;
      font-weight: 500;
      backdrop-filter: blur(10px);
    }
    
    /* Bottom Section */
    .bottom {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    
    .stats {
      display: flex;
      gap: 48px;
    }
    
    .stat {
      display: flex;
      flex-direction: column;
    }
    
    .stat-value {
      color: white;
      font-size: 48px;
      font-weight: 800;
      line-height: 1;
    }
    
    .stat-label {
      color: rgba(255, 255, 255, 0.6);
      font-size: 18px;
      margin-top: 8px;
    }
    
    .pin-display {
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 16px 32px;
      border-radius: 12px;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 2px;
      font-family: 'Monaco', 'Courier New', monospace;
      backdrop-filter: blur(10px);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="gradient-overlay"></div>
    <div class="grid-pattern"></div>
    
    <div class="content">
      <!-- Top -->
      <div class="top">
        <div class="logo">
          <div class="logo-icon">🆔</div>
          <span>GidiPIN</span>
        </div>
        <div class="beta-badge">Beta</div>
      </div>
      
      <!-- Main -->
      <div class="main">
        <div class="name">${data.name}</div>
        <div class="role">${data.role}</div>
        
        ${data.skills && data.skills.length > 0 ? `
          <div class="skills">
            ${data.skills.slice(0, 5).map(skill => 
              `<div class="skill-pill">${skill}</div>`
            ).join('')}
          </div>
        ` : ''}
      </div>
      
      <!-- Bottom -->
      <div class="bottom">
        ${data.stats ? `
          <div class="stats">
            ${data.stats.experience ? `
              <div class="stat">
                <div class="stat-value">${data.stats.experience}</div>
                <div class="stat-label">Years Experience</div>
              </div>
            ` : ''}
            ${data.stats.projects ? `
              <div class="stat">
                <div class="stat-value">${data.stats.projects}</div>
                <div class="stat-label">Projects</div>
              </div>
            ` : ''}
            ${data.stats.endorsements ? `
              <div class="stat">
                <div class="stat-value">${data.stats.endorsements}</div>
                <div class="stat-label">Endorsements</div>
              </div>
            ` : ''}
          </div>
        ` : ''}
        
        ${data.pinNumber ? `
          <div class="pin-display">PIN: ${data.pinNumber}</div>
        ` : ''}
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate Social Card URL
 * Uses an API route to generate the image
 */
export function generateSocialCardURL(data: SocialCardData): string {
  const params = new URLSearchParams({
    name: data.name,
    role: data.role,
    skills: data.skills?.slice(0, 5).join(',') || '',
    pin: data.pinNumber || '',
    ...(data.stats?.experience && { exp: data.stats.experience }),
    ...(data.stats?.projects && { projects: data.stats.projects }),
  });

  return `/api/og-image?${params.toString()}`;
}

/**
 * Get meta tags for social sharing
 */
export function getSocialMetaTags(data: {
  title: string;
  description: string;
  imageUrl?: string;
  url?: string;
}): string {
  return `
    <meta property="og:title" content="${data.title}" />
    <meta property="og:description" content="${data.description}" />
    <meta property="og:image" content="${data.imageUrl || '/og-default.png'}" />
    <meta property="og:url" content="${data.url || ''}" />
    <meta property="og:type" content="profile" />
    
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${data.title}" />
    <meta name="twitter:description" content="${data.description}" />
    <meta name="twitter:image" content="${data.imageUrl || '/og-default.png'}" />
  `;
}

/**
 * Download Social Card as PNG
 */
export async function downloadSocialCard(data: SocialCardData): Promise<void> {
  const html = generateSocialCardHTML(data);
  
  // Create a new window with the card
  const printWindow = window.open('', '_blank', 'width=1200,height=630');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // User can right-click and save image, or take screenshot
    alert('Right-click on the card and select "Save image as..." or take a screenshot!');
  }
}
