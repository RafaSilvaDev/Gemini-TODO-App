# IA Task Management

This repository contains a simple task management application built with a React frontend, a Node.js backend, and a MongoDB database.

## Prerequisites

Before running the application, you need to have the following installed on your system:

- **Docker:** [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
- **Docker Compose:** [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)

## Getting Started
1. **Start the application:**
Open your terminal inside the root project folder and type the following command:
```bash
   docker-compose up -d
```
   This command will build the necessary Docker images and start the application containers in detached mode.
2. **Access the application:**
   Open your web browser and navigate to http://localhost:5173.

## Stopping the Application
To stop the running containers, navigate to the project directory and run:
```bash
   docker-compose down
```
## Application Structure
The application consists of the following components:

* **Frontend:** A React application that provides the user interface.
* **Backend:** A Node.js application that handles API requests and interacts with the database.
* **Database:** A MongoDB database that stores the application data.