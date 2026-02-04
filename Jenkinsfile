pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        BUILD_TIMESTAMP = sh(script: 'date +%Y%m%d_%H%M%S', returnStdout: true).trim()
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '30', artifactNumToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "═══════════════════════════════════════"
                    echo "Stage: Checkout Code"
                    echo "═══════════════════════════════════════"
                }
                
                checkout scm
                
                script {
                    echo "Repository checked out successfully"
                    sh 'git log --oneline -1'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    echo ""
                    echo "═══════════════════════════════════════"
                    echo "Stage: Install Dependencies"
                    echo "═══════════════════════════════════════"
                }
                
                sh '''
                    echo "Checking Node.js version..."
                    node --version
                    npm --version
                    
                    echo "Installing npm dependencies..."
                    npm ci --prefer-offline --no-audit
                    
                    echo "Verifying installations..."
                    npm list --depth=0
                '''
            }
        }

        stage('Validate Resume Data') {
            steps {
                script {
                    echo ""
                    echo "═══════════════════════════════════════"
                    echo "Stage: Validate Resume Data"
                    echo "═══════════════════════════════════════"
                }
                
                sh '''
                    echo "Running resume validation..."
                    npm run validate
                    
                    echo "Validation completed successfully!"
                '''
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    echo ""
                    echo "═══════════════════════════════════════"
                    echo "Stage: Run Tests (Unit + Integration)"
                    echo "═══════════════════════════════════════"
                }
                
                sh '''
                    echo "Running all tests with coverage..."
                    npm test -- --coverage --passWithNoTests
                    
                    echo "Tests completed successfully!"
                '''
            }
        }

        stage('Generate Resume PDF') {
            steps {
                script {
                    echo ""
                    echo "═══════════════════════════════════════"
                    echo "Stage: Generate Resume PDF"
                    echo "═══════════════════════════════════════"
                }
                
                sh '''
                    echo "Generating resume PDF..."
                    npm run generate
                    
                    echo "Resume PDF generated successfully!"
                    
                    # Display PDF file info
                    if [ -f output/resume.pdf ]; then
                        echo "PDF file created:"
                        ls -lh output/resume.pdf
                    else
                        echo "ERROR: PDF file was not created!"
                        exit 1
                    fi
                '''
            }
        }

        stage('Archive Artifact') {
            steps {
                script {
                    echo ""
                    echo "═══════════════════════════════════════"
                    echo "Stage: Archive Artifact"
                    echo "═══════════════════════════════════════"
                }
                
                sh '''
                    echo "Archiving resume PDF as build artifact..."
                    
                    if [ -d "output" ]; then
                        echo "Output directory contents:"
                        ls -la output/
                    fi
                '''
                
                // Archive the PDF
                archiveArtifacts artifacts: 'output/resume.pdf', 
                                 allowEmptyArchive: false, 
                                 onlyIfSuccessful: true
                
                // Archive test coverage reports
                archiveArtifacts artifacts: 'coverage/**', 
                                 allowEmptyArchive: true, 
                                 onlyIfSuccessful: true
                
                script {
                    echo "Artifacts archived successfully!"
                }
            }
        }
    }

    post {
        always {
            script {
                echo ""
                echo "═══════════════════════════════════════"
                echo "Post-Build Actions"
                echo "═══════════════════════════════════════"
                
                // Publish test results
                junit testResults: '**/test-results.xml', 
                      allowEmptyResults: true, 
                      skipPublishingChecks: true
                
                // Clean up large artifacts to save space
                sh '''
                    echo "Workspace summary:"
                    du -sh . 2>/dev/null | head -1 || echo "Size info unavailable"
                    
                    echo "Build completed at: $(date)"
                '''
            }
        }

        success {
            script {
                echo ""
                echo "═══════════════════════════════════════"
                echo "✓ BUILD SUCCESSFUL"
                echo "═══════════════════════════════════════"
                echo "Resume PDF has been generated and archived as a build artifact."
                echo "You can download it from the Jenkins build page."
            }
        }

        failure {
            script {
                echo ""
                echo "═══════════════════════════════════════"
                echo "❌ BUILD FAILED"
                echo "═══════════════════════════════════════"
                echo "Please review the logs above for details."
                echo "Common issues:"
                echo "  - Invalid resume.json syntax"
                echo "  - Missing required resume fields"
                echo "  - Puppeteer PDF generation failure"
                echo "  - Test validation failures"
            }
        }

        unstable {
            script {
                echo ""
                echo "═══════════════════════════════════════"
                echo "⚠ BUILD UNSTABLE"
                echo "═══════════════════════════════════════"
                echo "Some tests or checks may have warnings."
            }
        }

        cleanup {
            script {
                echo "Cleaning up workspace..."
                // The 'cleanWs()' step would delete the entire workspace
                // Uncomment if needed for disk space management:
                // cleanWs()
                sh 'echo "Pipeline execution complete"'
            }
        }
    }
}
