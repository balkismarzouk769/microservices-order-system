const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const createDatabase = require("./database");

const {
    connectProducer,
    sendOrderCreatedEvent
} = require("./kafkaProducer");


const packageDefinition = protoLoader.loadSync(
    "../proto/orders.proto"
);

const proto = grpc.loadPackageDefinition(
    packageDefinition
).orders;



const usersPackageDefinition = protoLoader.loadSync(
    "../proto/users.proto"
);

const usersProto = grpc.loadPackageDefinition(
    usersPackageDefinition
).users;




const productsPackageDefinition = protoLoader.loadSync(
    "../proto/products.proto"
);

const productsProto = grpc.loadPackageDefinition(
    productsPackageDefinition
).products;




// CREATE USERS CLIENT

const usersClient = new usersProto.UserService(
    "localhost:50051",
    grpc.credentials.createInsecure()
);



// CREATE PRODUCTS CLIENT


const productsClient = new productsProto.ProductService(
    "localhost:50052",
    grpc.credentials.createInsecure()
);



// DATABASE
let db;

// GET ORDERS


async function getOrders(call, callback) {

    const orders = await db.orders.find().exec();

    callback(null, {
        orders
    });
}



// ======================================================
// GET ORDER BY ID
// ======================================================

async function getOrderById(call, callback) {

    const order = await db.orders
        .findOne(call.request.id)
        .exec();

    callback(null, order);
}



// ======================================================
// GET ORDERS BY USER ID
// ======================================================

async function getOrdersByUserId(call, callback) {

    const orders = await db.orders
        .find({
            selector: {
                userId: call.request.userId
            }
        })
        .exec();

    callback(null, {
        orders
    });
}



// ======================================================
// CREATE ORDER
// ======================================================

async function createOrder(call, callback) {

    try {

        // ==========================================
        // CHECK USER EXISTS
        // ==========================================

        usersClient.CheckUserExists(
            {
                id: call.request.userId
            },

            async (userErr, userResponse) => {

                // USER SERVICE ERROR
                if (userErr) {

                    callback(userErr);

                    return;
                }



                // USER NOT FOUND
                if (!userResponse.exists) {

                    callback({
                        code: grpc.status.NOT_FOUND,
                        message: "User not found"
                    });

                    return;
                }



                // ==========================================
                // CHECK PRODUCTS + STOCK
                // ==========================================

                for (const item of call.request.products) {

                    // ======================================
                    // CHECK PRODUCT EXISTS
                    // ======================================

                    const productExists = await new Promise((resolve) => {

                        productsClient.CheckProductExists(
                            {
                                id: item.productId
                            },

                            (err, response) => {

                                resolve(response?.exists);
                            }
                        );
                    });



                    // PRODUCT NOT FOUND
                    if (!productExists) {

                        callback({
                            code: grpc.status.NOT_FOUND,
                            message: "Product not found"
                        });

                        return;
                    }



                    // ======================================
                    // GET PRODUCT
                    // ======================================

                    const product = await new Promise((resolve) => {

                        productsClient.GetProductById(
                            {
                                id: item.productId
                            },

                            (err, response) => {

                                resolve(response);
                            }
                        );
                    });



                    // ======================================
                    // CHECK STOCK
                    // ======================================

                    if (product.stock < item.quantity) {

                        callback({
                            code: grpc.status.FAILED_PRECONDITION,
                            message: "Insufficient stock"
                        });

                        return;
                    }
                }



                // ==========================================
                // CREATE ORDER
                // ==========================================

                const order = {

                    id: Date.now().toString(),

                    userId: call.request.userId,

                    products: call.request.products,

                    total: call.request.total
                };



                await db.orders.insert(order);



                // ==========================================
                // SEND KAFKA EVENT
                // ==========================================

                await sendOrderCreatedEvent(order);



                // ==========================================
                // REDUCE STOCK
                // ==========================================

                for (const item of order.products) {

                    await new Promise((resolve) => {

                        productsClient.UpdateStock(
                            {
                                productId: item.productId,

                                quantity: item.quantity
                            },

                            () => resolve()
                        );
                    });
                }



                // SUCCESS
                callback(null, order);
            }
        );

    } catch (error) {

        callback(error);
    }
}



// ======================================================
// UPDATE ORDER
// ======================================================

async function updateOrder(call, callback) {

    const order = await db.orders
        .findOne(call.request.id)
        .exec();

    if (!order) {

        callback(null, {
            message: "Order not found"
        });

        return;
    }

    await order.patch({

        userId: call.request.userId,

        products: call.request.products,

        total: call.request.total
    });

    callback(null, {
        message: "Order updated successfully"
    });
}



// ======================================================
// DELETE ORDER
// ======================================================

async function deleteOrder(call, callback) {

    const order = await db.orders
        .findOne(call.request.id)
        .exec();

    if (!order) {

        callback(null, {
            message: "Order not found"
        });

        return;
    }

    await order.remove();

    callback(null, {
        message: "Order deleted successfully"
    });
}



// ======================================================
// CHECK ORDER EXISTS
// ======================================================

async function checkOrderExists(call, callback) {

    const order = await db.orders
        .findOne(call.request.id)
        .exec();

    callback(null, {
        exists: !!order
    });
}



// ======================================================
// START SERVER
// ======================================================

async function startServer() {

    db = await createDatabase();

    await connectProducer();

    const server = new grpc.Server();

    server.addService(proto.OrderService.service, {

        GetOrders: getOrders,

        GetOrderById: getOrderById,

        GetOrdersByUserId: getOrdersByUserId,

        CreateOrder: createOrder,

        UpdateOrder: updateOrder,

        DeleteOrder: deleteOrder,

        CheckOrderExists: checkOrderExists
    });

    server.bindAsync(
        "0.0.0.0:50053",
        grpc.ServerCredentials.createInsecure(),

        () => {

            console.log(
                "gRPC Orders Service running on port 50053"
            );

            server.start();
        }
    );
}

startServer();