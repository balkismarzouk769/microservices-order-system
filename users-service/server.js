const express = require("express");
const db = require("./database");

const app = express();

app.use(express.json());


// Route test
app.get("/", (req, res) => {
    res.send("Users Service is running");
});


// CREATE USER
app.post("/users", (req, res) => {

    const { name, email } = req.body;

    db.run(
        "INSERT INTO users(name, email) VALUES(?, ?)",
        [name, email],

        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                id: this.lastID,
                name,
                email
            });
        }
    );
});


// GET USERS
app.get("/users", (req, res) => {

    db.all("SELECT * FROM users", [], (err, rows) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);
    });
});

// UPDATE USER
app.put("/users/:id", (req, res) => {

    const { id } = req.params;
    const { name, email } = req.body;

    db.run(
        "UPDATE users SET name = ?, email = ? WHERE id = ?",
        [name, email, id],

        function(err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "User updated successfully"
            });
        }
    );
});
// DELETE USER
app.delete("/users/:id", (req, res) => {

    const { id } = req.params;

    db.run(
        "DELETE FROM users WHERE id = ?",
        [id],

        function(err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "User deleted successfully"
            });
        }
    );
});

// PORT
const PORT = 3001;

// START SERVER
app.listen(PORT, () => {
    console.log(`Users Service running on port ${PORT}`);
});