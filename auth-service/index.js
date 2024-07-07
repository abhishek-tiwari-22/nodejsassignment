const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/api', authRoutes);

const port = process.env.AUTH_SERVICE_PORT || 3001;
app.listen(port, () => {
    console.log(`Auth Service listening on port ${port}`);
});
