const express = require("express");
const db = require("./database");

const app = express();

app.use(express.json());


// TEST ROUTE
app.get("/", (req, res) => {
    res.send("Products Service is running");
});


// CREATE PRODUCT
app.post("/products", (req, res) => {

    const { name, price, stock } = req.body;

    db.run(
        "INSERT INTO products(name, price, stock) VALUES(?, ?, ?)",
        [name, price, stock],

        function(err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                id: this.lastID,
                name,
                price,
                stock
            });
        }
    );
});


// GET PRODUCTS
app.get("/products", (req, res) => {

    db.all("SELECT * FROM products", [], (err, rows) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);
    });
});

// UPDATE PRODUCT
app.put("/products/:id", (req, res) => {

    const { id } = req.params;
    const { name, price, stock } = req.body;

    db.run(
        "UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?",
        [name, price, stock, id],

        function(err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Product updated successfully"
            });
        }
    );
});

// DELETE PRODUCT
app.delete("/products/:id", (req, res) => {

    const { id } = req.params;

    db.run(
        "DELETE FROM products WHERE id = ?",
        [id],

        function(err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Product deleted successfully"
            });
        }
    );
});

// PORT
const PORT = 3002;


// START SERVER
app.listen(PORT, () => {
    console.log(`Products Service running on port ${PORT}`);
});