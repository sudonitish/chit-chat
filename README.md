# Chit-Chat

A real-time chat application built with Node.js, Express, Socket.IO, and supporting both MongoDB and MySQL databases.

## Features

- Real-time messaging with Socket.IO
- User authentication and session management
- Support for both MongoDB and MySQL databases
- File upload functionality
- Responsive web interface
- Password reset functionality
- Group chat rooms

## Tech Stack

- **Backend**: Node.js, Express.js
- **Real-time Communication**: Socket.IO
- **Databases**: MongoDB (Mongoose), MySQL
- **Authentication**: JWT, bcryptjs
- **Session Management**: express-session
- **File Upload**: Multer
- **Email**: Mailjet
- **Template Engine**: EJS

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chit-chat
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
MYSQL_HOST=your_mysql_host
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=your_mysql_database
JWT_SECRET=your_jwt_secret
MAILJET_API_KEY=your_mailjet_api_key
MAILJET_SECRET_KEY=your_mailjet_secret_key
```

4. Start the application:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
chit-chat/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── methods/         # Database methods (MongoDB & MySQL)
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   └── server.js        # Main server file
├── public/
│   ├── scripts/         # Client-side JavaScript
│   └── styles/          # CSS stylesheets
├── uploads/             # File uploads directory
├── views/               # EJS templates
└── package.json
```

## API Endpoints

### User Routes
- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login
- `POST /api/user/logout` - User logout
- `POST /api/user/forgot-password` - Password reset request
- `POST /api/user/reset-password` - Password reset

### Chat Routes
- `GET /api/chat/` - Get chat rooms
- `POST /api/chat/create` - Create new chat room
- `GET /api/chat/:id/messages` - Get messages for a chat room

## Socket Events

- `connection` - User connects to socket
- `send message` - Send a message to a room
- `receive message` - Receive a message from a room
- `chatRoom` - Join a chat room
- `disconnect` - User disconnects

## Database Support

This application supports both MongoDB and MySQL databases. The database methods are organized in separate folders:

- `methods/mongoMethods/` - MongoDB operations
- `methods/sqlMethods/` - MySQL operations
- `models/mongoModels/` - MongoDB schemas
- `models/sqlModels/` - MySQL table definitions

## Contributing

This project is for educational purposes only. Please refer to the LICENSE file for usage terms.

## License

This project is licensed under the Educational Community License, Version 2.0 (ECL-2.0). See the [LICENSE](LICENSE) file for details.

### Key License Points:
- Free for educational and non-commercial use only
- Redistributions must retain the copyright and license
- No warranty is provided

## Author

sudonitish