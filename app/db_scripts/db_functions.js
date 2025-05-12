import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const DB_PATH = path.join(__dirname, '../public/devoroyale.db');

export const create = async (db, sql) => {
    return new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
        if (err) reject(err);
        resolve();
        });
    });
};

export const execute = async (db, sql, params = []) => {
    if (params && params.length > 0) {
      return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
};

export const fetchAll = async (db, sql, params) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
        });
    });
};
  
export const fetchFirst = async (db, sql, params) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
        if (err) reject(err);
        resolve(row);
        });
    });
};