const { Kafka } = require("kafkajs");

const kafka = new Kafka({

    clientId: "products-service",

    brokers: ["127.0.0.1:9092"]
});



const consumer = kafka.consumer({

    groupId: "products-group"
});



// START CONSUMER
async function startConsumer() {

    await consumer.connect();

    console.log("Kafka Consumer connected");



    await consumer.subscribe({

        topic: "order-created",

        fromBeginning: true
    });



    await consumer.run({

        eachMessage: async ({ topic, partition, message }) => {

            const order = JSON.parse(
                message.value.toString()
            );

            console.log("================================");

            console.log("ORDER CREATED EVENT RECEIVED");

            console.log(order);

            console.log("================================");
        }
    });
}



module.exports = {
    startConsumer
};