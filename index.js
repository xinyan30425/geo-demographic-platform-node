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

    const corsHeaders = {
        "Access-Control-Allow-Origin": "http://localhost:3000", 
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE",
        "Access-Control-Allow-Headers": "Content-Type,Authorization"
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    try {
        await client.connect();

        const { table, geoid, sex, race, education, ageg } = event.queryStringParameters;

        if (!table) {
            return {
                statusCode: 400,
                headers: corsHeaders,
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

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(res.rows)
        };
    } catch (error) {
        console.error("Database query error:", error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: "Internal Server Error", details: error.message })
        };
    }
};
