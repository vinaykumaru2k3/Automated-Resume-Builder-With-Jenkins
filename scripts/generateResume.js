#!/usr/bin/env node

/**
 * Resume PDF Generation Script (React-PDF Version)
 * - Reads resume.json
 * - Renders a PDF using @react-pdf/renderer
 */

const fs = require('fs');
const path = require('path');
const React = require('react');
const { renderToFile, Page, Text, View, Document, StyleSheet } = require('@react-pdf/renderer');

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

// Define Styles (Replaces your old CSS in resume.html)
const styles = StyleSheet.create({
    page: { padding: 30, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
    header: { marginBottom: 20, borderBottom: '2pt solid #2c3e50', paddingBottom: 10 },
    name: { fontSize: 28, fontWeight: 'bold', color: '#2c3e50' },
    contactRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, color: '#7f8c8d', fontSize: 9 },
    
    sectionTitle: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', color: '#2c3e50', marginTop: 15, marginBottom: 5, borderBottom: '0.5pt solid #eee' },
    
    // Experience Styles
    expContainer: { marginBottom: 12 },
    expHeader: { flexDirection: 'row', justifyContent: 'space-between', fontWeight: 'bold' },
    role: { fontWeight: 'bold', fontSize: 11 },
    duration: { color: '#7f8c8d' },
    company: { fontStyle: 'italic', marginBottom: 3 },
    bullet: { marginLeft: 10, marginTop: 2 },
    
    // Skills Grid
    skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
    skillCategory: { width: '50%', marginBottom: 8 },
    categoryLabel: { fontWeight: 'bold', fontSize: 9, color: '#34495e' }
});

const ResumeDocument = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.name}>{data.name}</Text>
                <View style={styles.contactRow}>
                    <Text>{data.email} | {data.contact?.phone}</Text>
                    <Text>{data.contact?.location}</Text>
                </View>
                <View style={[styles.contactRow, { marginTop: 2 }]}>
                    <Text>GitHub: {data.contact?.github}</Text>
                    <Text>LinkedIn: {data.contact?.linkedin}</Text>
                </View>
            </View>

            {/* Summary */}
            <View>
                <Text style={styles.sectionTitle}>Professional Summary</Text>
                <Text style={{ lineHeight: 1.4 }}>{data.professional_summary}</Text>
            </View>

            {/* Experience Section */}
            <View>
                <Text style={styles.sectionTitle}>Experience</Text>
                {data.experience?.map((exp, i) => (
                    <View key={i} style={styles.expContainer}>
                        <View style={styles.expHeader}>
                            <Text style={styles.role}>{exp.role}</Text>
                            <Text style={styles.duration}>{exp.duration}</Text>
                        </View>
                        <Text style={styles.company}>{exp.company} — {exp.location}</Text>
                        {exp.achievements?.map((ach, j) => (
                            <Text key={j} style={styles.bullet}>• {ach}</Text>
                        ))}
                    </View>
                ))}
            </View>

            {/* Skills Section */}
            <View>
                <Text style={styles.sectionTitle}>Technical Skills</Text>
                <View style={styles.skillsGrid}>
                    {data.skills?.map((cat, i) => (
                        <View key={i} style={styles.skillCategory}>
                            <Text style={styles.categoryLabel}>{cat.category}:</Text>
                            <Text>{cat.items.join(', ')}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Education Section */}
            <View>
                <Text style={styles.sectionTitle}>Education</Text>
                {data.education?.map((edu, i) => (
                    <View key={i} style={{ marginBottom: 5 }}>
                        <View style={styles.expHeader}>
                            <Text style={{ fontWeight: 'bold' }}>{edu.school}</Text>
                            <Text style={styles.duration}>{edu.graduation_year}</Text>
                        </View>
                        <Text>{edu.degree} in {edu.field_of_study}</Text>
                    </View>
                ))}
            </View>
        </Page>
    </Document>
);

function logError(message, error = null) {
    console.error(`${colors.red}❌ ERROR: ${message}${colors.reset}`);
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
 * Generates PDF using React-PDF
 */
async function generateResume() {
    try {
        const resumeData = loadResume();
        
        const outputDir = path.join(process.cwd(), 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const pdfPath = path.join(outputDir, 'resume.pdf');
        logInfo(`Starting PDF generation with React-PDF...`);

        // Renders the React component directly to the filesystem
        await renderToFile(
            React.createElement(ResumeDocument, { data: resumeData }),
            pdfPath
        );

        logSuccess(`PDF generated successfully at: ${pdfPath}`);
    } catch (error) {
        logError(`Failed to generate PDF: ${error.message}`, error);
        if (require.main === module) process.exit(1);
    }
}

if (require.main === module) {
    generateResume();
}

module.exports = { generateResume, loadResume, ResumeDocument };