const express = require('express');
const Requests = require('../models/buyRequestsModel');

createRequest = async (req, res) => {
  try {
    const { sender_id, recipient_id, message } = req.body;

    if (sender_id === recipient_id) {
      return res.status(400).json({ error: 'Sender and recipient must be different.' });
    }

    const request = await Requests.create({
      sender_id,
      recipient_id,
      message,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

getRequestsForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const requests = await Requests.findAll({
      where: { recipient_id: userId },
    });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!['approved', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const [rowsAffected, updatedRequests] = await Requests.update(
      { status },
      {
        where: { request_id: requestId },
        returning: true,
      }
    );

    if (rowsAffected === 0) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    res.status(200).json(updatedRequests[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.createRequest = createRequest;
exports.getRequestsForUser = getRequestsForUser;
exports.updateRequestStatus = updateRequestStatus;