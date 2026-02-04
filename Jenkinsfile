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
                    // Ensure we can create the .npm-cache and node_modules
                    args '-u root:root'
                }
            }
            environment {
                PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true'
                NODE_ENV = 'development'
            }
            steps {
                sh '''
                    mkdir -p .npm-cache
                    npm ci --prefer-offline --no-audit
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
            steps {
                echo "═══════════════════════════════════════"
                echo "Stage: Validate Resume Data"
                echo "═══════════════════════════════════════"
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