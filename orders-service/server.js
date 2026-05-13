const express = require("express");
const createDatabase = require("./database");

const app = express();

app.use(express.json());

let db;


// START SERVER
async function startServer() {

    db = await createDatabase();


    // TEST ROUTE
    app.get("/", (req, res) => {
        res.send("Orders Service with RxDB is running");
    });


    // CREATE ORDER
    app.post("/orders", async (req, res) => {

        const order = {
            id: Date.now().toString(),
            userId: req.body.userId,
            products: req.body.products,
            total: req.body.total
        };

        await db.orders.insert(order);

        res.json(order);
    });


    // GET ORDERS
    app.get("/orders", async (req, res) => {

        const orders = await db.orders.find().exec();

        res.json(orders);
    });


    // UPDATE ORDER
    app.put("/orders/:id", async (req, res) => {

        const order = await db.orders
            .findOne(req.params.id)
            .exec();

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        await order.patch({
            userId: req.body.userId,
            products: req.body.products,
            total: req.body.total
        });

        res.json({
            message: "Order updated successfully"
        });
    });


    // DELETE ORDER
    app.delete("/orders/:id", async (req, res) => {

        const order = await db.orders
            .findOne(req.params.id)
            .exec();

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        await order.remove();

        res.json({
            message: "Order deleted successfully"
        });
    });


    // PORT
    const PORT = 3003;


    // START SERVER
    app.listen(PORT, () => {
        console.log(`Orders Service running on port ${PORT}`);
    });
}

startServer();