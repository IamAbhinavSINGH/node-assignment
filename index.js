const cluster = require('cluster');
const os = require('os');
const express = require('express');
const exp = require('constants');

if(cluster.isMaster){
    const cpuNums = 2 // Two replica sets
    console.log(`Master ${process.pid} is running`);

    for(let i = 0 ; i < cpuNums ; i++){
        cluster.fork();
    }

    cluster.on('exit' , (worker) => {
        console.log(`Worker ${worker.process.pid} died. Starting a new one...`);
        cluster.fork();
    });

}else{
    const app = express();
    app.use(express.json());

    const taskRouter = require('./taskrouter');
    app.use('/api/v1' , taskRouter);

    const PORT = 3000;
    app.listen(PORT , () => {
        console.log(`Worker ${process.pid} started on ${PORT}`);
    });
}