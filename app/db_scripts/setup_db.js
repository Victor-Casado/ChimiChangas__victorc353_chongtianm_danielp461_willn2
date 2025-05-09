const {create} = require("./db_functions");
const path = require('path');

const sqlite3 = require('sqlite3');
const DB_PATH = path.join(__dirname, '../public/devoroyale.db');
console.log(DB_PATH);

var db = new sqlite3.Database(DB_PATH);

const createTables = async () => {
    try {
        // user table
        await create(
            db,
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            );`
        );

        // leaderboard table
        await create(
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