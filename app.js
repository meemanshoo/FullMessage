const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const app = express();
const basicAuth = require('express-basic-auth');
const bodyParser = require('body-parser');
const cors = require('cors');

const DB = require('./api/routes/db');
const Table = require('./api/routes/table');
const Data = require('./api/routes/data');
const PortfolioMail = require('./api/routes/portfolio_mail');


// Configure Basic Authentication middleware
const auth = basicAuth({
  users: { 'Meemanshoo': 'hiaY;*m8J06{' }, // Replace with your desired username and password
  challenge: true, // Forces the user to authenticate on every request
  unauthorizedResponse: (req) => {
    return { 
      status: false,
      message: 'Unauthorized'
  };
}
});

// Apply Basic Authentication middleware to all routes
app.use(auth);
// Enable CORS for all routes
app.use(cors());

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use('/api',DB);
app.use('/api',Table);
app.use('/api',Data);
app.use('/api',PortfolioMail);


// Define Swagger options
const swaggerOptions = {
  definition: {
    openapi: '3.0.0', // Specify the version of OpenAPI (Swagger) you are using
    info: {
      title: 'Your API Documentation', // Title of your API
      version: '1.0.0', // Version of your API
      description: 'Documentation for your API',
    },
  },
  // Paths to API docs and your API endpoints
  apis: ['./api/routes/*.js','./api/routes/mysql/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

  // Serve Swagger documentation using Swagger UI
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


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