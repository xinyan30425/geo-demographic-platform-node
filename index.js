const { Client } = require('pg');

exports.handler = async (event) => {
    const client = new Client({
        host: process.env.PGHOST,
        port: 5432,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log("Connected to the database");

        const { table, geoid, sex, race, education, ageg } = event.queryStringParameters;

        if (!table) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Table name is required" })
            };
        }

        let query = `SELECT * FROM ${table} WHERE 1=1`;
        let values = [];
        let index = 1;

        if (geoid) {
            query += ` AND GEOID = $${index++}`;
            values.push(geoid);
        }
        if (sex) {
            query += ` AND SEX = $${index++}`;
            values.push(sex);
        }
        if (race) {
            query += ` AND RACE = $${index++}`;
            values.push(race);
        }
        if (education) {
            query += ` AND EDUCATION = $${index++}`;
            values.push(education);
        }
        if (ageg) {
            query += ` AND AGEG = $${index++}`;
            values.push(ageg);
        }

        // Log the query and values
        console.log("Executing query:", query);
        console.log("With values:", values);

        const res = await client.query(query, values);

        await client.end();
        console.log("Query executed successfully, closing connection");

        return {
            statusCode: 200,
            body: JSON.stringify(res.rows)
        };
    } catch (error) {
        console.error("Database query error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error", details: error.message })
        };
    }
};
