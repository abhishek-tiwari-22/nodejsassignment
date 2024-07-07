const express = require('express');
const mongoose = require('mongoose');
const notificationRoutes = require('./routes/notificationRoutes');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use((req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).send('Unauthorized');
        req.userId = decoded.userId;
        next();
    });
});

app.use('/api', notificationRoutes);

const port = process.env.NOTIFICATION_SERVICE_PORT || 3002;
app.listen(port, () => {
    console.log(`Notification Service listening on port ${port}`);
});
