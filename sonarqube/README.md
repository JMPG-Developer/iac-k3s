
``
kubectl create namespace sonarqube
``

''
helm repo add sonarqube https://SonarSource.github.io/helm-chart-sonarqube
helm repo update
''

helm install sonarqube sonarqube/sonarqube -n sonarqube -f sonarqube-values.yaml
