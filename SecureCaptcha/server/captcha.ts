import { randomBytes } from "crypto";

interface CaptchaOptions {
  length?: number;
}

export function generateCaptcha(options: CaptchaOptions = {}): { text: string; dataUrl: string } {
  const length = options.length || 5;
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";
  
  // Generate random captcha text
  let captchaText = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    captchaText += chars[randomIndex];
  }

  // Generate a simplistic SVG CAPTCHA that works reliably
  const svgWidth = 240;
  const svgHeight = 70;
  const charWidth = svgWidth / (captchaText.length + 1);
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
    <rect width="100%" height="100%" fill="#f5f5f5" />`;
  
  // Add a few noise lines
  for (let i = 0; i < 5; i++) {
    const x1 = Math.floor(Math.random() * svgWidth);
    const y1 = Math.floor(Math.random() * svgHeight);
    const x2 = Math.floor(Math.random() * svgWidth);
    const y2 = Math.floor(Math.random() * svgHeight);
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#aaa" stroke-width="1" />`;
  }
  
  // Add text with minimal styling - for improved reliability
  for (let i = 0; i < captchaText.length; i++) {
    const char = captchaText.charAt(i);
    const x = charWidth * (i + 1);
    const y = svgHeight / 2 + (Math.random() * 10 - 5);
    const rotate = Math.floor(Math.random() * 30 - 15);
    
    svg += `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="30" 
            font-weight="bold" text-anchor="middle" fill="#333"
            transform="rotate(${rotate}, ${x}, ${y})">${char}</text>`;
  }
  
  svg += `</svg>`;
  
  // Convert to data URL
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  
  return {
    text: captchaText,
    dataUrl
  };
}

export function generateSessionId(): string {
  return randomBytes(16).toString("hex");
}
