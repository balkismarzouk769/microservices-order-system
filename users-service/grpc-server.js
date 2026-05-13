const grpc = require("@grpc/grpc-js");

const protoLoader = require("@grpc/proto-loader");

const db = require("./database");



// LOAD PROTO
const packageDefinition = protoLoader.loadSync(
    "../proto/users.proto"
);

const proto = grpc.loadPackageDefinition(
    packageDefinition
).users;



// GET USERS
function getUsers(call, callback) {

    db.all("SELECT * FROM users", [], (err, rows) => {

        if (err) {

            callback(err);

        } else {

            callback(null, {
                users: rows
            });
        }
    });
}



// GET USER BY ID
function getUserById(call, callback) {

    const userId = call.request.id;

    db.get(
        "SELECT * FROM users WHERE id = ?",
        [userId],

        (err, row) => {

            if (err) {

                callback(err);

            } else {

                callback(null, row);
            }
        }
    );
}



// CREATE USER
function createUser(call, callback) {

    const { name, email } = call.request;

    db.run(
        "INSERT INTO users(name, email) VALUES(?, ?)",
        [name, email],

        function(err) {

            if (err) {

                callback(err);

            } else {

                callback(null, {

                    id: this.lastID,

                    name,

                    email
                });
            }
        }
    );
}



// DELETE USER
function deleteUser(call, callback) {

    const userId = call.request.id;

    db.run(
        "DELETE FROM users WHERE id = ?",
        [userId],

        function(err) {

            if (err) {

                callback(err);

            } else {

                callback(null, {

                    message: "User deleted successfully"
                });
            }
        }
    );
}



// CHECK USER EXISTS
function checkUserExists(call, callback) {

    const userId = call.request.id;

    db.get(
        "SELECT * FROM users WHERE id = ?",
        [userId],

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



// CREATE GRPC SERVER
const server = new grpc.Server();

server.addService(proto.UserService.service, {

    GetUsers: getUsers,

    GetUserById: getUserById,

    CreateUser: createUser,

    DeleteUser: deleteUser,

    CheckUserExists: checkUserExists
});



// START SERVER
server.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(),

    () => {

        console.log(
            "gRPC Users Service running on port 50051"
        );

        server.start();
    }
);