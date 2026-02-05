#!/usr/bin/env node

/**
 * Resume Validation Script
 *
 * Validates the resume.json file against required fields and data structure.
 * Updated for React-PDF transition and professional_summary field.
 * Usage: npm run validate
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

/**
 * Throws a validation error (NO process.exit here)
 */
function logError(message) {
    const error = new Error(message);
    error.isValidationError = true;
    throw error;
}

/**
 * Logs a success message
 */
function logSuccess(message) {
    console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

/**
 * Logs an info message
 */
function logInfo(message) {
    console.log(`${colors.cyan}ℹ ${message}${colors.reset}`);
}

/**
 * Validates that a required field exists and is not empty
 */
function validateRequiredField(obj, fieldPath, description) {
    const keys = fieldPath.split('.');
    let value = obj;

    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            logError(`Missing required field: ${description} (path: ${fieldPath})`);
        }
    }

    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        logError(`Required field is empty: ${description} (path: ${fieldPath})`);
    }

    return value;
}

/**
 * Validates that an array has at least one element
 */
function validateArrayNotEmpty(obj, fieldPath, description, minItems = 1) {
    const keys = fieldPath.split('.');
    let value = obj;

    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            logError(`Missing required array: ${description} (path: ${fieldPath})`);
        }
    }

    if (!Array.isArray(value)) {
        logError(`Expected array but got ${typeof value}: ${description} (path: ${fieldPath})`);
    }

    if (value.length < minItems) {
        logError(
            `Array must have at least ${minItems} item(s): ${description} (path: ${fieldPath}), found ${value.length}`
        );
    }

    return value;
}

/**
 * Main validation function
 */
function validateResume() {
    console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}   Resume Validation (React-PDF)${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

    const resumePath = path.join(process.cwd(), 'data', 'resume.json');
    logInfo(`Loading resume from: ${resumePath}`);

    let resume;
    try {
        resume = JSON.parse(fs.readFileSync(resumePath, 'utf-8'));
        logSuccess('Resume JSON loaded successfully');
    } catch (error) {
        if (error.code === 'ENOENT') {
            logError(`Resume file not found at ${resumePath}`);
        }
        logError(`Invalid resume.json: ${error.message}`);
    }

    console.log();

    logInfo('Validating personal information...');
    validateRequiredField(resume, 'name', 'Full Name');
    validateRequiredField(resume, 'email', 'Email Address');
    validateRequiredField(resume, 'professional_summary', 'Professional Summary');
    
    // Validating Nested Contact Info
    validateRequiredField(resume, 'contact.phone', 'Phone Number');
    validateRequiredField(resume, 'contact.location', 'Location');
    logSuccess('Personal information validated');

    console.log();

    logInfo('Validating professional experience...');
    validateArrayNotEmpty(resume, 'experience', 'Experience Array');
    // Check first experience entry for basic structure
    validateRequiredField(resume.experience[0], 'role', 'First Experience Role');
    validateRequiredField(resume.experience[0], 'company', 'First Experience Company');
    logSuccess(`Professional experience validated (${resume.experience.length} entries)`);

    console.log();

    logInfo('Validating education...');
    validateArrayNotEmpty(resume, 'education', 'Education Array');
    logSuccess(`Education validated (${resume.education.length} entries)`);

    console.log();

    logInfo('Validating skills...');
    validateArrayNotEmpty(resume, 'skills', 'Skills Array');
    logSuccess(`Skills validated (${resume.skills.length} skill categories)`);

    console.log();
    logSuccess('All validation checks passed for PDF generation!');
    return resume;
}

/**
 * CLI entry point ONLY
 */
if (require.main === module) {
    try {
        validateResume();
        process.exit(0);
    } catch (error) {
        console.error(`${colors.red}❌ ERROR: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

module.exports = {
    validateResume,
    validateRequiredField,
    validateArrayNotEmpty
};