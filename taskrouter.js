const express = require('express');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const Bull = require('bull');
const Redis = require('ioredis');

const router = express.Router();

const redisClient = new Redis();
const taskQueue = new Bull('task-queue', {
    redis: redisClient,
});

// In-memory store to keep track of the last execution time per user
const lastExecutionTime = {};

const taskLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 min window
    max: 20,
    keyGenerator: (req) => req.body.user_id,
    handler: (req, res) => {
        return res.status(429).json({
            message: "Rate limit exceeded. Please try again later."
        });
    },
    skipFailedRequests: true
});

async function task(user_id) {
    const log = `${user_id}-task completed at-${Date.now()}\n`;
    const logFilePath = path.join(__dirname, 'task-log.txt');
    fs.appendFileSync(logFilePath, log);
    console.log(log);
}

router.get('/', (req, res) => {
    console.log("Endpoint hit successfully");
    res.json({
        message: "Hey there!"
    });
});

router.post('/task', taskLimiter, async (req, res) => {
    const { user_id } = req.body;

    // Calculate delay based on last execution time
    const currentTime = Date.now();
    const lastTime = lastExecutionTime[user_id] || 0;
    const delay = Math.max(0, 1000 - (currentTime - lastTime));

    try {
        await taskQueue.add({ user_id }, {
            jobId: `${user_id}-${Date.now()}`,
            removeOnComplete: true,
            delay: delay // Apply calculated delay
        });

        // Update last execution time
        lastExecutionTime[user_id] = currentTime + delay;

        res.status(200).json({
            message: "Task added to the queue"
        });
    } catch (err) {
        res.status(500).json({
            message: "Couldn't add to the queue"
        });
    }
});

taskQueue.process(async (job) => {
    const { user_id } = job.data;
    await task(user_id);
});

module.exports = router;
