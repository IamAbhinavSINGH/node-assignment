const axios = require('axios');

async function run(user_id){
    try{    
        const response = await axios.post('http://localhost:3000/api/v1/task' , {
            "user_id" : user_id
        });
    
        console.log(`response for ${user_id} : ${response.data.message}`);
    }catch(err){
        console.log(`skipped for ${user_id}`);
    }
}

async function test(){
    for(let j = 0 ; j < 25 ; j++){
        await run(1);
    }
}

test();