const express = require('express');
const bodyParser = require('body-parser');
const app = express();


const cors = require("cors");
app.use(cors());

const display = require('./api/routes/display');


app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());



// ✅ Ping check endpoint
app.get('/ping', (req, res) => {
    res.status(200).json({ status: true, message: "✅ Server is running" });
});

app.use('/api/',display);




    app.use((req,res,next) => {
        res.status(404).json({
            error:"bad request"
        });
    });


    
    app.use((err, req, res, next) => {
        if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
          return res.status(400).json({  status:false, error: 'Invalid JSON payload' });
        }
        next(err);
      });

      
module.exports = app;

