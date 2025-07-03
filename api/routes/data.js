const express = require('express');
const router = express.Router();
const mysql = require('mysql');

/**
 * @swagger
 * /api/insertDataInTable:
 *   post:
 *     tags:
 *       - Data
 *     summary: Insert data into a table
 *     description: Endpoint to insert data into a specified table in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dbName:
 *                 type: string
 *                 description: The name of the database.
 *               tbName:
 *                 type: string
 *                 description: The name of the table to insert data into.
 *               columns:
 *                 type: object
 *                 description: The data to insert into the table.
 *                 example: {"column1": "value1", "column2": "value2"}
 *     responses:
 *       '200':
 *         description: Data inserted successfully
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
 *       '300':
 *         description: Error response
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

router.post('/insertDataInTable', (req, res) => {

    if (req.body.dbName == undefined) {
        return res.status(300).json({ status: false, message: 'dbName must be provided' });
    }
    else if (typeof req.body.dbName !== 'string') {
        return res.status(300).json({ status: false, message: 'dbName must be string' });
    }

    else if (req.body.tbName == undefined) {
        return res.status(300).json({ status: false, message: 'tbName must be provided' });
    }
    else if (typeof req.body.tbName !== 'string') {
        return res.status(300).json({ status: false, message: 'tbName must be string' });
    }
    else if (req.body.columns == undefined) {
        return res.status(300).json({ status: false, message: 'columns must be provided' });
    }

    const expectedKeys = ["dbName", "tbName", "columns"];
    // Check for extra fields
    const extraFields = Object.keys(req.body).filter(key => !expectedKeys.includes(key));


    if (extraFields.length > 0) {
        return res.status(300).json({
            status: false,
            msg: 'Invalid fields: ' + extraFields.join(', ')
        });
    }


    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'Meem@240401',
        database: req.body.dbName
    });

    // Connect to the database
    pool.getConnection((err) => {
        if (err) {
            pool.end();
            return res.status(300).json({
                status: false,
                message: 'Internal server error',
                error: err
            });
        }


        const query2 = `
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
`;

        const startTime = performance.now();

        // Execute the query
        pool.query(query2, [pool.config.connectionConfig.database, req.body.tbName], (error, results, fields) => {
        
            if (error) {
                return res.status(300).json({
                    status: false,
                    message: 'Internal server error',
                    error: error
                });
            }

            try {
                // Extract column names from the query results
                const columns = results.map(row => ({
                    name: row.COLUMN_NAME,
                    isNullable: row.IS_NULLABLE === 'YES' ? true : false
                }));

                for (let i = 0; i < columns.length; i++) {
                    const columnName = columns[i].name;
                    const isNullable = columns[i].isNullable;

                    if(columnName != "id"){
                        if (!req.body.columns.hasOwnProperty(columnName)) {

                            let message = `${columnName} must be provided in columns map`;
                            
                            if (!isNullable) {
                                message = `${columnName} must be provided in columns map.(send null also if needed)`;
                            }
    
                            return res.status(300).json({ status: false, message: message });
                        }
                    }
                }

                const dataToInsert = req.body.columns;


                // Define the query to insert data into the table
                const query = `INSERT INTO ${req.body.tbName} SET ?`;
                // Execute the query
                pool.query(query, dataToInsert, (error, results, fields) => {
                    pool.end();
                    // Calculate execution time
                    const endTime = performance.now();
                    const executionTime = endTime - startTime;

                    if (error) {
                        return res.status(300).json({
                            status: false,
                            message: 'Internal server error',
                            error: error
                        });
                    }

                    return res.status(200).json({
                        status: true,
                        message: "Data inserted successfully",
                        executionTime: executionTime
                    });
                });


            } catch (e) {
                pool.end();
                return res.status(300).json({ status: false, message: `provided` });
            }

        });
    });

});


/**
 * @swagger
 * /api/getDataInTable:
 *   post:
 *     tags:
 *       - Data
 *     summary: Get data from a table with pagination
 *     description: Endpoint to retrieve data from a specified table in the database with pagination support.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dbName:
 *                 type: string
 *                 description: The name of the database.
 *               tbName:
 *                 type: string
 *                 description: The name of the table to retrieve data from.
 *               pageNo:
 *                 type: number
 *                 description: The page number for pagination (starting from 1).
 *               pageSize:
 *                 type: number
 *                 description: The number of records per page.
 *     responses:
 *       '200':
 *         description: Data retrieved successfully
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
 *                 pageNo:
 *                   type: integer
 *                   description: The page number returned.
 *                 pageSize:
 *                   type: integer
 *                   description: The page size returned.
 *                 executionTime:
 *                   type: number
 *                   format: float
 *                   description: The execution time of the operation in milliseconds.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: An array containing the retrieved data records.
 *       '300':
 *         description: Error response
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

router.post('/getDataInTable', (req, res) => {

    if (req.body.dbName == undefined) {
        return res.status(300).json({ status: false, message: 'dbName must be provided' });
    }
    else if (typeof req.body.dbName !== 'string') {
        return res.status(300).json({ status: false, message: 'dbName must be string' });
    }

    else if (req.body.tbName == undefined) {
        return res.status(300).json({ status: false, message: 'tbName must be provided' });
    }
    else if (typeof req.body.tbName !== 'string') {
        return res.status(300).json({ status: false, message: 'tbName must be string' });
    }
    else if (req.body.pageNo == undefined) {
        return res.status(300).json({ status: false, message: 'pageNo must be provided' });
    }
    else if (typeof req.body.pageNo !== 'number') {
        return res.status(300).json({ status: false, message: 'pageNo must be number' });
    }
    else if (req.body.pageSize == undefined) {
        return res.status(300).json({ status: false, message: 'pageSize must be provided' });
    }
    else if (typeof req.body.pageSize !== 'number') {
        return res.status(300).json({ status: false, message: 'pageSize must be number' });
    }

    if (req.body.pageNo === 0) {
        return res.status(300).json({ status: false, message: 'pageNo must be not equal to 0' });
    }

    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'Meem@240401',
        database: req.body.dbName
    });

    // Start measuring execution time
    const startTime = performance.now();

    // Pagination parameters
    const page = parseInt(req.body.pageNo);
    const pageSize = parseInt(req.body.pageSize);

    // Calculate offset to skip rows based on pagination parameters
    const offset = (page - 1) * pageSize;

    const query2 = `
        SELECT COLUMN_NAME
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
        pool.query(query2, [pool.config.connectionConfig.database, req.body.tbName], (error, results, fields) => {

            if (error) {
                pool.end();
                return res.status(300).json({
                    status: false,
                    message: 'Internal server error',
                    error: error
                });
            }

            try {

                // Extract column names from the query results
                const dbColumnNames = results.map(row => row.COLUMN_NAME);

                // Construct the query with a WHERE clause based on column names provided
                let whereClause = '';
                Object.keys(req.body).forEach(key => {
                    if (dbColumnNames.includes(key)) {
                        // Add column name and value to the WHERE clause
                        whereClause += ` AND ${key} = ${mysql.escape(req.body[key])}`;
                    }
                });

                // Define the main query with the WHERE clause
                const mainQuery = `SELECT * FROM ${req.body.tbName} WHERE 1=1 ${whereClause} ORDER BY id DESC LIMIT ?, ?`;


                // Execute the query
                pool.query(mainQuery, [offset, pageSize], (error, results, fields) => {
                    pool.end();
                    // Calculate execution time
                    const endTime = performance.now();
                    const executionTime = endTime - startTime;

                    if (error) {
                        return res.status(300).json({
                            status: false,
                            message: 'Internal server error',
                            error: error
                        });
                    }
                    return res.status(200).json({
                        status: true,
                        message: "Date get successfully",
                        records: results.length,
                        pageNo: req.body.pageNo,
                        pageSize: req.body.pageSize,
                        executionTime: executionTime,
                        data: results
                    });
                });



            } catch (e) {
                pool.end();
                return res.status(300).json({ status: false, message: e });
            }

        });
    });



});


module.exports = router;