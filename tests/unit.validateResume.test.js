/**
 * Unit Tests for validateResume.js
 * 
 * Tests individual validation functions with mocked data
 */

const { validateRequiredField, validateArrayNotEmpty } = require('../scripts/validateResume');

describe('validateResume - Unit Tests', () => {
    describe('validateRequiredField', () => {
        it('should pass for valid required field', () => {
            const obj = { name: 'John Doe' };
            expect(() => validateRequiredField(obj, 'name', 'Name')).not.toThrow();
        });

        it('should throw error for missing required field', () => {
            const obj = {};
            expect(() => validateRequiredField(obj, 'name', 'Name')).toThrow();
        });

        it('should throw error for empty string field', () => {
            const obj = { name: '' };
            expect(() => validateRequiredField(obj, 'name', 'Name')).toThrow();
        });

        it('should throw error for whitespace-only field', () => {
            const obj = { name: '   ' };
            expect(() => validateRequiredField(obj, 'name', 'Name')).toThrow();
        });

        it('should handle nested field paths', () => {
            const obj = { contact: { email: 'test@example.com' } };
            expect(() => validateRequiredField(obj, 'contact.email', 'Email')).not.toThrow();
        });

        it('should throw error for missing nested field', () => {
            const obj = { contact: {} };
            expect(() => validateRequiredField(obj, 'contact.email', 'Email')).toThrow();
        });
    });

    describe('validateArrayNotEmpty', () => {
        it('should pass for non-empty array', () => {
            const obj = { items: ['item1'] };
            expect(() => validateArrayNotEmpty(obj, 'items', 'Items')).not.toThrow();
        });

        it('should throw error for empty array', () => {
            const obj = { items: [] };
            expect(() => validateArrayNotEmpty(obj, 'items', 'Items')).toThrow();
        });

        it('should throw error for missing array', () => {
            const obj = {};
            expect(() => validateArrayNotEmpty(obj, 'items', 'Items')).toThrow();
        });

        it('should throw error for non-array field', () => {
            const obj = { items: 'not an array' };
            expect(() => validateArrayNotEmpty(obj, 'items', 'Items')).toThrow();
        });

        it('should validate minimum items requirement', () => {
            const obj = { items: ['item1'] };
            expect(() => validateArrayNotEmpty(obj, 'items', 'Items', 1)).not.toThrow();
            expect(() => validateArrayNotEmpty(obj, 'items', 'Items', 2)).toThrow();
        });

        it('should handle nested array paths', () => {
            const obj = { data: { skills: ['JavaScript', 'Node.js'] } };
            expect(() => validateArrayNotEmpty(obj, 'data.skills', 'Skills')).not.toThrow();
        });
    });
});
