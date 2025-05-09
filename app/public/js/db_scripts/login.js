import {execute} from "./db_functions";
import {fetchFirst} from "./db_functions";

const sqlite3 = require('sqlite3');

const addUser = async (username, password) => {
    const db = new sqlite3.Database("../../devoroyale.db");
    const sql = `INSERT INTO users(username, password) VALUES(?, ?)`;
    try {
        await execute(db, sql, [username, password]);
    } catch (err) {
        console.log(err);
    } finally {
        console.log("Added user");
        db.close();
    }
};

const updateUsername = async (old_username, new_username) => {
    const db = new sqlite3.Database("../../devoroyale.db");
    const sql = `UPDATE users SET username = ? WHERE username = ?`;
    try {
        await execute(db, sql, [new_username, old_username]);
    } catch (err) {
        console.log(err);
    } finally {
        console.log("Updated user");
        db.close();
    }
};

const fetchUser = async (column, value) => {
    const db = new sqlite3.Database("../../devoroyale.db");
    let sql = `SELECT * FROM users WHERE ${column} = ?`;
    let user = null;

    try {
        user = await fetchFirst(db, sql, [value]);
    } catch (err) {
        console.log(err);
    } finally {
        console.log(user);
        db.close();
    }
    return user;
};

const userExists = async (username) => {
    user = fetchUser('username', username);
    return user != undefined && user != null;
}