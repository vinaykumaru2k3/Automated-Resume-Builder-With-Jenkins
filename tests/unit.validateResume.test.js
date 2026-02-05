/**
 * Unit Tests for validateResume.js
 * * Tests individual validation helper functions with mocked data
 */

const { validateRequiredField, validateArrayNotEmpty } = require('../scripts/validateResume');

describe('validateResume - Unit Tests', () => {
    
    describe('validateRequiredField', () => {
        it('should pass for a valid top-level required field', () => {
            const obj = { name: 'Vinay Kumar U' };
            expect(() => validateRequiredField(obj, 'name', 'Name')).not.toThrow();
        });

        it('should throw an error for a missing required field', () => {
            const obj = {};
            expect(() => validateRequiredField(obj, 'name', 'Name')).toThrow(/Missing required field/);
        });

        it('should throw an error for an empty string field', () => {
            const obj = { name: '' };
            expect(() => validateRequiredField(obj, 'name', 'Name')).toThrow(/Required field is empty/);
        });

        it('should throw an error for a whitespace-only field', () => {
            const obj = { name: '   ' };
            expect(() => validateRequiredField(obj, 'name', 'Name')).toThrow(/Required field is empty/);
        });

        it('should pass for a valid nested field path (e.g., contact.phone)', () => {
            const obj = { contact: { phone: '+1-555-0199' } };
            expect(() => validateRequiredField(obj, 'contact.phone', 'Phone Number')).not.toThrow();
        });

        it('should throw an error for a missing nested field within an existing object', () => {
            const obj = { contact: {} };
            expect(() => validateRequiredField(obj, 'contact.phone', 'Phone Number')).toThrow();
        });

        it('should throw an error when a parent object in a nested path is missing', () => {
            const obj = {}; // missing 'contact' entirely
            expect(() => validateRequiredField(obj, 'contact.phone', 'Phone Number')).toThrow();
        });

        it('should throw an error for null values in required fields', () => {
            const obj = { professional_summary: null };
            expect(() => validateRequiredField(obj, 'professional_summary', 'Summary')).toThrow();
        });
    });

    describe('validateArrayNotEmpty', () => {
        it('should pass for a non-empty array', () => {
            const obj = { skills: ['Docker', 'Kubernetes'] };
            expect(() => validateArrayNotEmpty(obj, 'skills', 'Skills')).not.toThrow();
        });

        it('should throw an error for an empty array', () => {
            const obj = { experience: [] };
            expect(() => validateArrayNotEmpty(obj, 'experience', 'Experience')).toThrow(/must have at least 1 item/);
        });

        it('should throw an error for a missing array field', () => {
            const obj = {};
            expect(() => validateArrayNotEmpty(obj, 'skills', 'Skills')).toThrow(/Missing required array/);
        });

        it('should throw an error if the field is not an array (e.g., a string)', () => {
            const obj = { education: 'Bachelor of Science' };
            expect(() => validateArrayNotEmpty(obj, 'education', 'Education')).toThrow(/Expected array/);
        });

        it('should validate specific minimum items requirement', () => {
            const obj = { items: ['item1'] };
            // Pass with 1 item required
            expect(() => validateArrayNotEmpty(obj, 'items', 'Items', 1)).not.toThrow();
            // Fail with 2 items required
            expect(() => validateArrayNotEmpty(obj, 'items', 'Items', 2)).toThrow(/must have at least 2 item\(s\)/);
        });

        it('should handle nested array paths (e.g., exp.achievements)', () => {
            const obj = { 
                experience: [{ 
                    achievements: ['Reduced build time', 'Automated CI'] 
                }] 
            };
            expect(() => validateArrayNotEmpty(obj.experience[0], 'achievements', 'Achievements')).not.toThrow();
        });
    });
});