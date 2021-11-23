'use strict';
const mysql = require("mysql");
const { ErrorHandler, logError } = require("../error");

// connect
// console.log({
//   host: process.env.HOST,
//   user: process.env.USER,
//   password: process.env.PASSWORD,
//   database: process.env.DB
// })
const settings = {
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DB
};
const connection = mysql.createConnection(settings);
connection.connect(error => {
  if(error){
    error.message += ' Connection settings: ' + JSON.stringify(settings)
    logError(error)
  }
  // if (error) throw new ErrorHandler(500, 'Unable to connect to database.', {...error});
  else console.log("Successfully connected to the database.");
});
let Query = {};
Query.create = (table, data, result) => {
    connection.query('INSERT INTO ' + table + ' SET ?', data, (err, res) => {
      if(err) return result(err, null)
      result(null, {id: res.insertId, ...data})
    })
}
Query.select = (table, data = null, result) => {
  let query = 'SELECT * FROM ' + table;
  if(data !== null) query += ` where ${data.field} = '${data.value}'`
  // console.log(query)
  connection.query(query, (err, res) => {
    if(err) return result(err, null)
    result(null, res)
  })
};
Query.runQuery = (query, result) => {
  // console.log(query)
  connection.query(query, (err, res) => {
    if(err) return result(err, null)
    result(null, res)
  })
};
module.exports = {
  mysql: connection,
  query: Query
}