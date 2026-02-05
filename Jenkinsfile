pipeline {
    agent any

    environment {
        // Set to development so Jenkins installs devDependencies (Jest, Babel)
        NODE_ENV = 'development'
        NPM_CONFIG_CACHE = "${WORKSPACE}/.npm-cache"
    }

    options {
        timestamps()
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '30', artifactNumToKeepStr: '10'))
    }

    stages {
        stage('Clean Workspace') {
            steps {
                echo "Cleaning up previous build artifacts..."
                cleanWs()
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
                sh 'git log --oneline -1'
            }
        }

        stage('Install Dependencies') {
            agent {
                docker {
                    image 'node:18-bullseye-slim'
                    reuseNode true
                    args '-u root:root'
                }
            }
            steps {
                echo "Installing dependencies (including devDependencies for testing)..."
                sh 'npm install --loglevel info'
            }
        }

        stage('Validate Resume Data') {
            agent {
                docker {
                    image 'node:18-bullseye-slim'
                    reuseNode true
                    args '-u root:root'
                }
            }
            steps {
                sh 'npm run validate'
            }
        }

        stage('Run Tests') {
            agent {
                docker {
                    image 'node:18-bullseye-slim'
                    reuseNode true
                    args '-u root:root'
                }
            }
            steps {
                echo "═══════════════════════════════════════"
                echo "Stage: Running Jest Tests"
                echo "═══════════════════════════════════════"
                sh 'npm test'
            }
        }

        stage('Build PDF Generator Image') {
            steps {
                echo "Building the production Docker image..."
                sh 'docker build -t resume-pdf .'
            }
        }

        stage('Generate Resume PDF') {
            steps {
                echo "Running container to generate PDF..."
                sh '''
                    mkdir -p output
                    docker run --rm \
                      -u $(id -u):$(id -g) \
                      -v "$PWD:/app" \
                      resume-pdf
                '''
            }
        }

        stage('Archive Artifacts') {
            steps {
                echo "Archiving generated PDF and test coverage..."
                // Check if file exists before archiving
                sh 'test -f output/resume.pdf'
                archiveArtifacts artifacts: 'output/resume.pdf', fingerprint: true
                archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true
            }
        }
    }

    post {
        success {
            echo "Build Successful! You can download your resume from the artifacts section."
        }
        failure {
            echo "Build Failed. Please check the console logs for Jest or Validation errors."
        }
        cleanup {
            echo "Cleaning up Docker images..."
            sh 'docker image prune -f || true'
        }
    }
}