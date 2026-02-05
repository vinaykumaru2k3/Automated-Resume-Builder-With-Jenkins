/**
 * Integration Tests for validateResume.js
 * * Tests validation against the actual resume.json file
 */

const fs = require('fs');
const path = require('path');
const { validateResume } = require('../scripts/validateResume');

describe('validateResume - Integration Tests', () => {
    let originalLogError;
    let errorMessages = [];
    
    // Define the path once using the current working directory (project root)
    const resumePath = path.join(process.cwd(), 'data', 'resume.json');

    beforeEach(() => {
        errorMessages = [];
        // Mock console.error to capture error messages
        originalLogError = console.error;
        console.error = jest.fn((message) => {
            errorMessages.push(message);
        });
        // Also suppress console.log for cleaner test results
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        console.error = originalLogError;
        jest.restoreAllMocks();
    });

    it('should load resume.json file successfully', () => {
        expect(fs.existsSync(resumePath)).toBe(true);
        
        const fileContent = fs.readFileSync(resumePath, 'utf-8');
        expect(() => JSON.parse(fileContent)).not.toThrow();
    });

    it('should pass validation for actual resume.json', () => {
        expect(() => {
            validateResume();
        }).not.toThrow();
    });

    it('should contain all required top-level fields including professional_summary', () => {
        const fileContent = fs.readFileSync(resumePath, 'utf-8');
        const resume = JSON.parse(fileContent);

        expect(resume).toHaveProperty('name');
        expect(resume).toHaveProperty('email');
        expect(resume).toHaveProperty('professional_summary'); // Updated from 'summary'
        expect(resume).toHaveProperty('experience');
        expect(resume).toHaveProperty('education');
        expect(resume).toHaveProperty('skills');
    });

    it('should have valid nested contact information required for PDF header', () => {
        const fileContent = fs.readFileSync(resumePath, 'utf-8');
        const resume = JSON.parse(fileContent);

        expect(resume.contact).toBeDefined();
        expect(resume.contact).toHaveProperty('phone');
        expect(resume.contact).toHaveProperty('location');
        expect(resume.contact.phone.length).toBeGreaterThan(0);
        expect(resume.contact.location.length).toBeGreaterThan(0);
    });

    it('should have valid experience entries with required fields', () => {
        const fileContent = fs.readFileSync(resumePath, 'utf-8');
        const resume = JSON.parse(fileContent);

        expect(Array.isArray(resume.experience)).toBe(true);
        expect(resume.experience.length).toBeGreaterThan(0);

        resume.experience.forEach((job) => {
            expect(job).toHaveProperty('company');
            expect(job).toHaveProperty('role');
            expect(job).toHaveProperty('achievements');
            expect(Array.isArray(job.achievements)).toBe(true);
        });
    });

    it('should have at least one skill category with items', () => {
        const fileContent = fs.readFileSync(resumePath, 'utf-8');
        const resume = JSON.parse(fileContent);

        expect(Array.isArray(resume.skills)).toBe(true);
        expect(resume.skills.length).toBeGreaterThan(0);
        
        resume.skills.forEach(skillGroup => {
            expect(skillGroup).toHaveProperty('category');
            expect(skillGroup).toHaveProperty('items');
            expect(skillGroup.items.length).toBeGreaterThan(0);
        });
    });

    it('should have valid education entries', () => {
        const fileContent = fs.readFileSync(resumePath, 'utf-8');
        const resume = JSON.parse(fileContent);

        resume.education.forEach((edu) => {
            expect(edu).toHaveProperty('school');
            expect(edu).toHaveProperty('degree');
            expect(typeof edu.graduation_year).toBe('number');
        });
    });
});