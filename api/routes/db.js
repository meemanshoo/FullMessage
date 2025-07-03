const express = require('express');
const router = express.Router();
const mysql = require('mysql');

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Meem@240401',
});


/**
 * @swagger
 * /api/getAllDb:
 *   post:
 *     tags:
 *       - Database
 *     summary: Get all databases
 *     description: http://localhost:4000/api/getAllDb
 *     responses:
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
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: An array containing the names of all databases.
 *       '300':
 *         description: Internal server error
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
 */
router.post('/getAllDb', (req, res) => {
    
    // Start measuring execution time
    const startTime = performance.now();


        // Connect to the database
        pool.getConnection((err,connection) => {
            if (err) {
                return res.status(300).json({
                    status: false,
                    message: 'Connection faied 2',
                    error: err
                });
            }

               // Query the database to retrieve all users
    pool.query('SHOW DATABASES', (error, results) => {
        connection.release();
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
                results : results
            });
        }
    });

        });
 
});

/**
 * @swagger
 * /api/addDb:
 *   put:
 *     tags:
 *       - Database
 *     summary: Add a new database
 *     description: Endpoint to create a new database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dbName:
 *                 type: string
 *                 description: The name of the new database to create.
 *     responses:
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
 *                 results:
 *                   type: object
 *                   description: The result data of the operation.
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
 */

router.put('/addDb', (req, res) => {

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
    pool.query(`CREATE DATABASE ${req.body.dbName}`, (error, results) => {
        pool.end();
        if (error) {
            return res.status(300).json({
                status : false,
                message : 'Internal server error' ,
                error:error
            });
        }
        else{

            // Calculate execution time
            const endTime = performance.now();
            const executionTime = endTime - startTime;

            return res.status(200).json({
                status:true,
                message: `Database '${req.body.dbName}' Added successfully`,
                executionTime : executionTime,
                results : results
            });
        }
    });
    });
   
});

/**
 * @swagger
 * /api/deleteDb:
 *   delete:
 *     tags:
 *       - Database
 *     summary: Delete a database
 *     description: Endpoint to delete an existing database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dbName:
 *                 type: string
 *                 description: The name of the database to delete.
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
 */

router.delete('/deleteDb', (req, res) => {

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

    const dbName = req.body.dbName;

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

           // Check if the database exists
    pool.query(`SHOW DATABASES LIKE '${dbName}'`, (error, results) => {
        if (error) {
            pool.end();
            return res.status(300).json({
                status : false,
                message : 'Internal server error' ,
                error:error
            });
        }

        // If the database exists, delete it
        if (results.length > 0) {
            pool.query(`DROP DATABASE ${dbName}`, (error, results) => {
                pool.end();
                if (error) {
                    return res.status(300).json({
                        status : false,
                        message : 'Error deleting database' ,
                        error:error
                    });
                }
                return res.status(300).json({
                    status : true,
                    message : `Database '${dbName}' deleted successfully`
                });
            });
        } else {
            pool.end();
            return res.status(300).json({
                status : false,
                message : `Database '${dbName}' does not exist`
            });
        }
    });
    });

 
});



module.exports = router;