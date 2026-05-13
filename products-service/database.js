const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./products.db", (err) => {

    if (err) {
        console.log("Database error:", err.message);
    } else {
        console.log("Connected to Products database");
    }
});


// CREATE TABLE
db.run(`
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price REAL,
        stock INTEGER
    )
`);

module.exports = db;