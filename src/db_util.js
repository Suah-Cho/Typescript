require('dotenv').config()
const fs = require("fs")
const os = require('os');
const path = require('path');
const csvWriter = require('csv-writer').createObjectCsvWriter;
const echarts = require('echarts');
const { createCanvas } = require('canvas');
// const { Pool } = require('pg');
const yaml = require('yamljs');
// const named = require('named-placeholders')(); // Using named placeholders for parameter mapping


// API_MODE = process.env.API_MODE
DB_USER = process.env.DB_USER
DB_PASSWORD = process.env.DB_PASSWORD
DB_HOST = process.env.DB_HOST
DB_PORT = process.env.DB_PORT
DB_NAME = process.env.DB_NAME

// const pool = new Pool({
//     user: DB_USER,
//     host: DB_HOST,
//     database: DB_NAME,
//     password: process.env.DB_PASSWORD,
//     port: 5432,
//     ssl: {
//         rejectUnauthorized: true, // or false if you're using self-signed certificates
//     },
// });
// pool.query('SELECT * FROM compartments');

// Load YAML file once
const queries = yaml.load('./src/query.yaml');



const initOptions = {
    capSQL: true,
    connect(e) {
        const cp = e.client.connectionParameters;
        console.log('Connected to database:', cp.database);
    }
};

const pgp = require('pg-promise')(initOptions);
const db = pgp( {
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: 5432,
    ssl: true,
    max: 20, // set pool max size to 20
    idleTimeoutMillis: 5000, // close idle clients after 1 second
    connectionTimeoutMillis: 3000, // return an error after 1 second if connection could not be established
    maxUses: 7500, // close (and replace) a connection after it has been used 7500 times (see below for discussion)
} );




// Function to get the query from the object path
const getQueryFromPath = (objectPath) => {
    const keys = objectPath.split('.');
    let result = queries;
    for (const key of keys) {
        result = result[key];
        if (!result) {
            throw new Error(`Invalid query path: ${objectPath}`);
        }
    }
    return result;
};

// Function to execute a query based on YAML path and parameters
const executeYamlQuery = async (objectPath, params) => {
    try {
        // Retrieve query from YAML
        let query = getQueryFromPath(objectPath);

        // Execute query with parameters
        const result = await db.any(query, params);
        console.log('result',  result )
        return result;

    } catch (error) {
        console.error(`Error executing query from path ${objectPath}:`, error);
        throw error;
    }
};


/**
 *
 * @param objectPath
 * @param params
 * @returns {Promise<*|string>}
 */
const query2csv = async(objectPath, params) => {
    const result = await executeYamlQuery(objectPath, params)

    if( !result || result.length <= 0 ) {
        throw new Error("data not found")
    }
    // Generate CSV file from query result using a temporary file
    const tempFile = path.join(os.tmpdir(), `query_result_${Date.now()}.csv`);

    const headers = Object.keys(result[0]).map(key => ({ id: key, title: key }));
    const writer = csvWriter({
        path: tempFile,
        header: headers,
    });

    await writer.writeRecords(result);

    return tempFile

}


// Example usage:
// const params = {
//   start_time: '2023-01-01',
//   end_time: '2023-01-31',
//   comp_id: 1,
//   installed_device_ids: '{1,2,3}',
//   data_type: '{1,2}'
// };
// executeYamlQuery('raw_data.raw_gh_data_item', params)
//   .then(rows => console.log(rows))
//   .catch(err => console.error(err));


module.exports = {
    executeYamlQuery,
    query2csv
};




