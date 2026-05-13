const { Kafka } = require("kafkajs");

const kafka = new Kafka({

    clientId: "orders-service",

    brokers: ["127.0.0.1:9092"]
});



const producer = kafka.producer();



// CONNECT PRODUCER
async function connectProducer() {

    await producer.connect();

    console.log("Kafka Producer connected");
}



// SEND EVENT
async function sendOrderCreatedEvent(order) {

    await producer.send({

        topic: "order-created",

        messages: [

            {
                value: JSON.stringify(order)
            }
        ]
    });

    console.log("Order Created Event Sent");
}



module.exports = {

    connectProducer,

    sendOrderCreatedEvent
};