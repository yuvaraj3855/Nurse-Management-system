# Nurse Management System

## Description
This project is a web application for managing nurses' information. It includes both front end and back end components, utilizing MySQL as the database.

## Prerequisites
- Node.js installed on your machine
- MySQL database server running locally or remotely

## Installation
1. Clone the repository:
2. Navigate to the project directory:
3. Install dependencies for the frontend:
4. Install dependencies for the backend:

## Frontend
To run the frontend of this application, navigate to the client directory:
cd ../client
npm install
npm start
Then, start the development server:
cd ../back-node
npm install
npx nodemon


This will start the backend server. It will listen for requests, handle API endpoints, and interact with the MySQL database.

## MySQL Database Setup
Make sure you have a MySQL database server running. Use the following SQL query to create the Nurses table:
```sql
CREATE TABLE Nurses (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(255) NOT NULL,
  LicenseNumber VARCHAR(20) NOT NULL,
  DOB VARCHAR(20) NOT NULL,
  Age INT NOT NULL
);
