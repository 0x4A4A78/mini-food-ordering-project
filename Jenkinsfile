pipeline {
    agent any
    options { timestamps() }
    stages {
        stage('Checkout') { steps { checkout scm } }
        stage('Build') { steps { bat 'npm run build' } }
        stage('Test') { steps { bat 'npm test' } }
        stage('Deploy') {
            when { branch 'main' }
            steps { bat 'powershell -NoProfile -ExecutionPolicy Bypass -File scripts\\deploy.ps1' }
        }
    }
    post { always { archiveArtifacts artifacts: 'dist/**', allowEmptyArchive: true } }
}
