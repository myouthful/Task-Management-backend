const express= require('express');
const Router= require('./router.js')
const cors = require('cors');


const app = express();

app.use(cors())

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use('/',Router);

app.listen(3000,()=>{
    console.log('server is listening on port 3000');
    
})