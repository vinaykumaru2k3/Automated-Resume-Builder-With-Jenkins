/**
 * Integration Tests for validateResume.js
 * 
 * Tests validation against the actual resume.json file
 */

const fs = require('fs');
const path = require('path');
const { validateResume } = require('../../scripts/validateResume');

describe('validateResume - Integration Tests', () => {
    let originalLogError;
    let errorMessages = [];

    beforeEach(() => {
        errorMessages = [];
        // Mock console.error to capture error messages
        originalLogError = console.error;
        console.error = jest.fn((message) => {
            errorMessages.push(message);
            // Call original to preserve output during testing
            originalLogError(message);
        });
    });

    afterEach(() => {
        console.error = originalLogError;
    });

    it('should load resume.json file successfully', () => {
        const resumePath = path.join(__dirname, '..', '..', 'data', 'resume.json');
        expect(fs.existsSync(resumePath)).toBe(true);
        
        const fileContent = fs.readFileSync(resumePath, 'utf-8');
        expect(() => JSON.parse(fileContent)).not.toThrow();
    });

    it('should pass validation for actual resume.json', () => {
        console.log = jest.fn(); // Suppress console output for cleaner test results
        
        expect(() => {
            validateResume();
        }).not.toThrow();
    });

    it('should have valid JSON structure in resume.json', () => {
        const resumePath = path.join(__dirname, '..', '..', 'data', 'resume.json');
        const fileContent = fs.readFileSync(resumePath, 'utf-8');
        const resume = JSON.parse(fileContent);

        expect(resume).toBeInstanceOf(Object);
        expect(typeof resume).toBe('object');
    });

    it('should contain all required top-level fields', () => {
        const resumePath = path.join(__dirname, '..', '..', 'data', 'resume.json');
        const fileContent = fs.readFileSync(resumePath, 'utf-8');
        const resume = JSON.parse(fileContent);

        // Check for required fields (note: the actual file uses 'name', 'email', 'contact')
        expect(resume).toHaveProperty('name');
        expect(resume).toHaveProperty('email');
        expect(resume).toHaveProperty('experience');
        expect(resume).toHaveProperty('education');
        expect(resume).toHaveProperty('skills');
    });

    it('should have at least one experience entry', () => {
        const resumePath = path.join(__dirname, '..', '..', 'data', 'resume.json');
        const fileContent = fs.readFileSync(resumePath, 'utf-8');
        const resume = JSON.parse(fileContent);

        expect(Array.isArray(resume.experience)).toBe(true);
        expect(resume.experience.length).toBeGreaterThan(0);
    });

    it('should have at least one education entry', () => {
        const resumePath = path.join(__dirname, '..', '..', 'data', 'resume.json');
        const fileContent = fs.readFileSync(resumePath, 'utf-8');
        const resume = JSON.parse(fileContent);

        expect(Array.isArray(resume.education)).toBe(true);
        expect(resume.education.length).toBeGreaterThan(0);
    });

    it('should have at least one skill category', () => {
        const resumePath = path.join(__dirname, '..', '..', 'data', 'resume.json');
        const fileContent = fs.readFileSync(resumePath, 'utf-8');
        const resume = JSON.parse(fileContent);

        expect(Array.isArray(resume.skills)).toBe(true);
        expect(resume.skills.length).toBeGreaterThan(0);
        
        // Verify each skill category has items
        resume.skills.forEach(skillGroup => {
            expect(skillGroup).toHaveProperty('category');
            expect(skillGroup).toHaveProperty('items');
            expect(Array.isArray(skillGroup.items)).toBe(true);
            expect(skillGroup.items.length).toBeGreaterThan(0);
        });
    });

    it('should have valid email format in resume data', () => {
        const resumePath = path.join(__dirname, '..', '..', 'data', 'resume.json');
        const fileContent = fs.readFileSync(resumePath, 'utf-8');
        const resume = JSON.parse(fileContent);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(resume.email).toMatch(emailRegex);
    });

    it('should have non-empty name field', () => {
        const resumePath = path.join(__dirname, '..', '..', 'data', 'resume.json');
        const fileContent = fs.readFileSync(resumePath, 'utf-8');
        const resume = JSON.parse(fileContent);

        expect(resume.name).toBeDefined();
        expect(resume.name.trim().length).toBeGreaterThan(0);
    });

    it('should have contact information', () => {
        const resumePath = path.join(__dirname, '..', '..', 'data', 'resume.json');
        const fileContent = fs.readFileSync(resumePath, 'utf-8');
        const resume = JSON.parse(fileContent);

        expect(resume.contact).toBeDefined();
        expect(typeof resume.contact).toBe('object');
        
        // Contact should have at least some information
        const contactKeys = Object.keys(resume.contact);
        expect(contactKeys.length).toBeGreaterThan(0);
    });

    it('should have valid experience entries with required fields', () => {
        const resumePath = path.join(__dirname, '..', '..', 'data', 'resume.json');
        const fileContent = fs.readFileSync(resumePath, 'utf-8');
        const resume = JSON.parse(fileContent);

        resume.experience.forEach((job, index) => {
            expect(job).toHaveProperty('company', expect.any(String));
            expect(job.company.length).toBeGreaterThan(0);
            
            // Should have either 'role' or 'jobTitle'
            const hasRole = job.role && job.role.length > 0;
            const hasJobTitle = job.jobTitle && job.jobTitle.length > 0;
            expect(hasRole || hasJobTitle).toBe(true);
        });
    });

    it('should have valid education entries with required fields', () => {
        const resumePath = path.join(__dirname, '..', '..', 'data', 'resume.json');
        const fileContent = fs.readFileSync(resumePath, 'utf-8');
        const resume = JSON.parse(fileContent);

        resume.education.forEach((edu, index) => {
            expect(edu).toHaveProperty('degree', expect.any(String));
            expect(edu.degree.length).toBeGreaterThan(0);
            
            // Should have graduation year as number
            const gradYear = edu.graduation_year || edu.graduationYear;
            expect(gradYear).toBeDefined();
            expect(typeof gradYear).toBe('number');
        });
    });
});
