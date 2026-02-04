# Automated Resume Builder Pipeline using Jenkins

A professional DevOps project that demonstrates infrastructure-as-code principles by automating resume generation. This Jenkins pipeline validates structured resume data (JSON), generates a formatted PDF resume from an HTML template, and archives it as a build artifact.

**Perfect for:** DevOps portfolio projects, Jenkins learning, infrastructure-as-code demonstrations, interview preparation.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
  - [Local Setup (npm)](#local-setup-npm)
  - [Docker Setup](#docker-setup)
  - [Jenkins Setup](#jenkins-setup)
- [Usage](#usage)
  - [Local Development](#local-development)
  - [Running in Jenkins](#running-in-jenkins)
- [Pipeline Stages](#pipeline-stages)
- [Testing](#testing)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)

---

## Project Overview

This project treats your resume as **code**, not just a document:

- **Data Layer:** Resume content stored in `data/resume.json` (structured, versionable, testable)
- **Template Layer:** Resume layout in `template/resume.html` (reusable, CSS-driven design)
- **Automation Layer:** Jenkins pipeline validates, generates, and archives PDFs automatically
- **Quality Layer:** Jest tests ensure data integrity and PDF generation success

### Key Features

✅ **Structured Data:** Resume content as JSON for easy updates  
✅ **Template-Driven:** HTML/CSS layout separate from data  
✅ **Automated Validation:** Fail-fast on missing or invalid fields  
✅ **PDF Generation:** Puppeteer converts HTML → PDF with professional rendering  
✅ **Integration Testing:** Verify data validity and PDF output  
✅ **Jenkins Pipeline:** Full CI/CD automation with artifact archival  
✅ **Docker Ready:** Run locally in containers without installing Node.js  
✅ **Clean Git History:** Conventional commits for maintainability  

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Git Repository                         │
│            (data/resume.json + template.html)           │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 Jenkins Pipeline                         │
├─────────────────────────────────────────────────────────┤
│ 1. Checkout       → Clone repo from GitHub              │
│ 2. Install Deps   → npm ci (install locked dependencies)│
│ 3. Validate Data  → Verify resume.json structure        │
│ 4. Run Tests      → Jest unit + integration tests       │
│ 5. Generate PDF   → Puppeteer converts HTML → PDF       │
│ 6. Archive Artifact → Store resume.pdf in Jenkins       │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
         ┌──────────────────────────┐
         │   output/resume.pdf      │
         │  (Git-ignored artifact)  │
         └──────────────────────────┘
```

### Data Flow

1. **Edit** `data/resume.json` with new content
2. **Commit** changes to GitHub
3. **Jenkins detects** the commit (via webhook or polling)
4. **Pipeline runs:**
   - Validates JSON structure (required fields: name, email, experience, education)
   - Runs Jest tests (unit + integration)
   - Compiles Handlebars template with JSON data
   - Uses Puppeteer to convert HTML → PDF
   - Archives `resume.pdf` as a Jenkins artifact
5. **PDF is ready** to download or use

---

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Data** | JSON | Structured resume data (versioned in Git) |
| **Template** | HTML + CSS | Professional resume layout |
| **Data Binding** | Handlebars | Inject JSON data into HTML |
| **PDF Generation** | Puppeteer | Convert HTML → PDF with rendering engine |
| **Testing** | Jest | Unit tests (validation) + Integration tests (PDF output) |
| **Automation** | Jenkins | Pipeline orchestration and artifact archival |
| **Containerization** | Docker | Local development without Node.js installation |
| **Version Control** | Git | Track resume data changes and pipeline commits |

---

## Project Structure

```
automated-resume-builder/
├── data/
│   └── resume.json                 # Resume data (name, email, experience, education, skills)
│
├── template/
│   └── resume.html                 # HTML template with Handlebars placeholders
│
├── scripts/
│   ├── validateResume.js           # Validates resume.json structure and required fields
│   └── generateResume.js           # Reads JSON, compiles template, generates PDF
│
├── tests/
│   ├── unit/
│   │   └── validateResume.test.js  # Unit tests for validation logic
│   └── integration/
│       └── generateResume.test.js  # Integration tests for PDF generation
│
├── output/
│   └── resume.pdf                  # Generated PDF (Git-ignored, Jenkins artifact)
│
├── .gitignore                       # Excludes output/, node_modules/, logs
├── Dockerfile                       # Docker image for consistent environment
├── docker-compose.yml              # Local development with Docker
├── package.json                    # Dependencies and npm scripts
├── Jenkinsfile                     # Jenkins pipeline as code
└── README.md                        # This file
```

---

## Setup Instructions

### Prerequisites

- **Option 1 (Local):** Node.js 14+ and npm 6+
- **Option 2 (Docker):** Docker and Docker Compose
- **For Jenkins:** Jenkins 2.300+ with Pipeline plugin

### Local Setup (npm)

#### 1. Clone the repository

```bash
git clone https://github.com/vinaykumaru2k3/Automated-Resume-Builder-With-Jenkins.git
cd Automated-Resume-Builder-With-Jenkins
```

#### 2. Install dependencies

```bash
npm ci
```

**Why `npm ci`?** Installs exact versions from `package-lock.json` (reproducible builds).

#### 3. Verify setup

```bash
npm run validate      # Validate resume.json
npm run test          # Run all tests with coverage
```

#### 4. Generate resume

```bash
npm run generate      # Create output/resume.pdf
```

Or combine validation + generation:

```bash
npm run dev
```

### Docker Setup

#### 1. Build and run locally

```bash
docker-compose up --build
```

This will:
- Build the Docker image
- Install dependencies
- Run tests
- Generate the PDF resume
- Exit with success/failure status

#### 2. Run individual commands in Docker

```bash
# Validate only
docker-compose run resume-builder npm run validate

# Generate only
docker-compose run resume-builder npm run generate

# Run tests
docker-compose run resume-builder npm test
```

#### 3. Edit resume data (with Docker)

Edit `data/resume.json` on your host machine. The Docker container has volume mounts, so changes are reflected immediately:

```bash
docker-compose up --build  # Re-runs everything
```

### Jenkins Setup

#### 1. Prerequisites

- Jenkins 2.300+ installed and running
- Jenkins plugins required:
  - Pipeline (Declarative Pipeline support)
  - Git plugin
  - Node.js plugin (optional, if using Jenkins agent with Node.js)
  - Docker plugin (optional, if running agents in Docker)

#### 2. Create a new Jenkins Pipeline job

1. **Jenkins Dashboard** → **New Item**
2. **Job name:** `automated-resume-builder`
3. **Type:** Pipeline
4. **Click OK**

#### 3. Configure the pipeline

Under **Pipeline** section:

- **Definition:** Pipeline script from SCM
- **SCM:** Git
- **Repository URL:** `https://github.com/vinaykumaru2k3/Automated-Resume-Builder-With-Jenkins.git`
- **Branch:** `*/master`
- **Script Path:** `Jenkinsfile`

#### 4. Configure build triggers (optional)

- **Poll SCM:** Check every 5 minutes for changes
  - Schedule: `H/5 * * * *`
- **GitHub Webhook:** Auto-trigger on push (requires GitHub plugin)

#### 5. Run the job

- **Build Now** → Jenkins clones the repo and executes the Jenkinsfile
- **Resume PDF** is archived as an artifact in the build

#### 6. Download the generated resume

After a successful build:
1. **Artifacts** section → Click **resume.pdf**
2. PDF downloads to your machine

---

## Usage

### Local Development

#### Modify your resume

Edit `data/resume.json`:

```json
{
  "name": "Your Name",
  "email": "your.email@example.com",
  "contact": { "phone": "...", "location": "..." },
  "experience": [ { "company": "...", "role": "...", "duration": "..." } ],
  "education": [ { "school": "...", "degree": "..." } ],
  "skills": [ { "category": "...", "items": [ "..." ] } ]
}
```

#### Validate the data

```bash
npm run validate
```

**Output:** Shows success or detailed error messages for invalid fields.

#### Generate the resume

```bash
npm run generate
```

**Output:** Creates `output/resume.pdf` (ready to use or submit).

#### Run tests

```bash
# All tests with coverage
npm run test

# Unit tests only (validation logic)
npm run test:unit

# Integration tests only (PDF generation)
npm run test:integration
```

### Running in Jenkins

1. Push changes to `data/resume.json`
2. Jenkins automatically triggers the pipeline (if webhooks are configured)
3. Pipeline runs all stages: Checkout → Install → Validate → Test → Generate → Archive
4. If all stages pass, `resume.pdf` is available as an artifact
5. If any stage fails, Jenkins sends a detailed error report

---

## Pipeline Stages

### Stage 1: Checkout

**What it does:** Clones the repository from GitHub  
**Why it matters:** Ensures Jenkins has the latest resume data and scripts  
**Fails if:** Repository is unreachable or branch doesn't exist

```groovy
stage('Checkout') {
  steps {
    checkout scm
  }
}
```

### Stage 2: Install Dependencies

**What it does:** Runs `npm ci` to install locked dependencies  
**Why it matters:** Reproducible builds (same versions across machines)  
**Fails if:** `package-lock.json` is out of sync or dependencies can't be installed

```groovy
stage('Install Dependencies') {
  steps {
    sh 'npm ci'
  }
}
```

### Stage 3: Validate Resume Data

**What it does:** Runs `scripts/validateResume.js` to check JSON structure  
**Why it matters:** Prevents malformed data from reaching PDF generation  
**Fails if:** Required fields (name, email, experience, education) are missing

```groovy
stage('Validate Resume Data') {
  steps {
    sh 'npm run validate'
  }
}
```

### Stage 4: Run Tests

**What it does:** Executes Jest test suite (unit + integration)  
**Why it matters:** Ensures validation logic works and PDFs generate correctly  
**Fails if:** Any test fails or code coverage falls below threshold

```groovy
stage('Run Tests') {
  steps {
    sh 'npm test'
  }
}
```

### Stage 5: Generate Resume PDF

**What it does:** Runs `scripts/generateResume.js` to create PDF  
**Why it matters:** Produces the final resume artifact  
**Fails if:** HTML template is invalid or Puppeteer encounters rendering errors

```groovy
stage('Generate Resume PDF') {
  steps {
    sh 'npm run generate'
  }
}
```

### Stage 6: Archive Artifact

**What it does:** Saves `output/resume.pdf` as a Jenkins artifact  
**Why it matters:** PDF is available for download/use even if workspace is cleaned  
**Fails if:** `resume.pdf` doesn't exist (earlier stages failed)

```groovy
stage('Archive Artifact') {
  steps {
    archiveArtifacts artifacts: 'output/resume.pdf', allowEmptyArchive: false
  }
}
```

---

## Testing

### Unit Tests

Located in `tests/unit/validateResume.test.js`.

**What they test:**
- Required fields are validated (name, email, experience, education)
- Empty arrays trigger validation errors
- Invalid email formats are rejected
- Missing fields produce meaningful error messages

**Run:**

```bash
npm run test:unit
```

### Integration Tests

Located in `tests/integration/generateResume.test.js`.

**What they test:**
- `resume.json` passes validation
- `resume.html` template exists and is readable
- Handlebars compilation succeeds
- Puppeteer generates a valid PDF file
- Generated PDF has non-zero file size

**Run:**

```bash
npm run test:integration
```

### Running All Tests with Coverage

```bash
npm test
```

**Output:** Shows test results and code coverage report in `coverage/` directory.

---

## Future Enhancements

These features are **documented but not yet implemented**:

### 1. Multiple Resume Templates

- Store multiple layouts in `template/resume-modern.html`, `template/resume-minimal.html`
- Add `template` field in resume.json to select layout
- Jenkins parameter to choose template during build

### 2. Versioned Resume PDFs

- Add timestamps to artifacts: `resume-2024-02-04.pdf`
- Keep archive of all generated PDFs in Jenkins
- Track resume evolution over time

### 3. Dockerized Jenkins Pipeline

- Jenkins running in Docker container
- Docker-in-Docker (DinD) for running Puppeteer in containers
- Simplified Jenkins setup for local development

### 4. Email Notifications

- Send generated resume to configured email addresses
- Notify on validation failures
- Schedule weekly resume sends

### 5. JSON Schema Validation

- Implement `resume.schema.json` with JSON Schema
- Validate against schema before processing
- Better error messages for invalid fields

### 6. Multiple Resumes Support

- Support `resume-v1.json`, `resume-v2.json`, `resume-v3.json`
- Generate all PDFs in a single build
- Organize artifacts by version

### 7. Cloud Storage Integration

- Upload PDFs to AWS S3, Azure Blob Storage, or Google Cloud Storage
- Public CDN URLs for sharing resumes
- Version history in cloud

---

## Contributing

### Development Workflow

1. Clone the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes to `data/resume.json` or template/scripts
4. Test locally: `npm run dev` or `docker-compose up --build`
5. Commit with conventional messages: `feat:`, `fix:`, `docs:`, etc.
6. Push and create a pull request

### Commit Message Convention

```
<type>: <subject>

<body>

<footer>
```

**Types:** `feat`, `fix`, `docs`, `test`, `style`, `refactor`, `chore`

**Example:**

```
feat: add hardhat resume experience

- Added 5 years of hardhat development experience
- Updated skills section with relevant technologies
- Integration tests verify PDF generation success

Closes #12
```

---

## Troubleshooting

### Common Issues

#### 1. "resume.json is invalid" (Validation error)

**Solution:** Verify all required fields are present:

```json
{
  "name": "Required",
  "email": "Required",
  "experience": [{ "company": "...", "role": "...", "duration": "..." }],
  "education": [{ "school": "...", "degree": "..." }],
  "skills": [{ "category": "...", "items": ["..."] }]
}
```

#### 2. "Puppeteer error: Cannot find module" (Docker)

**Solution:** Rebuild the Docker image:

```bash
docker-compose down
docker-compose up --build
```

#### 3. "Jenkins can't find npm" (Jenkins agent)

**Solution:** Ensure Jenkins agent has Node.js installed, or specify:

```groovy
agent {
  docker {
    image 'node:18-alpine'
  }
}
```

#### 4. "PDF is blank or incomplete"

**Solution:** Check `template/resume.html` for syntax errors. Puppeteer logs will show rendering issues.

---

## License

MIT License - Feel free to use this project for learning or as a portfolio piece.

---

## Author

Created as a professional DevOps portfolio project demonstrating:
- Infrastructure as Code (Jenkinsfile)
- CI/CD pipeline design
- Docker containerization
- Test automation (Jest)
- Clean git history and conventional commits
- Professional technical documentation

**Last Updated:** February 4, 2026
