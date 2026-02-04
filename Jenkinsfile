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
                }
            }
            environment {
                PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true'
                npm_config_ignore_scripts = 'true'
                NODE_ENV = 'development'
            }
            steps {
                sh '''
                    mkdir -p .npm-cache
                    node --version
                    npm --version
                    npm ci --include=dev --prefer-offline --no-audit
                '''
            }
        }



        stage('Validate Resume Data') {
            agent {
                docker {
                    image 'node:18-bullseye-slim'
                    reuseNode true
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
                sh 'docker build --network=host -t resume-pdf .'
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
                      -v "$PWD/output:/app/output" \
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
                    ls -lh output/resume.pdf
                '''

                archiveArtifacts artifacts: 'output/resume.pdf',
                                 onlyIfSuccessful: true

                archiveArtifacts artifacts: 'coverage/**',
                                 allowEmptyArchive: true
            }
        }
    }

    post {
        always {
            echo "═══════════════════════════════════════"
            echo "Post Build Summary"
            echo "═══════════════════════════════════════"
            sh '''
                echo "Workspace size:"
                du -sh . || true
            '''
        }

        success {
            echo "═══════════════════════════════════════"
            echo "✓ BUILD SUCCESSFUL"
            echo "═══════════════════════════════════════"
            echo "Resume PDF generated and archived."
        }

        failure {
            echo "═══════════════════════════════════════"
            echo "❌ BUILD FAILED"
            echo "═══════════════════════════════════════"
            echo "Possible causes:"
            echo "- Invalid resume.json"
            echo "- Test failures"
            echo "- Puppeteer/Chromium error"
            echo "- Docker daemon not available"
        }

        cleanup {
            echo "Cleaning up dangling Docker images..."
            sh 'docker image prune -f || true'
        }
    }
}
