const express = require("express");
const path = require("path");
const fs = require('fs');
const app = express();

const sqlite3 = require("sqlite3").verbose();
let db = new sqlite3.Database(path.join(__dirname,".database/datasource.db"), sqlite3.OPEN_READWRITE, (err) => {
  if (err) return console.error(err.message);
});

sql = fs.readFileSync(".database/genTable.sql").toString()
db.all(sql, [])
db.close()

//RELOAD DATABASE
let db2 = new sqlite3.Database(path.join(__dirname,".database/datasource.db"), sqlite3.OPEN_READWRITE, (err) => {
  if (err) return console.error(err.message);
});

var cache_data = [];

sql = 'SELECT * FROM car_listing';
db2.all(sql, [], (err, rows) => {
  if (err) return console.error(err.message);
  rows.forEach((row) => {
    cache_data.push(row)
  })
})

app.use('/static', express.static("public"));
app.engine('html', require('ejs').renderFile);

app.get('/', (req, res) => {
    res.render(path.join(__dirname, "public/index.html"), {items:cache_data});
});

app.listen(8000, () => console.log("Sever is running on Port 8000, visit http://localhost:8000/ or http://127.0.0.1:8000 to access your website"));