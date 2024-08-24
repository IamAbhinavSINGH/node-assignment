# Node.js Task Queue API

This Node.js application provides an API for task processing with rate limiting and queue management. The API uses `Bull` for task queuing, `express-rate-limit` for rate limiting, and `ioredis` for Redis connectivity.

## Features

- **Rate Limiting:** Limits requests to 20 per minute and 1 per second per user.
- **Task Queueing:** Uses Bull to manage and process tasks with a 1-second delay between tasks for the same user.
- **Logging:** Logs task completion details to a file.

## Getting Started

### Prerequisites

- Node.js (>=14.0.0)
- Redis server (local or remote)

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/iamAbhinavSINGH/node-assignment.git
   cd node-assignment

2. **Install Dependencies**

    ```bash
    npm install

3. **Setup Redis**

Ensure you have a Redis server running. If Redis is not installed, you can follow any Redis installation instructions present online but Reddis server running is must.

## Running the Application

1. **Start the Server**
    
    ```bash
    node index.js    

The server will start, and you will see output indicating that the master and worker processes are running.

## API Endpoints
- Root Endpoint

    GET /api/v1/

    Returns a simple JSON response to verify that the server is running.

- Task Endpoint

    POST /api/v1/task

    Request Body:

    ```json
        {
            "user_id": "123"
        }

    Response:

    200 OK: Task added to the queue.
    429 Too Many Requests: Rate limit exceeded.
    500 Internal Server Error: Unable to add task to the queue.

### Log File

The task completion logs are stored in task-log.txt in the project root directory. Each log entry includes the user ID and timestamp.

### Testing

Test the API by sending multiple POST requests to /api/v1/task with the same user_id and observe the task processing and rate limiting behavior.

Check task-log.txt to verify that tasks are logged correctly with the expected delay.