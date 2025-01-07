const { User } = require('../models/userModel');
const Items = require('../models/itemsModel');
const FavoriteItems = require('../models/favotireItemsModel');

const catchAsync = require('../utils/catchAsync');

const addFavoriteItem = catchAsync(async (req, res, next) => {
  const { item_id } = req.body;

  if (!item_id) {
    return res.status(400).json({ message: 'Item_ID is required' });
  }

  try {
    const userId = req.user.id;

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const item = await Items.findOne({ where: { Item_ID: item_id } });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const favoriteItem = await FavoriteItems.create({
      user_id: userId,
      item_id: item_id,
    });

    res.status(200).json({
      message: 'Item added to favorites successfully',
      data: favoriteItem,
    });
  } catch (err) {
    console.error('Error adding favorite item:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

const getUserFavorites = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  try {
    const favorites = await FavoriteItems.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Items,
          attributes: ['Item_ID', 'item_name', 'Price', 'Picture', 'Description'],
        },
      ],
    });

    res.status(200).json({
      message: 'Favorites fetched successfully',
      data: favorites,
    });
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

const removeFavoriteItem = catchAsync(async (req, res, next) => {
  const { item_id } = req.body;
  const userId = req.user.id;

  try {
    const rowsDeleted = await FavoriteItems.destroy({
      where: {
        user_id: userId,
        item_id: item_id,
      },
    });

    if (rowsDeleted === 0) {
      return res.status(404).json({
        message: `No favorite item found for user ${userId} and item ${item_id}.`,
      });
    }

    res.status(200).json({
      message: `Item ${item_id} removed from favorites.`,
    });
  } catch (error) {
    console.error('Error removing favorite item:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

const checkFavoriteItem = async (req, res) => {
  try {
    const { item_id } = req.query;
    const userId = req.user.id;

    if (!item_id) {
      return res.status(400).json({ status: "error", message: "Item ID is required" });
    }

    const favoriteItem = await FavoriteItems.findOne({
      where: { user_id: userId, item_id: item_id }
    });

    if (favoriteItem) {
      return res.status(200).json({
        status: "success",
        message: "Item is in favorites",
        is_favorite: true
      });
    } else {
      return res.status(200).json({
        status: "success",
        message: "Item is not in favorites",
        is_favorite: false
      });
    }
  } catch (error) {
    console.error("Error checking favorite item:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.checkFavoriteItem = checkFavoriteItem;
exports.addFavoriteItem = addFavoriteItem;
exports.getUserFavorites = getUserFavorites;
exports.removeFavoriteItem = removeFavoriteItem;
