const express = require('express');
const fs = require('fs');
const path = require('path');
const Bull = require('bull');
const Redis = require('ioredis');

const router = express.Router();

const redisClient = new Redis();
const taskQueue = new Bull('task-queue', {
    redis: redisClient,
});

const userTaskData = {};

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

router.post('/task', async (req, res) => {
    const { user_id } = req.body;

    try {

        await taskQueue.add({ user_id }, {
            jobId: `${user_id}-${Date.now()}`,
            removeOnComplete: true,
        });

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
    const currentTime = Date.now();

    if (!userTaskData[user_id]) {
        userTaskData[user_id] = {
            lastExecutionTime: 0,
            taskCount: 0,
        };
    }

    const userData = userTaskData[user_id];
    const timeSinceLastTask = currentTime - userData.lastExecutionTime;

    // Check if the user has reached the 10-task limit in a minute (10 because two clusters accepts request at same time so 10 requests essentialy becomes 20)
    if (userData.taskCount >= 10 && timeSinceLastTask < 60000) {
        // console.log(`Rate limit reached for ${user_id}. Re-queuing task with delay : ${60000 - timeSinceLastTask}`);
       
        const uniqueJobId = `${job.id}-${Date.now()}`;

        // Re-add the job to the queue with a delay to defer it
        await taskQueue.add(job.data, {
            jobId: uniqueJobId,
            delay: 60000 - timeSinceLastTask, // Delay until the minute is up
            removeOnComplete: true,
        });
        
        return;
    }

    if (timeSinceLastTask >= 60000) {
        userData.taskCount = 0;
    }

    if (timeSinceLastTask < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastTask));
    }

    userData.taskCount += 1;
    userData.lastExecutionTime = Date.now();
    
    await task(user_id);
});

module.exports = router;
