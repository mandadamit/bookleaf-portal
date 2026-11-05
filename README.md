# BookLeaf – Author Support & Communication Portal

A full-stack MERN application designed to help authors manage their books and communicate with the support team through a centralized ticket management system.

## Features

### Author Portal
- Author registration and login.
- Role-based authentication.
- Author dashboard with book and ticket statistics.
- Create and manage books.
- Raise support tickets.
- View submitted support tickets.
- View ticket details and conversation history.
- Reply to support messages.

### Admin Portal
- Secure admin login.
- Admin dashboard with ticket statistics.
- View support tickets submitted by authors.
- View ticket priority, category, status and author information.
- Backend support for ticket status updates and assignment.
- Admin replies and internal notes.
- AI-powered ticket classification and reply draft integration.

### Backend
- RESTful APIs using Node.js and Express.js.
- MongoDB database with Mongoose.
- JWT-based authentication.
- Role-based access control.
- Ticket filtering and pagination API support.
- Socket.IO integration for real-time ticket communication.
- Centralized error handling and request validation.

## Technology Stack

**Frontend**
- React.js
- Vite
- React Router
- Axios
- CSS
- Socket.IO Client

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- Socket.IO

**Additional Integration**
- AI service integration for ticket classification and suggested replies.

## Project Structure

```text
bookleaf-portal/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── services/
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md
```

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/bookleaf-portal.git
cd bookleaf-portal
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder and configure the environment variables required by the backend application.

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open the local URL provided by Vite in your browser.

## Authentication & User Roles

The application supports two roles:

- **AUTHOR:** Can manage books, create support tickets and communicate with the support team.
- **ADMIN:** Can manage author support tickets and handle support communication.

## Future Enhancements

- Advanced ticket search and filtering.
- Pagination and improved ticket management.
- Enhanced real-time notifications.
- AI-powered support automation.
- Improved reporting and analytics.

## Author

**Amit Kumar**

GitHub: https://github.com/mandadamit

LinkedIn: https://linkedin.com/in/amit-mandad-317b7115a/
