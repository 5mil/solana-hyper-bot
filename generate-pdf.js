#!/usr/bin/env node

/**
 * Convert the Principia documentation to HTML format
 * This HTML can be opened in a browser and printed/saved as PDF
 */

const fs = require('fs');
const path = require('path');

console.log('Converting Principia documentation to HTML...\n');

// Read the markdown file
const mdPath = path.join(__dirname, 'PRINCIPIA_MATHEMATICA_TRADING_FRAMEWORK.md');
const mdContent = fs.readFileSync(mdPath, 'utf-8');

// Simple markdown to HTML conversion (basic features)
function markdownToHtml(markdown) {
  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Bold (process before italic to avoid conflicts)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Italic (simple non-greedy match, avoiding matches inside asterisks)
  // Note: This is a simplified parser and may not handle all edge cases
  html = html.replace(/\*([^*\n]+?)\*/g, '<em>$1</em>');
  
  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr>');
  
  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  
  // Lists (simple)
  html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  
  // Paragraphs
  html = html.split('\n\n').map(para => {
    if (para.trim() && 
        !para.startsWith('<h') && 
        !para.startsWith('<pre') && 
        !para.startsWith('<ul') && 
        !para.startsWith('<li') && 
        !para.startsWith('<hr') &&
        !para.startsWith('<blockquote')) {
      return `<p>${para}</p>`;
    }
    return para;
  }).join('\n');
  
  return html;
}

// Create HTML document
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Philosophiæ Naturalis Principia Mathematica - Trading Framework</title>
    <style>
        @media print {
            body { margin: 0; }
            @page { margin: 2cm; }
        }
        
        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
            background: #fff;
        }
        
        h1 {
            color: #1a1a1a;
            border-bottom: 3px solid #333;
            padding-bottom: 10px;
            font-size: 2.5em;
            margin-top: 40px;
        }
        
        h2 {
            color: #2a2a2a;
            border-bottom: 2px solid #666;
            padding-bottom: 8px;
            margin-top: 30px;
            font-size: 2em;
        }
        
        h3 {
            color: #3a3a3a;
            margin-top: 25px;
            font-size: 1.5em;
        }
        
        h4 {
            color: #4a4a4a;
            margin-top: 20px;
            font-size: 1.2em;
        }
        
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }
        
        pre {
            background: #f8f8f8;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 15px;
            overflow-x: auto;
            margin: 15px 0;
        }
        
        pre code {
            background: none;
            padding: 0;
        }
        
        blockquote {
            border-left: 4px solid #ccc;
            margin: 15px 0;
            padding: 10px 20px;
            background: #f9f9f9;
            font-style: italic;
        }
        
        ul, ol {
            margin: 10px 0;
            padding-left: 30px;
        }
        
        li {
            margin: 5px 0;
        }
        
        hr {
            border: none;
            border-top: 1px solid #ccc;
            margin: 30px 0;
        }
        
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 15px 0;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        
        th {
            background: #f4f4f4;
            font-weight: bold;
        }
        
        strong {
            color: #000;
        }
        
        .page-break {
            page-break-after: always;
        }
        
        .title-page {
            text-align: center;
            margin: 100px 0;
        }
        
        .title-page h1 {
            border: none;
            font-size: 3em;
            margin: 40px 0;
        }
        
        .subtitle {
            font-size: 1.5em;
            color: #666;
            margin: 20px 0;
        }
        
        .citation {
            background: #f0f8ff;
            border-left: 4px solid #4682b4;
            padding: 10px 15px;
            margin: 15px 0;
            font-size: 0.95em;
        }
    </style>
</head>
<body>
    <div class="title-page">
        <h1>Philosophiæ Naturalis Principia Mathematica</h1>
        <div class="subtitle">Application to Algorithmic Trading Systems</div>
        <p style="margin-top: 60px;">
            <strong>Trading Framework Documentation</strong><br>
            Based on Isaac Newton's Mathematical Principles of Natural Philosophy (1687)
        </p>
        <p style="margin-top: 40px; color: #888;">
            Solana Hyper Bot<br>
            Version 1.0<br>
            January 2026
        </p>
    </div>
    
    <div class="page-break"></div>
    
    ${markdownToHtml(mdContent)}
    
    <div class="page-break"></div>
    
    <div style="text-align: center; margin-top: 100px;">
        <hr style="width: 50%; margin: 40px auto;">
        <p style="font-style: italic; color: #666;">
            "Hypotheses non fingo" - I frame no hypotheses<br>
            — Isaac Newton, General Scholium, Principia Mathematica
        </p>
        <p style="margin-top: 40px; color: #888;">
            End of Document
        </p>
    </div>
</body>
</html>`;

// Write HTML file
const htmlPath = path.join(__dirname, 'PRINCIPIA_MATHEMATICA_TRADING_FRAMEWORK.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

console.log('✅ HTML file created successfully!');
console.log(`   Location: ${htmlPath}`);
console.log('\nTo create a PDF:');
console.log('1. Open PRINCIPIA_MATHEMATICA_TRADING_FRAMEWORK.html in a web browser');
console.log('2. Use the browser\'s Print function (Ctrl+P or Cmd+P)');
console.log('3. Select "Save as PDF" as the destination');
console.log('4. Adjust margins and settings as needed');
console.log('5. Save the PDF file\n');
console.log('The resulting PDF will be professionally formatted and print-ready.');
