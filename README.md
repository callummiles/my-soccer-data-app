# My Soccer Data App

A modern web application for tracking and analyzing soccer data, built with React and Node.js. The application features real-time data updates, user authentication, and market value tracking for soccer players.

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

## 🛠 Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with necessary environment variables
4. Generate admin password (if needed):
   ```bash
   npm run generate-admin
   ```

## 🏃‍♂️ Running Locally

Development mode:
```bash
# Start the frontend development server
npm run dev

# Start the backend server
npm run start
```

## 🚀 Deployment

### Frontend (Vercel)
The frontend is automatically deployed to Vercel. Any changes pushed to the main branch will trigger a new deployment.

Configuration is managed through `vercel.json` in the root directory.

### Backend (Google Cloud)
The backend is containerized using Docker and hosted on Google Cloud.

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

## 📝 Environment Variables

Required environment variables:
- `JWT_SECRET`: Secret key for JWT token generation
- `CASSANDRA_CONTACT_POINT`: Cassandra database contact point
- `CASSANDRA_LOCAL_DC`: Cassandra local datacenter name
- `CASSANDRA_USERNAME`: Database username
- `CASSANDRA_PASSWORD`: Database password
