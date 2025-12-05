#!/bin/bash
set -e  # Exit on error

echo "🚀 Deploying to staging..."

# Submit build using cloudbuild.yaml
gcloud builds submit --config cloudbuild.yaml .

echo "📦 Build complete. Deploying to Cloud Run..."

# Deploy to Cloud Run
gcloud run deploy roomie-frontend \
  --image asia-south1-docker.pkg.dev/$(gcloud config get-value project)/roomie-images/roomie-frontend \
  --region asia-south1

echo "✅ Deployment complete!"x