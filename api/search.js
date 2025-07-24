/// ==========================================================
// The FINAL search.js - Connects to the Vercel Postgres Database
// ==========================================================

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    try {
        // The '%' are wildcards for SQL. This means "find 'q' anywhere in the text".
        // It makes the search very flexible.
        const searchTerm = `%${q.toLowerCase()}%`;
        
        // This is the super-fast database query.
        // It asks the database to do the hard work of searching.
        const { rows } = await sql`
            SELECT 
                officename AS "Name",
                pincode AS "Pincode",
                districtname AS "District",
                statename AS "State"
            FROM pincodes 
            WHERE 
                LOWER(officename) LIKE ${searchTerm} OR 
                LOWER(districtname) LIKE ${searchTerm}
            LIMIT 100;
        `;

        // We check if the database found any rows
        if (rows.length > 0) {
            // Success! We send the data back in the same format as the old API.
            res.status(200).json([{ Status: 'Success', PostOffice: rows }]);
        } else {
            // No results found in the database.
            res.status(200).json([{ Status: 'Error', Message: 'No results found.' }]);
        }

    } catch (error) {
        console.error('Database Error:', error);
        // If something goes wrong with the database itself, send a server error.
        res.status(500).json({ error: 'Internal Server Error' });
    }
}