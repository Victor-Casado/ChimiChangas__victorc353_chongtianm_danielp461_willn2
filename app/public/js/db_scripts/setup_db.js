const sqlite3 = require('sqlite3');

var db = new sqlite3.Database("../../devoroyale.db");


const execute = async (db, sql) => {
    return new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
        if (err) reject(err);
        resolve();
        });
    });
};

const createTables = async () => {
    try {
        // user table
        await execute(
            db,
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                password TEXT NOT NULL
            );`
        );

        // leaderboard table
        await execute(
            db,
            `CREATE TABLE IF NOT EXISTS leaderboard (
                username TEXT NOT NULL,
                wins INTEGER,
                kills INTEGER
            );`
        );
        console.log("Tables created successfully");
    } catch (error) {
        console.error("Error creating tables:", error);
    } finally {
        db.close();
    }
};

createTables();