const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const db = require("./database");

const { startConsumer } = require("./kafkaConsumer");



// ======================================================
// LOAD PROTO
// ======================================================

const packageDefinition = protoLoader.loadSync(
    "../proto/products.proto"
);

const proto = grpc.loadPackageDefinition(
    packageDefinition
).products;



// ======================================================
// GET PRODUCTS
// ======================================================

function getProducts(call, callback) {

    db.all("SELECT * FROM products", [], (err, rows) => {

        if (err) {

            callback(err);

        } else {

            callback(null, {
                products: rows
            });
        }
    });
}



// ======================================================
// GET PRODUCT BY ID
// ======================================================

function getProductById(call, callback) {

    const productId = call.request.id;

    db.get(
        "SELECT * FROM products WHERE id = ?",
        [productId],

        (err, row) => {

            if (err) {

                callback(err);

            } else {

                callback(null, row);
            }
        }
    );
}



// ======================================================
// CREATE PRODUCT
// ======================================================

function createProduct(call, callback) {

    const { name, price, stock } = call.request;

    db.run(
        "INSERT INTO products(name, price, stock) VALUES(?, ?, ?)",
        [name, price, stock],

        function(err) {

            if (err) {

                callback(err);

            } else {

                callback(null, {
                    id: this.lastID,
                    name,
                    price,
                    stock
                });
            }
        }
    );
}



// ======================================================
// DELETE PRODUCT
// ======================================================

function deleteProduct(call, callback) {

    const productId = call.request.id;

    db.run(
        "DELETE FROM products WHERE id = ?",
        [productId],

        function(err) {

            if (err) {

                callback(err);

            } else {

                callback(null, {
                    message: "Product deleted successfully"
                });
            }
        }
    );
}



// ======================================================
// CHECK PRODUCT EXISTS
// ======================================================

function checkProductExists(call, callback) {

    const productId = call.request.id;

    db.get(
        "SELECT * FROM products WHERE id = ?",
        [productId],

        (err, row) => {

            if (err) {

                callback(err);

            } else {

                callback(null, {
                    exists: !!row
                });
            }
        }
    );
}



// ======================================================
// UPDATE STOCK
// ======================================================

function updateStock(call, callback) {

    const { productId, quantity } = call.request;

    // GET PRODUCT
    db.get(
        "SELECT * FROM products WHERE id = ?",
        [productId],

        (err, product) => {

            if (err) {

                callback(err);
                return;
            }

            // PRODUCT NOT FOUND
            if (!product) {

                callback(null, {
                    message: "Product not found"
                });

                return;
            }

            // CHECK STOCK
            if (product.stock < quantity) {

                callback(null, {
                    message: "Insufficient stock"
                });

                return;
            }

            // NEW STOCK
            const newStock = product.stock - quantity;

            // UPDATE STOCK
            db.run(
                "UPDATE products SET stock = ? WHERE id = ?",
                [newStock, productId],

                function(err) {

                    if (err) {

                        callback(err);

                    } else {

                        callback(null, {
                            message: "Stock updated successfully"
                        });
                    }
                }
            );
        }
    );
}



// ======================================================
// CREATE GRPC SERVER
// ======================================================

const server = new grpc.Server();

server.addService(proto.ProductService.service, {

    GetProducts: getProducts,

    GetProductById: getProductById,

    CreateProduct: createProduct,

    DeleteProduct: deleteProduct,

    CheckProductExists: checkProductExists,

    UpdateStock: updateStock
});



// ======================================================
// START SERVER
// ======================================================

server.bindAsync(
    "0.0.0.0:50052",
    grpc.ServerCredentials.createInsecure(),

    () => {

        console.log("gRPC Products Service running on port 50052");

        startConsumer();

        server.start();
    }
);