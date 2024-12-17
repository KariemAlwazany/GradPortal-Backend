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
      const userID = req.user.id; // Extracted from the JWT middleware
      const { items } = req.body; // Items to add: [{ item_id, quantity, price }, ...]
  
      // Step 1: Check if user exists
      const user = await User.findOne({ where: { id: userID } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Step 2: Check if the user has an existing cart, create one if not
      let cart = await Cart.findOne({ where: { user_id: userID } });
      if (!cart) {
        cart = await Cart.create({ user_id: userID });
      }
  
      // Step 3: Validate and add items to cart
      const cartItems = [];
      for (const item of items) {
        const { item_id, quantity, price } = item;
  
        // Check if the item exists
        const existingItem = await Items.findOne({ where: { Item_ID: item_id } });
        if (!existingItem) {
          return res.status(404).json({ message: `Item with ID ${item_id} not found` });
        }
  
        // Add or update item in CartItems
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
  
      // Step 4: Return the updated cart items
      res.status(200).json({
        message: 'Cart updated successfully',
        cart_id: cart.cart_id,
        items: cartItems,
      });
    } catch (error) {
      console.error('Error in createOrUpdateCart:', error); // Log the error to console
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  });
  



const deleteFromCart = catchAsync(async (req, res, next) => {
    const userID = req.user.id; // Assuming user info is in req.user
    const { item_id } = req.body; // Item ID to delete (optional for clearing the cart)
  
    // Step 1: Check if user exists
    const user = await User.findOne({ where: { id: userID } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    // Step 2: Check if the user has a cart
    const cart = await Cart.findOne({ where: { user_id: userID } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
  
    // Step 3: Delete item(s) from the cart
    if (item_id) {
      // Delete a specific item from the cart
      const cartItem = await CartItems.findOne({ where: { cart_id: cart.cart_id, item_id } });
      if (!cartItem) {
        return res.status(404).json({ message: `Item with ID ${item_id} not found in the cart` });
      }
  
      await cartItem.destroy();
  
      return res.status(200).json({
        message: `Item with ID ${item_id} removed from the cart`,
      });
    } else {
      // Clear the entire cart
      await CartItems.destroy({ where: { cart_id: cart.cart_id } });
  
      return res.status(200).json({
        message: 'All items removed from the cart',
      });
    }
  });
  



  const getCart = catchAsync(async (req, res, next) => {
    const userID = req.user.id; // Assuming user info is in req.user
  
    // Step 1: Check if user exists
    const user = await User.findOne({ where: { id: userID } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    // Step 2: Check if the user has a cart
    const cart = await Cart.findOne({
      where: { user_id: userID },
      include: [
        {
          model: Items,
          as: 'ItemsInCart',
          through: {
            attributes: ['quantity', 'price'], // Include CartItems attributes
          },
          attributes: ['Item_ID', 'item_name', 'price', 'description', 'Picture'], // Attributes from Items
        },
      ],
    });
  
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
  
    // Step 3: Respond with the cart and its items
    res.status(200).json({
      message: 'Cart fetched successfully',
      cart,
    });
  });
  
  

exports.createOrUpdateCart = createOrUpdateCart;
exports.deleteFromCart = deleteFromCart;
exports.getCart = getCart;