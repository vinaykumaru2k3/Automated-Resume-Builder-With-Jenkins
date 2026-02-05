pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        NPM_CONFIG_CACHE = "${WORKSPACE}/.npm-cache"
    }

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '30', artifactNumToKeepStr: '10'))
    }

    stages {
        stage('Clean Workspace') {
        steps {
            cleanWs() // This requires the "Workspace Cleanup Plugin"
        }
    }
        stage('Checkout') {
            steps {
                echo "═══════════════════════════════════════"
                echo "Stage: Checkout Code"
                echo "═══════════════════════════════════════"
                checkout scm
                sh 'git log --oneline -1'
            }
        }

        stage('Install Dependencies (cached)') {
            agent {
                docker {
                    image 'node:18-bullseye-slim'
                    reuseNode true
                    // Added --dns to ensure the container can reach the npm registry
                    args '-u root:root --network host --dns 8.8.8.8'
                }
            }
            environment {
                // This is the crucial line for your package-lock setup
                PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true'
            }
            steps {
                sh '''
                    npm config set fetch-retries 5
                    npm ci --prefer-offline --no-audit --loglevel info
                '''
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
            environment {
                PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true'
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
                echo "Stage: Run Tests"
                echo "═══════════════════════════════════════"
                sh 'npm test -- --coverage --passWithNoTests'
            }
        }

        stage('Build PDF Generator Image') {
            steps {
                echo "═══════════════════════════════════════"
                echo "Stage: Build PDF Docker Image"
                echo "═══════════════════════════════════════"
                // Using the local node_modules we just built
                sh 'docker build -t resume-pdf .'
            }
        }

        stage('Generate Resume PDF') {
            steps {
                echo "═══════════════════════════════════════"
                echo "Stage: Generate Resume PDF"
                echo "═══════════════════════════════════════"
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
                echo "═══════════════════════════════════════"
                echo "Stage: Archive Artifacts"
                echo "═══════════════════════════════════════"
                sh '''
                    if [ ! -f output/resume.pdf ]; then
                        echo "ERROR: resume.pdf not found"
                        exit 1
                    fi
                '''
                archiveArtifacts artifacts: 'output/resume.pdf', onlyIfSuccessful: true
                archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true
            }
        }
    }

    post {
        always {
            sh 'echo "Workspace summary:"; du -sh . || true'
        }
        cleanup {
            echo "Cleaning up dangling Docker images..."
            sh 'docker image prune -f || true'
        }
    }
}