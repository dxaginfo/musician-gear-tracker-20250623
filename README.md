# Musician Gear Tracker

A comprehensive web application for musicians to track, maintain, and protect their valuable musical equipment.

## Project Overview

The Musician Gear Tracker is designed to help musicians, bands, and music organizations manage their equipment inventory with features for maintenance scheduling, insurance documentation, and analytics.

### Key Features

- **Equipment Inventory Management**
  - Add, edit, and delete gear items with detailed information
  - Categorize equipment by type, brand, model
  - Upload photos and documents (receipts, warranties)
  - Track purchase information, current value, and location

- **Maintenance Tracking**
  - Schedule and track regular maintenance tasks
  - Log repair history with costs and service providers
  - Set reminders for upcoming maintenance needs
  - Track consumables (strings, reeds, drum heads)

- **Insurance Management**
  - Store insurance policy details
  - Track insured items and coverage amounts
  - Set policy renewal reminders
  - Generate reports for insurance claims

- **Equipment Analytics**
  - Dashboard with gear statistics and insights
  - Track depreciation and total gear value
  - Monitor maintenance costs over time
  - Usage tracking for instruments and equipment

- **Mobile Responsiveness**
  - Full functionality on mobile devices
  - Barcode/QR code scanning for quick inventory checks
  - Offline capability for inventory management without internet

## Technology Stack

### Frontend
- React.js with TypeScript
- Material-UI
- Redux Toolkit
- Formik with Yup validation
- React Router
- Progressive Web App features

### Backend
- Node.js with Express.js
- RESTful API with OpenAPI specification
- JWT authentication with OAuth 2.0 support
- MongoDB for data storage
- Redis for caching
- AWS S3 for file storage

## Getting Started

### Prerequisites
- Node.js (v18.x or later)
- MongoDB (v6.x or later)
- Redis (v7.x or later)
- AWS account for S3 storage

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dxaginfo/musician-gear-tracker-20250623.git
cd musician-gear-tracker-20250623
```

2. Install dependencies for the backend:
```bash
cd backend
npm install
```

3. Install dependencies for the frontend:
```bash
cd ../frontend
npm install
```

4. Configure environment variables:
   - Create a `.env` file in the backend directory based on `.env.example`
   - Set up MongoDB connection string, AWS credentials, and JWT secret

5. Start the development servers:
```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm start
```

6. Access the application at `http://localhost:3000`

## Project Structure

```
musician-gear-tracker/
├── backend/                # Node.js/Express.js server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   └── package.json
│
├── frontend/               # React.js application
│   ├── public/             # Static files
│   ├── src/
│   │   ├── assets/         # Images, fonts, etc.
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── redux/          # Redux store and slices
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── package.json
│
├── docker/                 # Docker configuration
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
│
└── docker-compose.yml      # Docker Compose configuration
```

## Deployment

The application can be deployed using Docker containers:

```bash
# Build and start containers
docker-compose up -d

# Stop containers
docker-compose down
```

For production deployment, consider using AWS services:
- EC2 for hosting the application
- MongoDB Atlas for database
- S3 for file storage
- CloudFront for content delivery
- Route 53 for domain management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Material-UI](https://mui.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)