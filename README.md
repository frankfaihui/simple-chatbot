# Simple Chatbot Project

This monorepo contains a simple chatbot application with a frontend and backend. The frontend is built using Vite and React, while the backend is built using FastAPI. The application is designed to be deployed on AWS ECS using AWS CDK.

## Project Structure

- **chatbot-web**: The frontend application built with Vite and React.
- **chatbot-api**: The backend application built with FastAPI.
- **ecs**: AWS CDK configuration for deploying the application to ECS.

## Prerequisites

- Node.js and npm (for the frontend)
- Python 3.12 and pip (for the backend)
- Docker (for containerization)
- AWS CLI and AWS CDK (for deployment)

## Local Development

### Frontend

1. Navigate to the `chatbot-web` directory:

   ```bash
   cd chatbot-web
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`.

### Backend

1. Navigate to the `chatbot-api` directory:

   ```bash
   cd chatbot-api
   ```

2. Install the dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Start the FastAPI server:

   ```bash
   uvicorn app.main:app --reload
   ```

   The backend will be available at `http://localhost:8000`.

## Deployment to AWS ECS

### Prerequisites

- Ensure you have configured your AWS credentials using the AWS CLI.
- Ensure AWS CDK is installed and bootstrapped in your AWS account.

### Deploying with CDK

1. Navigate to the `ecs` directory:

   ```bash
   cd ecs
   ```

2. Install the necessary CDK dependencies:

   ```bash
   npm install
   ```

3. Synthesize the CloudFormation template:

   ```bash
   cdk synth
   ```

4. Deploy the stack to your AWS account:

   ```bash
   cdk deploy
   ```

   This will build the Docker images, push them to ECR, and deploy the application to ECS.

## Additional Information

- **Environment Variables**: Ensure that any necessary environment variables (e.g., `OPENAI_API_KEY`) are set in your deployment environment.
