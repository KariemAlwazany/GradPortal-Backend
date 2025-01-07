const express = require('express');
const Rating = require('../models/ratingModel');
const sequelize = require('sequelize'); // Adjust the path
const { User } = require('../models/userModel'); // Destructure User from the object


const addOrUpdateRating = async (req, res) => {
    const { item_id, rating, review } = req.body;
    const user_id = req.user.id; // Assuming user ID is extracted from the token
  
    console.log('Request Body:', req.body);
    console.log('User ID:', user_id);
  
    try {
      const existingRating = await Rating.findOne({ where: { user_id, item_id } });
  
      if (existingRating) {
        // Update existing rating
        await existingRating.update({ rating, review });
        return res.status(200).json({ message: 'Rating updated successfully.' });
      }
  
      // Create new rating
      await Rating.create({ user_id, item_id, rating, review });
      res.status(201).json({ message: 'Rating added successfully.' });
    } catch (error) {
      console.error('Error adding/updating rating:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  





  const getRatingsForItem = async (req, res) => {
    const { item_id } = req.params;
  
    try {
      const ratings = await Rating.findAll({
        where: { item_id },
        attributes: ['user_id', 'rating', 'review', 'createdAt'],
        include: {
          model: User,
          as: 'User', // Alias must match exactly
          attributes: ['id', 'Username'],
        },
      });
  
      const averageRatingData = await Rating.findOne({
        where: { item_id },
        attributes: [
          [sequelize.fn('AVG', sequelize.col('rating')), 'average_rating'],
          [sequelize.fn('COUNT', sequelize.col('rating')), 'ratings_count'],
        ],
      });
  
      res.status(200).json({
        item_id,
        average_rating: parseFloat(averageRatingData?.dataValues?.average_rating) || 0,
        total_ratings: averageRatingData?.dataValues?.ratings_count || 0,
        comments: ratings.map((rating) => ({
          user_name: rating.User.Username,
          rating: rating.rating,
          review: rating.review,
          createdAt: rating.createdAt,
        })),
      });
    } catch (error) {
      console.error('Error fetching ratings:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  
  

  

getAverageRating = async (req, res) => {
  const { item_id } = req.params;

  try {
    const averageRatingData = await Rating.findOne({
      where: { item_id },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'average_rating'],
        [sequelize.fn('COUNT', sequelize.col('rating_id')), 'ratings_count'],
      ],
    });

    res.status(200).json({
      item_id,
      average_rating: parseFloat(averageRatingData.dataValues.average_rating) || 0,
      ratings_count: averageRatingData.dataValues.ratings_count || 0,
    });
  } catch (error) {
    console.error('Error fetching average rating:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
exports.addOrUpdateRating = addOrUpdateRating;
exports.getRatingsForItem = getRatingsForItem;
exports.getAverageRating = getAverageRating;