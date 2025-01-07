const express = require('express');
const authController = require('./../controllers/authController');

const favoriteItems = require('./../controllers/favoriteItemsController');

const router = express.Router();
router.use(authController.protect);

router.post('/addFavoriteItem', favoriteItems.addFavoriteItem);

router.get('/getUserFavorites', favoriteItems.getUserFavorites);
router.get('/checkFavoriteItem', favoriteItems.checkFavoriteItem);

router.delete('/removeFavoriteItem', favoriteItems.removeFavoriteItem);

module.exports = router;
