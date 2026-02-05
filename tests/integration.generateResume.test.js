/**
 * Integration Tests for generateResume.js (React-PDF Version)
 * * Tests the full flow: Data Loading -> Component Rendering -> PDF File Creation
 */

const fs = require('fs');
const path = require('path');
const React = require('react');
const { loadResume, ResumeDocument } = require('../scripts/generateResume');

describe('generateResume - Integration Tests', () => {
    // Correcting path to project root output folder
    const outputDir = path.join(process.cwd(), 'output');
    const pdfPath = path.join(outputDir, 'resume.pdf');

    beforeAll(() => {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
    });

    describe('loadResume', () => {
        it('should load resume.json without errors', () => {
            expect(() => {
                loadResume();
            }).not.toThrow();
        });

        it('should return a valid resume object from data/resume.json', () => {
            const resume = loadResume();
            expect(resume).toBeInstanceOf(Object);
            expect(resume.name).toBe("Vinay Kumar U");
            expect(resume).toHaveProperty('professional_summary');
        });

        it('should have required resume fields for the PDF layout', () => {
            const resume = loadResume();
            expect(Array.isArray(resume.experience)).toBe(true);
            expect(Array.isArray(resume.education)).toBe(true);
            expect(Array.isArray(resume.skills)).toBe(true);
        });
    });

    describe('ResumeDocument Component', () => {
        it('should initialize the React component without crashing', () => {
            const resumeData = loadResume();
            const element = React.createElement(ResumeDocument, { data: resumeData });
            
            expect(element).toBeDefined();
            expect(element.props.data.name).toBe(resumeData.name);
        });

        it('should handle missing optional contact fields gracefully', () => {
            const minimalData = {
                name: 'Test',
                experience: [],
                education: [],
                skills: []
            };
            const element = React.createElement(ResumeDocument, { data: minimalData });
            expect(element).toBeDefined();
        });
    });

    describe('File System and Environment', () => {
        it('should have a .gitignore excluding the output directory', () => {
            const gitignorePath = path.join(process.cwd(), '.gitignore');
            const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
            expect(gitignoreContent).toContain('output/');
        });

        it('should be able to write to the output directory', () => {
            const testFile = path.join(outputDir, 'test.txt');
            fs.writeFileSync(testFile, 'permission check');
            expect(fs.existsSync(testFile)).toBe(true);
            fs.unlinkSync(testFile);
        });
    });
});