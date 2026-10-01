pipeline {
    agent any
    
    tools {
        nodejs "nodejs"
    }

    stages {
        stage("install") {
            steps {
                sh 'npm ci'
            }
        }
        stage("validate") {
            steps {
                sh 'npm run check'
            }
        }
        stage("build") {
            steps {
                sh 'npm run build'
            }
        }
    } 
    
    post {
        success {
            echo "SUCCESSFUL"
        }
        failure {
            echo "FAILED"
        }
    }
}
