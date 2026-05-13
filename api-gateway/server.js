const express = require("express");

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const { graphqlHTTP } = require("express-graphql");

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLFloat,
    GraphQLList,
    GraphQLSchema
} = require("graphql");

const app = express();

app.use(express.json());



// ======================================================
// LOAD USERS PROTO
// ======================================================

const usersPackageDefinition = protoLoader.loadSync(
    "../proto/users.proto"
);

const usersProto = grpc.loadPackageDefinition(
    usersPackageDefinition
).users;



// ======================================================
// LOAD PRODUCTS PROTO
// ======================================================

const productsPackageDefinition = protoLoader.loadSync(
    "../proto/products.proto"
);

const productsProto = grpc.loadPackageDefinition(
    productsPackageDefinition
).products;



// ======================================================
// LOAD ORDERS PROTO
// ======================================================

const ordersPackageDefinition = protoLoader.loadSync(
    "../proto/orders.proto"
);

const ordersProto = grpc.loadPackageDefinition(
    ordersPackageDefinition
).orders;



// ======================================================
// USERS CLIENT
// ======================================================

const usersClient = new usersProto.UserService(
    "localhost:50051",
    grpc.credentials.createInsecure()
);



// ======================================================
// PRODUCTS CLIENT
// ======================================================

const productsClient = new productsProto.ProductService(
    "localhost:50052",
    grpc.credentials.createInsecure()
);



// ======================================================
// ORDERS CLIENT
// ======================================================

const ordersClient = new ordersProto.OrderService(
    "localhost:50053",
    grpc.credentials.createInsecure()
);



// ======================================================
// GRAPHQL TYPES
// ======================================================

// USER TYPE
const UserType = new GraphQLObjectType({

    name: "User",

    fields: () => ({

        id: { type: GraphQLInt },

        name: { type: GraphQLString },

        email: { type: GraphQLString }
    })
});



// PRODUCT TYPE
const ProductType = new GraphQLObjectType({

    name: "Product",

    fields: () => ({

        id: { type: GraphQLInt },

        name: { type: GraphQLString },

        price: { type: GraphQLFloat },

        stock: { type: GraphQLInt }
    })
});



// PRODUCT ITEM TYPE
const ProductItemType = new GraphQLObjectType({

    name: "ProductItem",

    fields: () => ({

        productId: { type: GraphQLInt },

        quantity: { type: GraphQLInt }
    })
});



// ORDER TYPE
const OrderType = new GraphQLObjectType({

    name: "Order",

    fields: () => ({

        id: { type: GraphQLString },

        userId: { type: GraphQLInt },

        total: { type: GraphQLFloat },

        products: {
            type: new GraphQLList(ProductItemType)
        }
    })
});



// ======================================================
// GRAPHQL ROOT QUERY
// ======================================================

const RootQuery = new GraphQLObjectType({

    name: "RootQueryType",

    fields: {

        // ==========================================
        // USERS
        // ==========================================

        users: {

            type: new GraphQLList(UserType),

            resolve(parent, args) {

                return new Promise((resolve, reject) => {

                    usersClient.GetUsers({}, (err, response) => {

                        if (err) {

                            reject(err);

                        } else {

                            resolve(response.users);
                        }
                    });
                });
            }
        },



        // ==========================================
        // PRODUCTS
        // ==========================================

        products: {

            type: new GraphQLList(ProductType),

            resolve(parent, args) {

                return new Promise((resolve, reject) => {

                    productsClient.GetProducts({}, (err, response) => {

                        if (err) {

                            reject(err);

                        } else {

                            resolve(response.products);
                        }
                    });
                });
            }
        },



        // ==========================================
        // ORDERS
        // ==========================================

        orders: {

            type: new GraphQLList(OrderType),

            resolve(parent, args) {

                return new Promise((resolve, reject) => {

                    ordersClient.GetOrders({}, (err, response) => {

                        if (err) {

                            reject(err);

                        } else {

                            resolve(response.orders);
                        }
                    });
                });
            }
        }
    }
});



// ======================================================
// GRAPHQL SCHEMA
// ======================================================

const schema = new GraphQLSchema({

    query: RootQuery
});



// ======================================================
// GRAPHQL ENDPOINT
// ======================================================

app.use(
    "/graphql",

    graphqlHTTP({

        schema,

        graphiql: true
    })
);



// ======================================================
// USERS ROUTES
// ======================================================


// GET USERS
app.get("/users", (req, res) => {

    usersClient.GetUsers({}, (err, response) => {

        if (err) {

            res.status(500).json(err);

        } else {

            res.json(response);
        }
    });
});



// GET USER BY ID
app.get("/users/:id", (req, res) => {

    usersClient.GetUserById(
        {
            id: parseInt(req.params.id)
        },

        (err, response) => {

            if (err) {

                res.status(500).json(err);

            } else {

                res.json(response);
            }
        }
    );
});



// CREATE USER
app.post("/users", (req, res) => {

    usersClient.CreateUser(
        {
            name: req.body.name,
            email: req.body.email
        },

        (err, response) => {

            if (err) {

                res.status(500).json(err);

            } else {

                res.json(response);
            }
        }
    );
});



// DELETE USER
app.delete("/users/:id", (req, res) => {

    usersClient.DeleteUser(
        {
            id: parseInt(req.params.id)
        },

        (err, response) => {

            if (err) {

                res.status(500).json(err);

            } else {

                res.json(response);
            }
        }
    );
});



// ======================================================
// PRODUCTS ROUTES
// ======================================================


// GET PRODUCTS
app.get("/products", (req, res) => {

    productsClient.GetProducts({}, (err, response) => {

        if (err) {

            res.status(500).json(err);

        } else {

            res.json(response);
        }
    });
});



// GET PRODUCT BY ID
app.get("/products/:id", (req, res) => {

    productsClient.GetProductById(
        {
            id: parseInt(req.params.id)
        },

        (err, response) => {

            if (err) {

                res.status(500).json(err);

            } else {

                res.json(response);
            }
        }
    );
});



// CREATE PRODUCT
app.post("/products", (req, res) => {

    productsClient.CreateProduct(
        {
            name: req.body.name,
            price: req.body.price,
            stock: req.body.stock
        },

        (err, response) => {

            if (err) {

                res.status(500).json(err);

            } else {

                res.json(response);
            }
        }
    );
});



// DELETE PRODUCT
app.delete("/products/:id", (req, res) => {

    productsClient.DeleteProduct(
        {
            id: parseInt(req.params.id)
        },

        (err, response) => {

            if (err) {

                res.status(500).json(err);

            } else {

                res.json(response);
            }
        }
    );
});



// ======================================================
// ORDERS ROUTES
// ======================================================


// GET ORDERS
app.get("/orders", (req, res) => {

    ordersClient.GetOrders({}, (err, response) => {

        if (err) {

            res.status(500).json(err);

        } else {

            res.json(response);
        }
    });
});



// GET ORDER BY ID
app.get("/orders/:id", (req, res) => {

    ordersClient.GetOrderById(
        {
            id: req.params.id
        },

        (err, response) => {

            if (err) {

                res.status(500).json(err);

            } else {

                res.json(response);
            }
        }
    );
});



// GET ORDERS BY USER ID
app.get("/users/:userId/orders", (req, res) => {

    ordersClient.GetOrdersByUserId(
        {
            userId: parseInt(req.params.userId)
        },

        (err, response) => {

            if (err) {

                res.status(500).json(err);

            } else {

                res.json(response);
            }
        }
    );
});



// CREATE ORDER
app.post("/orders", (req, res) => {

    ordersClient.CreateOrder(
        {
            userId: req.body.userId,

            products: req.body.products,

            total: req.body.total
        },

        (err, response) => {

            if (err) {

                res.status(500).json(err);

            } else {

                res.json(response);
            }
        }
    );
});



// UPDATE ORDER
app.put("/orders/:id", (req, res) => {

    ordersClient.UpdateOrder(
        {
            id: req.params.id,

            userId: req.body.userId,

            products: req.body.products,

            total: req.body.total
        },

        (err, response) => {

            if (err) {

                res.status(500).json(err);

            } else {

                res.json(response);
            }
        }
    );
});



// DELETE ORDER
app.delete("/orders/:id", (req, res) => {

    ordersClient.DeleteOrder(
        {
            id: req.params.id
        },

        (err, response) => {

            if (err) {

                res.status(500).json(err);

            } else {

                res.json(response);
            }
        }
    );
});



// CHECK ORDER EXISTS
app.get("/orders/:id/exists", (req, res) => {

    ordersClient.CheckOrderExists(
        {
            id: req.params.id
        },

        (err, response) => {

            if (err) {

                res.status(500).json(err);

            } else {

                res.json(response);
            }
        }
    );
});



// ======================================================
// PORT
// ======================================================

const PORT = 4000;



// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {

    console.log(`API Gateway running on port ${PORT}`);
});