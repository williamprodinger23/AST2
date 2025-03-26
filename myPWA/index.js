const express = require("express");
const path = require("path");
const multer = require("multer");
const mime = require('mime-types');
const fs = require('fs');
const { cache } = require("ejs");
const sqlite3 = require("sqlite3").verbose();
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/static', express.static("public"));
app.engine('html', require('ejs').renderFile);

//Initialise Database
const dbPath = path.join(__dirname,".database/datasource.db")
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) return console.error("Database Connection Error: ", err.message);
});

//Generate Required Database Tables
const sqlInit = fs.readFileSync(".database/genTable.sql").toString()
db.exec(sqlInit, (err) => {
  if (err) console.error("Table Creation Error: ", err.message);
})

//Load All Database Entries
let cache_data = [];
db.all('SELECT * FROM car_listing', [], (err, rows) => {
  if (err) return console.error(err.message);
  cache_data = rows;
})

//Store Last Inserted ID
var current_id = 0;

//Sell Form Submit
app.post("/submit", (req, res) => {
  const {year, brand, model, body_type, engine_type, engine_size, transmission,} = req.body;
  const sqlInsert = "INSERT INTO car_listing (carYear, carBrand, carModel, bodyType, engineType, engineSize, transmission) VALUES (?, ?, ?, ?, ?, ?, ?)";

  db.run(sqlInsert, [year, brand, model, body_type, engine_type, engine_size, transmission], (err, result) => {
    if (err) {
      console.error("Database Insert Error: ", err);
      return res.status(500).json({message: "Database Error"});
    }
    res.json({message: "Listing Added!"});
  });
  const sqlgetLast = "SELECT * FROM car_listing ORDER BY carID DESC LIMIT 1;";
  db.all(sqlgetLast, [], (err, row) => {
    if (err) return console.error(err.message);
    current_id = row[0].carID;
  });
})

//Image Download
const storage = multer.diskStorage({
  destination: 'public/images/',
  filename: (req, file, cb) => {
      const ext = mime.extension(file.mimetype);
      if (!ext) return cb(new Error('Invalid file type'), null);
      cb(null, `${current_id}.${ext}`);
  }
});
const upload = multer({ storage });

app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');
    res.json({message: 'File uploaded successfully', filePath: `/static/images/${req.file.filename}`});
});


//Search Filters
app.post('/search', async (req,res) => {
  if (req.body.year != "") {year=req.body.year;}
  else {year=null;}
  if (req.body.brand != "") {brand=req.body.brand;}
  else {brand=null;}
  if (req.body.model != "") {model=req.body.model;}
  else {model=null;}
  if (req.body.transmission != "") {transmission=req.body.transmission;}
  else {transmission=null;}

  sqlSearch = `SELECT * FROM car_listing WHERE carYear ${year != null ? `= ${year}` : "IS NOT NULL"} and carBrand ${brand != null ? `= "${brand}"` : "IS NOT NULL"} and carModel ${model != null ? `= "${model}"` : "IS NOT NULL"} and transmission ${transmission != null ? `= "${transmission}"` : "IS NOT NULL"}`

  const seacrhData = await read_database(sqlSearch, []);

  res.render(path.join(__dirname, "public/search_results.html"), {items:seacrhData});
});

//Database Functions
function query_database(sql, params = []){
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function read_database(sql, params){
  const dat = await query_database(sql, params);
  return dat;
}

//Home Page
app.get('/', (req, res) => {
    db.all('SELECT * FROM car_listing', [], (err, rows) => {
      if (err) return console.error(err.message);
      cache_data = rows;
    })

    res.render(path.join(__dirname, "public/index.html"), {items:cache_data});
});

app.listen(8000, () => console.log("Sever is running at http://localhost:8000/"));