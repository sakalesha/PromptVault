# PromptVault

A premium prompt management platform for creators and engineers to store, organize, and optimize their AI prompts.

## Architecture

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB (via Mongoose)
- **Authentication:** Custom JWT (JSON Web Token)

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (running locally or a connection string)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secret string for signing tokens
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `PORT`: Server port (default: 5000)

### Running Locally

To start both the backend server and the frontend development server simultaneously:

```bash
npm start
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:5000](http://localhost:5000)
