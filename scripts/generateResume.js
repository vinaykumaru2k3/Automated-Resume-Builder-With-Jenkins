#!/usr/bin/env node

/**
 * Resume PDF Generation Script
 * 
 * Reads resume.json and resume.html template, compiles with Handlebars,
 * and generates a PDF using Puppeteer.
 * 
 * Usage: npm run generate
 */

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const puppeteer = require('puppeteer');

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

/**
 * Logs an error message with red color and exits with code 1
 */
function logError(message, error = null) {
    console.error(`${colors.red}❌ ERROR: ${message}${colors.reset}`);
    if (error && process.env.DEBUG) {
        console.error(`${colors.red}${error.stack}${colors.reset}`);
    }
    process.exit(1);
}

/**
 * Logs a success message with green color
 */
function logSuccess(message) {
    console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

/**
 * Logs an info message with cyan color
 */
function logInfo(message) {
    console.log(`${colors.cyan}ℹ ${message}${colors.reset}`);
}

/**
 * Logs a warning message with yellow color
 */
function logWarning(message) {
    console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

/**
 * Reads and parses resume JSON
 */
function loadResume() {
    const resumePath = path.join(__dirname, '..', 'data', 'resume.json');
    logInfo(`Loading resume from: ${resumePath}`);

    try {
        const fileContent = fs.readFileSync(resumePath, 'utf-8');
        const resume = JSON.parse(fileContent);
        logSuccess(`Resume loaded successfully`);
        return resume;
    } catch (error) {
        if (error.code === 'ENOENT') {
            logError(`Resume file not found at ${resumePath}`, error);
        } else if (error instanceof SyntaxError) {
            logError(`Invalid JSON in resume.json: ${error.message}`, error);
        } else {
            logError(`Failed to read resume: ${error.message}`, error);
        }
    }
}

/**
 * Reads and prepares HTML template
 */
function loadTemplate() {
    const templatePath = path.join(__dirname, '..', 'template', 'resume.html');
    logInfo(`Loading template from: ${templatePath}`);

    try {
        const fileContent = fs.readFileSync(templatePath, 'utf-8');
        logSuccess(`Template loaded successfully`);
        return fileContent;
    } catch (error) {
        if (error.code === 'ENOENT') {
            logError(`Template file not found at ${templatePath}`, error);
        } else {
            logError(`Failed to read template: ${error.message}`, error);
        }
    }
}

/**
 * Compiles Handlebars template with resume data
 */
function compileTemplate(templateContent, resume) {
    logInfo(`Compiling template with resume data...`);

    try {
        // Register Handlebars helpers
        Handlebars.registerHelper('if', function(condition, options) {
            return condition ? options.fn(this) : options.inverse(this);
        });

        // Add generated timestamp
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const resumeWithTimestamp = {
            ...resume,
            generatedAt: formattedDate
        };

        const template = Handlebars.compile(templateContent);
        const html = template(resumeWithTimestamp);
        
        logSuccess(`Template compiled successfully`);
        return html;
    } catch (error) {
        logError(`Failed to compile template: ${error.message}`, error);
    }
}

/**
 * Generates PDF from HTML using Puppeteer
 */
async function generatePDF(htmlContent) {
    logInfo(`Starting PDF generation...`);

    let browser;
    try {
        // Launch browser
        logInfo(`Launching Puppeteer browser...`);
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            timeout: 30000
        });
        logSuccess(`Browser launched`);

        // Create new page
        logInfo(`Creating new page...`);
        const page = await browser.newPage();
        
        // Set viewport for consistent rendering
        await page.setViewport({
            width: 210,  // A4 width in mm
            height: 297, // A4 height in mm
            deviceScaleFactor: 1
        });
        logSuccess(`Page created with A4 viewport`);

        // Set HTML content
        logInfo(`Setting page content...`);
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });
        logSuccess(`Page content set`);

        // Ensure output directory exists
        const outputDir = path.join(__dirname, '..', 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
            logInfo(`Created output directory: ${outputDir}`);
        }

        // Generate PDF
        const pdfPath = path.join(outputDir, 'resume.pdf');
        logInfo(`Generating PDF file...`);
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            margin: {
                top: '0px',
                bottom: '0px',
                left: '0px',
                right: '0px'
            },
            printBackground: true,
            timeout: 30000
        });
        logSuccess(`PDF generated successfully at: ${pdfPath}`);

        // Get file size
        const stats = fs.statSync(pdfPath);
        const fileSizeInKB = (stats.size / 1024).toFixed(2);
        logInfo(`PDF file size: ${fileSizeInKB} KB`);

        await page.close();
        return pdfPath;

    } catch (error) {
        logError(`Failed to generate PDF: ${error.message}`, error);
    } finally {
        if (browser) {
            await browser.close();
            logSuccess(`Browser closed`);
        }
    }
}

/**
 * Main generation function
 */
async function generateResume() {
    console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}   Resume PDF Generation${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

    try {
        // Load resume data
        const resume = loadResume();
        console.log();

        // Load template
        const templateContent = loadTemplate();
        console.log();

        // Compile template
        const htmlContent = compileTemplate(templateContent, resume);
        console.log();

        // Generate PDF
        await generatePDF(htmlContent);
        console.log();

        // Success summary
        console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}`);
        console.log(`${colors.green}✓ Resume PDF generated successfully!${colors.reset}`);
        console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

        process.exit(0);
    } catch (error) {
        logError(`Unexpected error: ${error.message}`, error);
    }
}

// Run generation if this script is executed directly
if (require.main === module) {
    generateResume().catch(error => {
        logError(`Fatal error: ${error.message}`, error);
    });
}

module.exports = { generateResume, loadResume, loadTemplate, compileTemplate, generatePDF };
