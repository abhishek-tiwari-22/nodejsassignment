const express = require('express');
const mongoose = require('mongoose');
const notificationRoutes = require('./routes/notificationRoutes');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.body.userId = decoded.userId; // Add this line to set userId in req.body
        next();
    } catch (err) {
        return res.status(401).send('Unauthorized');
    }
});

app.use('/api', notificationRoutes);

const port = process.env.NOTIFICATION_SERVICE_PORT || 3002;
app.listen(port, () => {
    console.log(`Notification Service listening on port ${port}`);
});
