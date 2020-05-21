let mysql = require("mysql");
class Database {
  constructor() {
    this.dev = {
      connectionLimit: 10,
      host: "localhost",
      user: "root",
      password: "5830",
      database: "projeto_igreja",
    };

    this.prod = {
      connectionLimit: 10,
      host: "127.0.0.1:3306",
      user: "root",
      password: "5830",
      database: "projeto_igreja",
    };

    this.pool = mysql.createPool(this.dev);
  }

  async insert(query, arg = null) {
    let formatedQuery = query;
    if (arg != null) {
      formatedQuery = mysql.format(query, arg);
    }
    return new Promise((result, reject) => {
      this.pool.query(formatedQuery, (err, resultado, field) => {
        if (err) {
          reject(err);
          return;
        }
        result(resultado.affectedRows);
      });
    });
  }

  async delete(query, arg = null) {
    let formatedQuery = query;
    if (arg != null) {
      formatedQuery = mysql.format(query, arg);
    }
    return new Promise((result, reject) => {
      this.pool.query(formatedQuery, (err, resultado, field) => {
        if (err) {
          reject(err);
          return;
        }
        result(resultado.affectedRows);
      });
    });
  }
  async update(query, arg = null) {
    let formatedQuery = query;
    if (arg != null) {
      formatedQuery = mysql.format(query, arg);
    }
    return new Promise((result, reject) => {
      this.pool.query(formatedQuery, (err, resultado, field) => {
        if (err) {
          reject(err);
          return;
        }
        result(resultado.changedrows);
      });
    });
  }
  async select(query, arg = null) {
    let formatedQuery = query;
    if (arg != null) {
      formatedQuery = mysql.format(query, arg);
    }
    return new Promise((result, reject) => {
      this.pool.query(formatedQuery, (err, resultado, field) => {
        if (err) {
          reject(err);
          return;
        }
        result(resultado);
      });
    });
  }
}
module.exports = new Database();
