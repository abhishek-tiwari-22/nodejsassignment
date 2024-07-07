const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const amqp = require('amqplib/callback_api');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow all origins. You can specify a specific origin instead of "*"
        methods: ["GET", "POST"]
    }
});

let connections = {};

io.on('connection', socket => {
    const { userId } = socket.handshake.query;
    connections[userId] = socket.id;
    // connections["668abe6b574500361b4f606f"] = socket.id;
    console.log("efre", connections);
    console.log(`User connected: ${userId}`);

    socket.on('disconnect', () => {
        delete connections[userId];
    });
});

const connectToRabbitMQ = () => {
    amqp.connect(process.env.RABBITMQ_URI, (err, connection) => {
        if (err) {
            console.error('Failed to connect to RabbitMQ:', err.message);
            setTimeout(connectToRabbitMQ, 5000); // Retry connection after 5 seconds
            return;
        }

        console.log('Connected to RabbitMQ');
        connection.createChannel((err, channel) => {
            if (err) throw err;
            const queue = 'notifications';
            channel.assertQueue(queue, { durable: true });

            channel.consume(queue, msg => {
                const notification = JSON.parse(msg.content.toString());
                console.log('Received notification:', notification);
                const socketId = connections[notification.userId];
                console.log('Socket ID:', socketId);
                if (socketId) {
                    io.to(socketId).emit('notification', notification);
                }
            }, { noAck: true });
        });
    });
};

connectToRabbitMQ();

const port = process.env.REAL_TIME_SERVICE_PORT || 3003;
server.listen(port, () => {
    console.log(`Real-Time Service listening on port ${port}`);
});
