const express = require("express");
const path = require("path");
const multer = require("multer");
const mime = require('mime-types');
const fs = require('fs');
const app = express();
app.use(express.json());

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

app.post("/submit", (req, res) => {
  const {
    year,
    brand,
    model,
    body_type,
    engine_type,
    engine_size,
    transmission
  } = req.body;
  const sql = "INSERT INTO car_listing (carYear, carBrand, carModel, bodyType, engineType, engineSize, transmission) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db2.all(sql, [year, brand, model, body_type, engine_type, engine_size, transmission], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json({ message: "Listing added!", id: result.insertId });
  });

})

//Image Download
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'public/images/'); // Specify where to save the file
  },
  filename: (req, file, cb) => {
      // Get the correct file extension based on MIME type
      const ext = mime.extension(file.mimetype);
      
      // If we can't determine the MIME type, reject the upload
      if (!ext) {
          return cb(new Error('Invalid file type'), null);
      }
      
      // Get the original file name (without extension)
      const originalName = path.parse(file.originalname).name;
      
      // Create a custom filename using the original name and a timestamp
      const timestamp = Date.now();
      const filename = `${originalName}_${timestamp}.${ext}`;
      
      console.log("Saving file as:", filename);  // Debugging: Log the filename
      cb(null, filename); // Set the filename with extension
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    res.json({
        message: 'File uploaded successfully',
        filePath: path.join('public/images/', req.file.filename),
    });
});

app.use('/static', express.static("public"));
app.engine('html', require('ejs').renderFile);

app.get('/', (req, res) => {
    res.render(path.join(__dirname, "public/index.html"), {items:cache_data});
});

app.listen(8000, () => console.log("Sever is running on Port 8000, visit http://localhost:8000/ or http://127.0.0.1:8000 to access your website"));