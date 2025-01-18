const express = require('express');
const Cart = require('../models/cartModel');
const CartItems = require('../models/cartItemsModel');
const Items = require('../models/itemsModel');
const db1 = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = db1.User;

const createOrUpdateCart = catchAsync(async (req, res, next) => {
    try {
      const userID = req.user.id;
      const { items } = req.body;
  
      const user = await User.findOne({ where: { id: userID } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      let cart = await Cart.findOne({ where: { user_id: userID } });
      if (!cart) {
        cart = await Cart.create({ user_id: userID });
      }
  
      const cartItems = [];
      for (const item of items) {
        const { item_id, quantity, price } = item;
  
        const existingItem = await Items.findOne({ where: { Item_ID: item_id } });
        if (!existingItem) {
          return res.status(404).json({ message: `Item with ID ${item_id} not found` });
        }
  
        let cartItem = await CartItems.findOne({
          where: { cart_id: cart.cart_id, item_id },
        });
  
        if (cartItem) {
          cartItem = await cartItem.update({
            quantity: cartItem.quantity + quantity,
            price: price || cartItem.price,
          });
        } else {
          cartItem = await CartItems.create({
            cart_id: cart.cart_id,
            item_id,
            quantity,
            price,
          });
        }
  
        cartItems.push(cartItem.toJSON());
      }
  
      res.status(200).json({
        message: 'Cart updated successfully',
        cart_id: cart.cart_id,
        items: cartItems,
      });
    } catch (error) {
      console.error('Error in createOrUpdateCart:', error); 
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  });
  



const deleteFromCart = catchAsync(async (req, res, next) => {
    const userID = req.user.id;
    const { item_id } = req.body;
  
    const user = await User.findOne({ where: { id: userID } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    const cart = await Cart.findOne({ where: { user_id: userID } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
  
    if (item_id) {
      const cartItem = await CartItems.findOne({ where: { cart_id: cart.cart_id, item_id } });
      if (!cartItem) {
        return res.status(404).json({ message: `Item with ID ${item_id} not found in the cart` });
      }
  
      await cartItem.destroy();
  
      return res.status(200).json({
        message: `Item with ID ${item_id} removed from the cart`,
      });
    } else {
      await CartItems.destroy({ where: { cart_id: cart.cart_id } });
  
      return res.status(200).json({
        message: 'All items removed from the cart',
      });
    }
  });
  



  const getCart = catchAsync(async (req, res, next) => {
    const userID = req.user.id;
  
    // Validate user existence
    const user = await User.findOne({ where: { id: userID } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    // Fetch the cart details
    const cart = await Cart.findOne({
      where: { user_id: userID },
      include: [
        {
          model: Items,
          as: 'ItemsInCart',
          through: {
            attributes: ['quantity', 'price'],
          },
          attributes: ['Item_ID', 'item_name', 'price', 'description', 'Picture'],
        },
      ],
    });
  
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
  
    // Calculate the total count of items in the cart
    const totalItemCount = cart.ItemsInCart.reduce((total, item) => {
      return total + (item.CartItems.quantity || 0);
    }, 0);
  
    res.status(200).json({
      message: 'Cart fetched successfully',
      cart,
      totalItemCount, // Include the total count in the response
    });
  });
  
  
  

exports.createOrUpdateCart = createOrUpdateCart;
exports.deleteFromCart = deleteFromCart;
exports.getCart = getCart;