const create = async (db, sql) => {
    return new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
        if (err) reject(err);
        resolve();
        });
    });
};

const execute = async (db, sql, params = []) => {
    if (params && params.length > 0) {
      return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    }
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
};

const fetchAll = async (db, sql, params) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
        });
    });
};
  
const fetchFirst = async (db, sql, params) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
        if (err) reject(err);
        resolve(row);
        });
    });
};

module.exports = {
    create,
    execute,
    fetchAll,
    fetchFirst
};