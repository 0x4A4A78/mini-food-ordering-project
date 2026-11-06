pipeline {
    agent any
    triggers { pollSCM('H/2 * * * *') }
    stages {
        stage('Checkout') { steps { checkout scm } }
        stage('Build') { steps { bat 'npm run build' } }
        stage('Test') { steps { bat 'npm test' } }
        stage('Deploy') {
            when { expression { env.BRANCH_NAME == 'main' || env.GIT_BRANCH == 'origin/main' || env.GIT_BRANCH == 'main' } }
            steps { bat 'powershell -NoProfile -ExecutionPolicy Bypass -File scripts\\deploy.ps1' }
        }
    }
    post { always { archiveArtifacts artifacts: 'dist/**', allowEmptyArchive: true } }
}
