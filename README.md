# My Soccer Data App

A modern web application for tracking and analyzing soccer data, built with React and Node.js. The application features real-time data updates, user authentication, and market value tracking for soccer matches leveraging the Bet Angel API.

## 🚀 Tech Stack

### Frontend

- React 18
- Vite
- PropTypes for type checking
- Modern React hooks and context for state management

### Backend

- Node.js with Express
- Apache Cassandra for database
- gRPC for efficient data communication
- JWT for authentication
- Node Schedule for automated data updates

## 🚀 Deployment

### Frontend (Vercel)

The frontend is automatically deployed to Vercel. Any changes pushed to the main branch will trigger a new deployment. Otherwise, run `vercel --prod` to build and deploy from the command line.

Configuration is managed through `vercel.json` in the root directory.

### Backend (Google Cloud)

The backend is containerized using Docker and hosted on Google Cloud. Follow these steps to get started:

1. Build the Docker image:

   ```bash
   docker build -t my-soccer-data-app .
   ```

2. Deploy to Google Cloud:

   ```bash
   # Tag the image
   docker tag my-soccer-data-app gcr.io/[PROJECT-ID]/my-soccer-data-app

   # Push to Google Container Registry
   docker push gcr.io/[PROJECT-ID]/my-soccer-data-app
   ```

3. SSH into the Google Cloud instance:

   ```bash
   # SSH into the instance using gcloud command
   gcloud compute ssh --zone "[ZONE]" "[INSTANCE-NAME]" --project "[PROJECT-ID]"
   ```

4. Start the server using Docker Compose:

   ```bash
   # Navigate to the app directory
   cd /path/to/app

   # Pull the latest image
   docker compose pull

   # Start the services in detached mode
   docker compose up -d

   # View logs if needed
   docker compose logs -f
   ```

## 📝 Environment Variables

Required environment variables:

- `JWT_SECRET`: Secret key for JWT token generation

- `ASTRA_DB_ID`: Astra database ID
- `ASTRA_DB_REGION`: Astra database region
- `ASTRA_DB_APP_TOKEN`: Astra database application token

- `BA_MARKETS_ENDPOINT`: BA markets endpoint
- `BA_PRICES_ENDPOINT`: BA prices endpoint
