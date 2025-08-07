Cloud-Based Event Management and Booking System for Middlesex University
This project is a full-stack web application developed to streamline event booking at Middlesex University. It enables students and staff to register, log in, browse events, and make bookings through a responsive, browser-based interface. The system was built using HTML, CSS, JavaScript, Node.js, Express.js, and MongoDB Atlas.

Note: Full AWS deployment (EC2, S3, RDS, Lambda) was originally planned but not completed due to time constraints. However, the system is structured to support future cloud integration.

Features
Secure user registration and login with password hashing

Event creation, listing, and booking functionality

Profile page with user information and event creation form

Real-time booking updates reflected in MongoDB Atlas

Responsive web design compatible with desktops and mobile devices

Interactive event carousel and calendar view (UI implemented)

Backend API tested with Postman

Session handling via localStorage

Technologies Used
Layer	Technologies
Frontend	HTML, CSS, JavaScript
Backend	Node.js, Express.js
Database	MongoDB Atlas (via Mongoose ODM)
Tools	Visual Studio Code, Git, Postman
Security	bcryptjs, dotenv, CORS

How to Run Locally
Clone the repository:

bash
Copy
Edit
git clone https://github.com/your-username/event-booking-system.git
Navigate to the backend directory:

bash
Copy
Edit
cd Backend
Install dependencies:

bash
Copy
Edit
npm install
Start the server:

bash
Copy
Edit
node server.js
Ensure you have a .env file with your MongoDB Atlas connection string defined as MONGO_URI.

Project Structure
pgsql
Copy
Edit
event-booking-system/
├── Backend/
│   ├── server.js
│   ├── models/
│   └── routes/
├── Frontend/
│   ├── index.html
│   ├── Events.html
│   ├── Login.html
│   ├── Register.html
│   ├── Profile.html
│   └── script.js
└── README.md
API Endpoints
Method	Endpoint	Description
POST	/api/register	Register a new user
POST	/api/login	Log in and receive user data
GET	/api/events	Retrieve all event listings
POST	/api/events	Create a new event
POST	/api/book	Book a selected event
DELETE	/api/bookings/:id	Cancel a booking

Limitations
The system is not fully deployed to AWS

Some frontend pages (support, calendar, forgot password) are not connected to backend logic

Role-based access, profile editing, and password reset are not implemented

Session handling is client-side only (via localStorage)

Planned Future Enhancements
Full AWS deployment (EC2, S3, Lambda, RDS)

Role-based access (admin, moderator)

Event capacity management

Email notifications (confirmation, reminders)

Event filtering and search functionality

Interactive calendar with real-time booking updates

Admin dashboard with user and booking analytics

Real-time features using WebSockets

Refined styling and consistent UI patterns

Academic Context
This project was submitted as part of the final year BSc Computer Science degree at Middlesex University. It reflects practical experience in building secure, responsive, and cloud-oriented web applications.
