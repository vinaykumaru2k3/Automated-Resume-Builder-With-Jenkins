#!/usr/bin/env node

/**
 * Resume PDF Generation Script
 * * Reads resume.json and resume.html template, compiles with Handlebars,
 * and generates a PDF using Puppeteer.
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

function logError(message, error = null) {
    console.error(`${colors.red}❌ ERROR: ${message}${colors.reset}`);
    if (error && process.env.DEBUG) {
        console.error(`${colors.red}${error.stack}${colors.reset}`);
    }
    // We don't exit here so Jest can finish running its assertions
    if (require.main === module) process.exit(1);
}

function logSuccess(message) {
    console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function logInfo(message) {
    console.log(`${colors.cyan}ℹ ${message}${colors.reset}`);
}

/**
 * Reads and parses resume JSON
 */
function loadResume() {
    // UPDATED: Using process.cwd() for Jenkins compatibility
    const resumePath = path.join(process.cwd(), 'data', 'resume.json');
    logInfo(`Loading resume from: ${resumePath}`);

    try {
        const fileContent = fs.readFileSync(resumePath, 'utf-8');
        const resume = JSON.parse(fileContent);
        logSuccess(`Resume loaded successfully`);
        return resume;
    } catch (error) {
        logError(`Failed to read resume: ${error.message}`, error);
        throw error;
    }
}

/**
 * Reads and prepares HTML template
 */
function loadTemplate() {
    // UPDATED: Using process.cwd()
    const templatePath = path.join(process.cwd(), 'template', 'resume.html');
    logInfo(`Loading template from: ${templatePath}`);

    try {
        const fileContent = fs.readFileSync(templatePath, 'utf-8');
        logSuccess(`Template loaded successfully`);
        return fileContent;
    } catch (error) {
        logError(`Failed to read template: ${error.message}`, error);
        throw error;
    }
}

/**
 * Compiles Handlebars template with resume data
 */
function compileTemplate(templateContent, resume) {
    logInfo(`Compiling template with resume data...`);

    try {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // BRIDGE: Mapping flat JSON structure to the nested template structure
        // This ensures {{personalInfo.fullName}} works even if JSON has just "name"
        const resumeWithTimestamp = {
            ...resume,
            personalInfo: {
                fullName: resume.name,
                email: resume.email,
                phone: resume.contact?.phone || '',
                location: resume.contact?.location || '',
                summary: resume.summary || ''
            },
            generatedAt: formattedDate
        };

        const template = Handlebars.compile(templateContent);
        const html = template(resumeWithTimestamp);
        
        logSuccess(`Template compiled successfully`);
        return html;
    } catch (error) {
        logError(`Failed to compile template: ${error.message}`, error);
        throw error;
    }
}

/**
 * Generates PDF from HTML using Puppeteer
 */
async function generatePDF(htmlContent) {
    logInfo(`Starting PDF generation...`);
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // UPDATED: Using process.cwd()
        const outputDir = path.join(process.cwd(), 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const pdfPath = path.join(outputDir, 'resume.pdf');
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true
        });

        logSuccess(`PDF generated successfully at: ${pdfPath}`);
        return pdfPath;
    } catch (error) {
        logError(`Failed to generate PDF: ${error.message}`, error);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
}

async function generateResume() {
    try {
        const resume = loadResume();
        const templateContent = loadTemplate();
        const htmlContent = compileTemplate(templateContent, resume);
        await generatePDF(htmlContent);
    } catch (error) {
        // Error already logged in sub-functions
        if (require.main === module) process.exit(1);
    }
}

if (require.main === module) {
    generateResume();
}

module.exports = { generateResume, loadResume, loadTemplate, compileTemplate, generatePDF };