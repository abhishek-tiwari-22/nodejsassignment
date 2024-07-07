const Notification = require('../models/Notification');
const amqp = require('amqplib/callback_api');

exports.createNotification = async (req, res) => {
    const { userId, message } = req.body;
    const notification = new Notification({ userId, message });

    try {
        await notification.save();

        amqp.connect(process.env.RABBITMQ_URI, (err, connection) => {
            if (err) throw err;
            connection.createChannel((err, channel) => {
                if (err) throw err;
                const queue = 'notifications';
                channel.assertQueue(queue, { durable: true });
                channel.sendToQueue(queue, Buffer.from(JSON.stringify(notification)));
            });
        });

        res.status(201).send(notification);
    } catch (err) {
        res.status(400).send(err.message);
    }
};

exports.getNotifications = async (req, res) => {
    const userId = req.userId; // Assuming userId is set in middleware
    const notifications = await Notification.find({ userId });
    res.send(notifications);
};

exports.getNotification = async (req, res) => {
    const notification = await Notification.findById(req.params.id);
    res.send(notification);
};

exports.markAsRead = async (req, res) => {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.send(notification);
};
