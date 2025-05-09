const {execute} = require("./db_functions");
const {fetchFirst} = require("./db_functions");
const path = require('path');

const sqlite3 = require('sqlite3');
const DB_PATH = path.join(__dirname, '../public/devoroyale.db');

const addUser = async (username, password) => {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `INSERT INTO users(username, password) VALUES(?, ?)`;
    console.log(DB_PATH);
    try {
        await execute(db, sql, [username, password]);
        console.log("Added user", username);
    } catch (err) {
        console.log(err);
    } finally {
        db.close();
    }
};

const updateUsername = async (old_username, new_username) => {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `UPDATE users SET username = ? WHERE username = ?`;
    try {
        await execute(db, sql, [new_username, old_username]);
        console.log("Updated user", username);
    } catch (err) {
        console.log(err);
    } finally {
        db.close();
    }
};

const fetchUser = async (column, value) => {
    const db = new sqlite3.Database(DB_PATH);
    let sql = `SELECT * FROM users WHERE ${column} = ?`;
    let user = null;

    try {
        user = await fetchFirst(db, sql, [value]);
    } catch (err) {
        console.log(err);
    } finally {
        console.log('yo', user);
        db.close();
    }
    return user;
};

module.exports = {
    addUser,
    updateUsername,
    fetchUser
}