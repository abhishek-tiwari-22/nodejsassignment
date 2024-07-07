const express = require('express');
const { createNotification, getNotifications, getNotification, markAsRead } = require('../controllers/notificationController');

const router = express.Router();
router.post('/notifications', createNotification);
router.get('/notifications', getNotifications);
router.get('/notifications/:id', getNotification);
router.put('/notifications/:id', markAsRead);

module.exports = router;
