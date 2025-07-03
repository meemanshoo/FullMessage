const express = require('express');
const router = express.Router();
const mysql = require('mysql');


/**
 * @swagger
 * /api/getAllTables:
 *   post:
 *     tags:
 *       - Tables
 *     summary: Get all tables from a database
 *     description: Endpoint to retrieve all tables from a specified database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dbName:
 *                 type: string
 *                 description: The name of the database to retrieve tables from.
 *     responses:
 *       '300':
 *         description: Bad request or Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the status of the operation.
 *                 message:
 *                   type: string
 *                   description: A message indicating the error.
 *                 error:
 *                   type: object
 *                   description: The error object containing details about the error.
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the status of the operation.
 *                 message:
 *                   type: string
 *                   description: A message indicating the result of the operation.
 *                 records:
 *                   type: integer
 *                   description: The number of records returned.
 *                 executionTime:
 *                   type: number
 *                   format: float
 *                   description: The execution time of the operation in milliseconds.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: An array containing the names of all tables in the database.
 */

router.post('/getAllTables', (req, res) => {

    if (req.body.dbName == undefined){
        return res.status(300).json({   status:false, message: 'dbName must be provided' });
    } 
    else if(typeof req.body.dbName !== 'string'){
        return res.status(300).json({   status:false, message: 'dbName must be string' });
    }

    const  expectedKeys = ["dbName"];
    // Check for extra fields
    const extraFields = Object.keys(req.body).filter(key => !expectedKeys.includes(key));


    if (extraFields.length > 0) {
        return res.status(300).json({
            status:false,
            msg: 'Invalid fields: ' + extraFields.join(', ') 
        });
    }

    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'Meem@240401',
        database: req.body.dbName
    });
    
    // Start measuring execution time
    const startTime = performance.now();

     // Connect to the database
     pool.getConnection((err) => {
        if (err) {
            return res.status(300).json({
                status: false,
                message: 'Connection faied',
                error: err
            });
        }

        // Query the database to retrieve all users
    pool.query('SHOW Tables', (error, results) => {
pool.end();
        // Calculate execution time
        const endTime = performance.now();
        const executionTime = endTime - startTime;

        if (error) {
            return res.status(300).json({
                status : false,
                message : 'Internal server error' ,
                error:error
            });
        }
        else{
            return res.status(200).json({
                status:true,
                message: "Date get successfully",
                records: results.length,
                executionTime : executionTime,
                data:results
            });
        }
    });
    });

    
});

// API endpoint to create a table
router.post('/createTable', (req, res) => {

    if (req.body.dbName == undefined){
        return res.status(300).json({   status:false, message: 'dbName must be provided' });
    } 
    else if(typeof req.body.dbName !== 'string'){
        return res.status(300).json({   status:false, message: 'dbName must be string' });
    }
    else if (req.body.tbName == undefined){
        return res.status(300).json({   status:false, message: 'tbName must be provided' });
    } 
    else if(typeof req.body.tbName !== 'string'){
        return res.status(300).json({   status:false, message: 'tbName must be string' });
    }
    const  expectedKeys = ["dbName","tbName"];
    // Check for extra fields
    const extraFields = Object.keys(req.body).filter(key => !expectedKeys.includes(key));


    if (extraFields.length > 0) {
        return res.status(300).json({
            status:false,
            msg: 'Invalid fields: ' + extraFields.join(', ') 
        });
    }

    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'Meem@240401',
        database: req.body.dbName
    });

    // Define your table creation query here
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${req.body.tbName} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            email VARCHAR(255) NULL
        )
    `;

    // Execute the query
    pool.query(createTableQuery, (error, results, fields) => {
        if (error) {
            return res.status(500).json({ error: 'Internal server error', details: error });
        }
        return res.status(200).json({ message: `Table ${req.body.tbName} created successfully` });
    });
});

/**
 * @swagger
 * /api/getAllColumnsInTable:
 *   post:
 *     tags:
 *       - Tables
 *     summary: Get all columns in a table
 *     description: Endpoint to retrieve all columns from a specified table in a database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dbName:
 *                 type: string
 *                 description: The name of the database containing the table.
 *               tbName:
 *                 type: string
 *                 description: The name of the table to retrieve columns from.
 *     responses:
 *       '300':
 *         description: Bad request or Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the status of the operation.
 *                 message:
 *                   type: string
 *                   description: A message indicating the error.
 *                 error:
 *                   type: object
 *                   description: The error object containing details about the error.
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the status of the operation.
 *                 message:
 *                   type: string
 *                   description: A message indicating the result of the operation.
 *                 records:
 *                   type: integer
 *                   description: The number of records returned.
 *                 executionTime:
 *                   type: number
 *                   format: float
 *                   description: The execution time of the operation in milliseconds.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: The name of the column.
 *                       dataType:
 *                         type: string
 *                         description: The data type of the column.
 *                       isNullable:
 *                         type: boolean
 *                         description: Indicates whether the column allows NULL values.
 *                   description: An array containing information about all columns in the table.
 */

router.post('/getAllColumnsInTable', (req, res) => {

    if (req.body.dbName == undefined){
        return res.status(300).json({   status:false, message: 'dbName must be provided' });
    } 
    else if(typeof req.body.dbName !== 'string'){
        return res.status(300).json({   status:false, message: 'dbName must be string' });
    }

    else if (req.body.tbName == undefined){
        return res.status(300).json({   status:false, message: 'tbName must be provided' });
    } 
    else if(typeof req.body.tbName !== 'string'){
        return res.status(300).json({   status:false, message: 'tbName must be string' });
    }
    const  expectedKeys = ["dbName","tbName"];
    // Check for extra fields
    const extraFields = Object.keys(req.body).filter(key => !expectedKeys.includes(key));


    if (extraFields.length > 0) {
        return res.status(300).json({
            status:false,
            msg: 'Invalid fields: ' + extraFields.join(', ') 
        });
    }

    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'Meem@240401',
        database: req.body.dbName
    });
    
    // Start measuring execution time
    const startTime = performance.now();


    const query = `
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
    `;

     // Connect to the database
     pool.getConnection((err) => {
        if (err) {
            return res.status(300).json({
                status: false,
                message: 'Connection faied',
                error: err
            });

        }

                   // Execute the query
    pool.query(query, [pool.config.connectionConfig.database, req.body.tbName], (error, results, fields) => {
            pool.end();
        // Calculate execution time
        const endTime = performance.now();
        const executionTime = endTime - startTime;

        if (error) {
            return res.status(300).json({
                status : false,
                message : 'Internal server error' ,
                error:error
            });
        }

        // Extract column information from the query results
        const columns = results.map(row => ({
            name: row.COLUMN_NAME,
            dataType: row.DATA_TYPE,
            isNullable: row.IS_NULLABLE === 'YES' ? true : false
        }));

        // Send the column names as JSON response
        return res.status(200).json({
            status:true,
            message: "Date get successfully",
            records: columns.length,
            executionTime : executionTime,
            data:columns
        });
    });
 
    });


});

/**
 * @swagger
 * /api/deleteTable:
 *   delete:
 *     tags:
 *       - Tables
 *     summary: Delete a table
 *     description: Endpoint to delete a specified table from a database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dbName:
 *                 type: string
 *                 description: The name of the database containing the table.
 *               tbName:
 *                 type: string
 *                 description: The name of the table to delete.
 *     responses:
 *       '300':
 *         description: Bad request or Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the status of the operation.
 *                 message:
 *                   type: string
 *                   description: A message indicating the error.
 *                 error:
 *                   type: object
 *                   description: The error object containing details about the error.
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates the status of the operation.
 *                 message:
 *                   type: string
 *                   description: A message indicating the result of the operation.
 *                 executionTime:
 *                   type: number
 *                   format: float
 *                   description: The execution time of the operation in milliseconds.
 */

router.delete('/deleteTable', (req, res) => {

    
    if (req.body.dbName == undefined){
        return res.status(300).json({   status:false, message: 'dbName must be provided' });
    } 
    else if(typeof req.body.dbName !== 'string'){
        return res.status(300).json({   status:false, message: 'dbName must be string' });
    }

    else if (req.body.tbName == undefined){
        return res.status(300).json({   status:false, message: 'tbName must be provided' });
    } 
    else if(typeof req.body.tbName !== 'string'){
        return res.status(300).json({   status:false, message: 'tbName must be string' });
    }
    const  expectedKeys = ["dbName","tbName"];
    // Check for extra fields
    const extraFields = Object.keys(req.body).filter(key => !expectedKeys.includes(key));


    if (extraFields.length > 0) {
        return res.status(300).json({
            status:false,
            msg: 'Invalid fields: ' + extraFields.join(', ') 
        });
    }

   
    const tableName = req.body.tbName;

    
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'Meem@240401',
        database: req.body.dbName
    });
    
    // Start measuring execution time
    const startTime = performance.now();

    
      // Construct the query to drop the table
      const query = `DROP TABLE IF EXISTS ${tableName}`;
    

       // Connect to the database
       pool.getConnection((err) => {
        if (err) {
            return res.status(300).json({
                status: false,
                message: 'Connection faied',
                error: err
            });
        }

         // Execute the query to drop the table
      pool.query(query, (error, result) => {
        pool.end();
        if (error) {
            return res.status(300).json({
                status : false,
                message : 'Internal server error' ,
                error:error
            });
        }
         // Calculate execution time
         const endTime = performance.now();
         const executionTime = endTime - startTime;

         return res.status(200).json({
            status:true,
            message: `Table '${tableName}' from Database '${req.body.dbName}' is deleted successfully.`,
            executionTime : executionTime
        });
      });
    });

     
});


module.exports = router;