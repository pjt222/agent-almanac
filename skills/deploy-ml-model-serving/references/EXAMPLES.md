# Deploy ML Model Serving — Extended Examples

Complete configuration files and code templates.


## Step 1: Deploy with MLflow Models Serving

### Code Block 1

```dockerfile

# Dockerfile.mlflow-serving
FROM python:3.9-slim

# Install MLflow and dependencies
RUN pip install mlflow boto3 scikit-learn

# Set environment variables
ENV MLFLOW_TRACKING_URI=http://mlflow-server:5000
ENV MODEL_URI=models:/customer-churn-classifier/Production

# Expose serving port
EXPOSE 8080

# Serve model
CMD mlflow models serve \
    --model-uri $MODEL_URI \
    --host 0.0.0.0 \
    --port 8080 \
    --no-conda

```

### Code Block 2

```yaml

# docker-compose.mlflow-serving.yml
version: '3.8'

services:
  model-server:
    build:
      context: .
      dockerfile: Dockerfile.mlflow-serving
    ports:
      - "8080:8080"
    environment:
      MLFLOW_TRACKING_URI: http://mlflow-server:5000
      MODEL_URI: models:/customer-churn-classifier/Production
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
    depends_on:
      - mlflow-server

  mlflow-server:
    image: python:3.9-slim
    command: >
      bash -c "pip install mlflow boto3 &&
               mlflow server
               --backend-store-uri sqlite:///mlflow.db
               --default-artifact-root s3://mlflow-artifacts
               --host 0.0.0.0
               --port 5000"
    ports:
      - "5000:5000"

```

### Code Block 3

```python

# test_mlflow_serving.py
import requests
import json

def test_prediction():
    url = "http://localhost:8080/invocations"

    # Prepare input data
    data = {
        "dataframe_records": [
            {
                "tenure": 12,
                "monthly_charges": 70.35,
                "total_charges": 844.20,
                "contract_type": "Month-to-month",
                "payment_method": "Electronic check"
            }
        ]
    }

    # Make prediction request
    response = requests.post(
        url,
        json=data,
        headers={"Content-Type": "application/json"}
    )

    if response.status_code == 200:
        predictions = response.json()
        print(f"✓ Prediction: {predictions}")
        return predictions
    else:
        print(f"✗ Error: {response.status_code} - {response.text}")
        return None

if __name__ == "__main__":
    test_prediction()

```


## Step 2: Deploy with BentoML for Production Scale

### Code Block 4

```python

# bentoml_service.py
import bentoml
from bentoml.io import JSON, NumpyNdarray
import numpy as np
import pandas as pd

# Load model from MLflow
import mlflow
mlflow.set_tracking_uri("http://mlflow-server:5000")
model_uri = "models:/customer-churn-classifier/Production"
model = mlflow.sklearn.load_model(model_uri)

# Save to BentoML model store
bentoml_model = bentoml.sklearn.save_model(
    "customer_churn_classifier",
    model,
    metadata={
        "mlflow_uri": model_uri,
        "framework": "scikit-learn"
    }
)

# Define BentoML service
@bentoml.service(
    resources={"cpu": "2"},
    traffic={"timeout": 10},
)
class ChurnPredictionService:

    def __init__(self):
        self.model = bentoml.sklearn.get("customer_churn_classifier:latest").to_runner()

    @bentoml.api
    def predict(self, input_data: JSON) -> JSON:
        """
        Predict customer churn probability.

        Input format:
        {
            "instances": [
                {"tenure": 12, "monthly_charges": 70.35, ...}
            ]
        }
        """
        # Convert to DataFrame
        df = pd.DataFrame(input_data["instances"])

        # Preprocess (add your preprocessing here)
        X = self._preprocess(df)

        # Predict
        predictions = self.model.predict_proba(X)

        # Return probabilities
        return {
            "predictions": [
                {
                    "churn_probability": float(pred[1]),
                    "no_churn_probability": float(pred[0])
                }
                for pred in predictions
            ]
        }

    @bentoml.api
    def predict_batch(self, input_array: NumpyNdarray) -> NumpyNdarray:
        """
        Batch prediction endpoint for high throughput.
        """
        predictions = self.model.predict_proba(input_array)
        return predictions

    def _preprocess(self, df: pd.DataFrame) -> np.ndarray:
        """
        Preprocess input features.
        """
        # Add your feature engineering here
        # For demo, return as-is
        return df.values

```

### Code Block 5

```yaml

# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: churn-prediction
  labels:
    app: churn-prediction
spec:
  replicas: 3
  selector:
    matchLabels:
      app: churn-prediction
  template:
    metadata:
      labels:
        app: churn-prediction
    spec:
      containers:
      - name: model-server
        image: customer-churn:v1.0
        ports:
        - containerPort: 3000
        resources:
          requests:
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "2000m"
            memory: "2Gi"
        livenessProbe:
          httpGet:
            path: /livez
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /readyz
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: churn-prediction-service
spec:
  type: LoadBalancer
  selector:
    app: churn-prediction
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000

```


## Step 3: Implement Seldon Core for Advanced Features

### Code Block 6

```python

# seldon_wrapper.py
import logging
from typing import Dict, List, Union
import numpy as np
import mlflow

logger = logging.getLogger(__name__)

class ChurnClassifier:
    """
    Seldon Core model wrapper.
    """

    def __init__(self):
        """
        Load model during initialization.
        """
        mlflow.set_tracking_uri("http://mlflow-server:5000")
        self.model = mlflow.sklearn.load_model(
            "models:/customer-churn-classifier/Production"
        )
        logger.info("Model loaded successfully")

    def predict(
        self,
        X: np.ndarray,
        features_names: List[str] = None
    ) -> np.ndarray:
        """
        Predict method for Seldon Core.

        Args:
            X: Input features as numpy array
            features_names: Optional feature names

        Returns:
            Predictions as numpy array
        """
        logger.info(f"Received prediction request with shape {X.shape}")

        # Predict probabilities
        predictions = self.model.predict_proba(X)

        logger.info(f"Returning predictions with shape {predictions.shape}")
        return predictions

    def predict_raw(
        self,
        request: Dict
    ) -> Dict:
        """
        Custom prediction endpoint with preprocessing.
        """
        # Extract data
        instances = request.get("instances", [])

        # Convert to numpy array
        X = np.array(instances)

        # Predict
        predictions = self.predict(X)

        # Format response
        return {
            "predictions": predictions.tolist()
        }

```

### Code Block 7

```yaml

# seldon-deployment.yaml
apiVersion: machinelearning.seldon.io/v1
kind: SeldonDeployment
metadata:
  name: churn-classifier
  namespace: seldon
spec:
  name: churn-classifier
  predictors:
  - name: default
    replicas: 3
    componentSpecs:
    - spec:
        containers:
        - name: classifier
          image: your-registry/churn-classifier:v1.0
          env:
          - name: MLFLOW_TRACKING_URI
            value: "http://mlflow-server:5000"
          resources:
            requests:
              cpu: "500m"
              memory: "512Mi"
            limits:
              cpu: "2"
              memory: "2Gi"
    graph:
      name: classifier
      type: MODEL
      endpoint:
        type: REST
      parameters:
      - name: model_uri
        value: "models:/customer-churn-classifier/Production"
        type: STRING

```

### Code Block 8

```yaml

# seldon-ab-test.yaml
apiVersion: machinelearning.seldon.io/v1
kind: SeldonDeployment
metadata:
  name: churn-classifier-ab
spec:
  name: churn-classifier-ab
  predictors:
  - name: champion
    replicas: 2
    traffic: 90  # 90% of traffic
    componentSpecs:
    - spec:
        containers:
        - name: champion-model
          image: your-registry/churn-classifier:v1.0
    graph:
      name: champion-model
      type: MODEL
      parameters:
      - name: model_uri
        value: "models:/customer-churn-classifier@champion"
        type: STRING

  - name: challenger
    replicas: 1
    traffic: 10  # 10% of traffic
    componentSpecs:
    - spec:
        containers:
        - name: challenger-model
          image: your-registry/churn-classifier:v2.0
    graph:
      name: challenger-model
      type: MODEL
      parameters:
      - name: model_uri
        value: "models:/customer-churn-classifier@challenger"
        type: STRING

```

### Code Block 9

```bash

# Install Seldon Core operator
kubectl create namespace seldon-system
helm install seldon-core seldon-core-operator \
  --repo https://storage.googleapis.com/seldon-charts \
  --namespace seldon-system \
  --set usageMetrics.enabled=true

# Create namespace for models
kubectl create namespace seldon

# Deploy model
kubectl apply -f seldon-deployment.yaml -n seldon

# Check status
kubectl get seldondeployments -n seldon
kubectl get pods -n seldon

# Test prediction
kubectl port-forward -n seldon \
  svc/churn-classifier-default 8080:8000

curl -X POST http://localhost:8080/api/v1.0/predictions \
  -H 'Content-Type: application/json' \
  -d '{"data": {"ndarray": [[12, 70.35, 844.20]]}}'

```


## Step 4: Implement Monitoring and Observability

### Code Block 10

```python

# monitoring.py
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import time
import logging

logger = logging.getLogger(__name__)

# Prometheus metrics
PREDICTION_COUNTER = Counter(
    'model_predictions_total',
    'Total number of predictions',
    ['model_name', 'model_version']
)

PREDICTION_LATENCY = Histogram(
    'model_prediction_latency_seconds',
    'Prediction latency in seconds',
    ['model_name', 'model_version'],
    buckets=[0.01, 0.05, 0.1, 0.5, 1.0, 5.0]
)

PREDICTION_ERRORS = Counter(
    'model_prediction_errors_total',
    'Total number of prediction errors',
    ['model_name', 'model_version', 'error_type']
)

ACTIVE_REQUESTS = Gauge(
    'model_active_requests',
    'Number of active prediction requests',
    ['model_name', 'model_version']
)

MODEL_INPUT_SIZE = Histogram(
    'model_input_size_bytes',
    'Size of prediction input in bytes',
    ['model_name']
)

class MonitoredModel:
    """
    Wrapper for model serving with monitoring.
    """

    def __init__(self, model, model_name, model_version):
        self.model = model
        self.model_name = model_name
        self.model_version = model_version

        # Start Prometheus metrics server
        start_http_server(8000)
        logger.info("Prometheus metrics server started on port 8000")

    def predict(self, X):
        """
        Predict with monitoring.
        """
        # Track active requests
        ACTIVE_REQUESTS.labels(
            model_name=self.model_name,
            model_version=self.model_version
        ).inc()

        # Track input size
        import sys
        input_size = sys.getsizeof(X)
        MODEL_INPUT_SIZE.labels(model_name=self.model_name).observe(input_size)

        start_time = time.time()

        try:
            # Make prediction
            predictions = self.model.predict(X)

            # Track successful prediction
            PREDICTION_COUNTER.labels(
                model_name=self.model_name,
                model_version=self.model_version
            ).inc()

            # Track latency
            latency = time.time() - start_time
            PREDICTION_LATENCY.labels(
                model_name=self.model_name,
                model_version=self.model_version
            ).observe(latency)

            logger.info(f"Prediction completed in {latency:.3f}s")

            return predictions

        except Exception as e:
            # Track error
            PREDICTION_ERRORS.labels(
                model_name=self.model_name,
                model_version=self.model_version,
                error_type=type(e).__name__
            ).inc()

            logger.error(f"Prediction error: {e}")
            raise

        finally:
            # Decrement active requests
            ACTIVE_REQUESTS.labels(
                model_name=self.model_name,
                model_version=self.model_version
            ).dec()

```

### Code Block 11

```yaml

# prometheus-config.yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'model-serving'
    kubernetes_sd_configs:
    - role: pod
      namespaces:
        names:
        - seldon
    relabel_configs:
    - source_labels: [__meta_kubernetes_pod_label_app]
      action: keep
      regex: churn-prediction
    - source_labels: [__meta_kubernetes_pod_name]
      target_label: pod
    - source_labels: [__meta_kubernetes_namespace]
      target_label: namespace

```

### Code Block 12

```json

{
  "dashboard": {
    "title": "ML Model Serving Metrics",
    "panels": [
      {
        "title": "Predictions Per Second",
        "targets": [
          {
            "expr": "rate(model_predictions_total[1m])"
          }
        ]
      },
      {
        "title": "P95 Latency",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(model_prediction_latency_seconds_bucket[5m]))"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(model_prediction_errors_total[1m])"
          }
        ]
      },
      {
        "title": "Active Requests",
        "targets": [
          {
            "expr": "model_active_requests"
          }
        ]
      }
    ]
  }
}

```


## Step 5: Implement Autoscaling

### Code Block 13

```yaml

# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: churn-prediction-hpa
  namespace: seldon
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: churn-prediction
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "100"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
      - type: Pods
        value: 2
        periodSeconds: 30
      selectPolicy: Max

```


## Step 6: Implement Canary Deployment Strategy

### Code Block 14

```yaml

# canary-deployment.yaml
apiVersion: machinelearning.seldon.io/v1
kind: SeldonDeployment
metadata:
  name: churn-classifier-canary
spec:
  name: churn-classifier-canary
  predictors:
  # Stable version
  - name: stable
    replicas: 3
    traffic: 100  # Initially 100%
    componentSpecs:
    - spec:
        containers:
        - name: stable-model
          image: your-registry/churn-classifier:v1.0
    graph:
      name: stable-model
      type: MODEL

  # Canary version (initially 0% traffic)
  - name: canary
    replicas: 1
    traffic: 0
    componentSpecs:
    - spec:
        containers:
        - name: canary-model
          image: your-registry/churn-classifier:v2.0
    graph:
      name: canary-model
      type: MODEL

```

### Code Block 15

```python

# canary_rollout.py
import time
import subprocess
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def update_traffic_split(stable_percent, canary_percent):
    """
    Update traffic split between stable and canary.
    """
    # Update traffic percentages
    cmd = f"""
    kubectl patch seldondeployment churn-classifier-canary -n seldon --type=json -p='[
        {{"op": "replace", "path": "/spec/predictors/0/traffic", "value": {stable_percent}}},
        {{"op": "replace", "path": "/spec/predictors/1/traffic", "value": {canary_percent}}}
    ]'
    """

    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode == 0:
        logger.info(f"✓ Traffic updated: Stable={stable_percent}%, Canary={canary_percent}%")
    else:
        logger.error(f"✗ Traffic update failed: {result.stderr}")
        raise Exception("Traffic update failed")

def check_canary_health():
    """
    Check canary health metrics.
    """
    # Query Prometheus for canary error rate
    # (Simplified - implement actual Prometheus query)
    error_rate = 0.01  # Placeholder
    latency_p95 = 0.15  # Placeholder

    if error_rate > 0.05:
        logger.error(f"Canary error rate too high: {error_rate}")
        return False

    if latency_p95 > 1.0:
        logger.error(f"Canary latency too high: {latency_p95}s")
        return False

    logger.info(f"Canary health OK (error={error_rate}, p95={latency_p95}s)")
    return True

def gradual_rollout():
    """
    Gradually shift traffic to canary.
    """
    stages = [
        (95, 5),   # 5% canary
        (90, 10),  # 10% canary
        (75, 25),  # 25% canary
        (50, 50),  # 50% canary
        (0, 100),  # 100% canary
    ]

    for stable, canary in stages:
        logger.info(f"Rolling out stage: {canary}% to canary")

        # Update traffic
        update_traffic_split(stable, canary)

        # Wait for metrics stabilization
        time.sleep(300)  # 5 minutes

        # Check health
        if not check_canary_health():
            logger.error("Canary unhealthy, rolling back!")
            update_traffic_split(100, 0)
            return False

    logger.info("✓ Canary rollout completed successfully")
    return True

if __name__ == "__main__":
    success = gradual_rollout()
    exit(0 if success else 1)

```
