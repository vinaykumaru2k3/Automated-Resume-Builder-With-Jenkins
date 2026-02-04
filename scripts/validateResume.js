#!/usr/bin/env node

/**
 * Resume Validation Script
 * 
 * Validates the resume.json file against required fields and data structure.
 * Fails fast with detailed error messages if validation fails.
 * 
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
 * Logs an error message with red color and exits with code 1
 */
function logError(message) {
    console.error(`${colors.red}❌ ERROR: ${message}${colors.reset}`);
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

    if (!value || (typeof value === 'string' && value.trim() === '')) {
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
        logError(`Array must have at least ${minItems} item(s): ${description} (path: ${fieldPath}), found ${value.length}`);
    }

    return value;
}

/**
 * Main validation function
 */
function validateResume() {
    console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}   Resume Validation${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

    // Load resume.json
    const resumePath = path.join(__dirname, '..', 'data', 'resume.json');
    logInfo(`Loading resume from: ${resumePath}`);

    let resume;
    try {
        const fileContent = fs.readFileSync(resumePath, 'utf-8');
        resume = JSON.parse(fileContent);
        logSuccess(`Resume JSON loaded successfully`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            logError(`Resume file not found at ${resumePath}`);
        } else if (error instanceof SyntaxError) {
            logError(`Invalid JSON syntax in resume.json: ${error.message}`);
        } else {
            logError(`Failed to read resume file: ${error.message}`);
        }
    }

    console.log();

    // Validate personal info
    logInfo(`Validating personal information...`);
    validateRequiredField(resume, 'name', 'Full Name (name)');
    validateRequiredField(resume, 'email', 'Email Address (email)');
    validateRequiredField(resume, 'contact', 'Contact Information (contact)');
    logSuccess(`Personal information validated`);

    console.log();

    // Validate experience
    logInfo(`Validating professional experience...`);
    validateArrayNotEmpty(resume, 'experience', 'Experience Array (experience)', 1);
    
    resume.experience.forEach((job, index) => {
        const jobNum = index + 1;
        if (!job.company || job.company.trim() === '') {
            logError(`Experience entry ${jobNum}: Missing or empty 'company' field`);
        }
        if (!job.role && !job.jobTitle) {
            logError(`Experience entry ${jobNum}: Missing 'role' or 'jobTitle' field`);
        }
        if (!job.duration && !job.startDate) {
            logError(`Experience entry ${jobNum}: Missing 'duration' or 'startDate' field`);
        }
    });
    logSuccess(`Professional experience validated (${resume.experience.length} entries)`);

    console.log();

    // Validate education
    logInfo(`Validating education...`);
    validateArrayNotEmpty(resume, 'education', 'Education Array (education)', 1);
    
    resume.education.forEach((edu, index) => {
        const eduNum = index + 1;
        if (!edu.school && !edu.institution) {
            logError(`Education entry ${eduNum}: Missing 'school' or 'institution' field`);
        }
        if (!edu.degree) {
            logError(`Education entry ${eduNum}: Missing 'degree' field`);
        }
        if (!edu.graduation_year && !edu.graduationYear) {
            logError(`Education entry ${eduNum}: Missing 'graduation_year' or 'graduationYear' field`);
        }
    });
    logSuccess(`Education validated (${resume.education.length} entries)`);

    console.log();

    // Validate skills
    logInfo(`Validating skills...`);
    validateArrayNotEmpty(resume, 'skills', 'Skills Array (skills)', 1);
    
    resume.skills.forEach((skillGroup, index) => {
        const groupNum = index + 1;
        if (!skillGroup.category || skillGroup.category.trim() === '') {
            logError(`Skills group ${groupNum}: Missing or empty 'category' field`);
        }
        if (!Array.isArray(skillGroup.items) || skillGroup.items.length === 0) {
            logError(`Skills group ${groupNum}: Missing 'items' array or array is empty`);
        }
    });
    logSuccess(`Skills validated (${resume.skills.length} skill categories)`);

    console.log();

    // Summary
    console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}`);
    console.log(`${colors.green}✓ All validation checks passed!${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

    return resume;
}

// Run validation if this script is executed directly
if (require.main === module) {
    try {
        validateResume();
        process.exit(0);
    } catch (error) {
        logError(`Unexpected error during validation: ${error.message}`);
    }
}

// Export for testing
module.exports = { validateResume, validateRequiredField, validateArrayNotEmpty };
