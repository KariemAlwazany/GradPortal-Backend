const express = require('express');
const Orders = require('../models/ordersModel');
const Cart = require('../models/cartModel');
const CartItems = require('../models/cartItemsModel');
const Sellers = require('../models/sellerModel');
const Items = require('../models/itemsModel');
const OrderItems = require('../models/orderItemsModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken'); 

const createOrder = catchAsync(async (req, res, next) => {
    const userID = req.user.id; // Assuming user info is in req.user
    const { totalPrice, paymentMethod, deliveryLocation } = req.body;
  
    // Validate inputs
    if (!totalPrice || !paymentMethod) {
      return res.status(400).json({ message: 'Invalid order details' });
    }
  
    try {
      // Step 1: Fetch the user's cart and cart items
      const cart = await Cart.findOne({
        where: { user_id: userID },
        include: [
          {
            model: Items,
            as: 'ItemsInCart',
            through: {
              attributes: ['quantity', 'price'], // Include CartItems attributes
            },
            attributes: ['Item_ID', 'item_name', 'price', 'description', 'Picture', 'Shop_name'], // Include Shop_name
          },
        ],
      });
  
      if (!cart || !cart.ItemsInCart || cart.ItemsInCart.length === 0) {
        return res.status(404).json({ message: 'Cart is empty or not found' });
      }
  
      // Step 2: Resolve shopOwnerId for each item
      for (const item of cart.ItemsInCart) {
        if (item.Shop_name) {
          const seller = await Sellers.findOne({
            where: { shop_name: item.Shop_name },
            attributes: ['id'], // Fetch only the id of the seller
          });
          if (!seller) {
            return res.status(404).json({
              message: `Shop owner for ${item.Shop_name} not found.`,
            });
          }
          item.shopOwnerId = seller.id; // Attach the shopOwnerId dynamically
        } else {
          return res.status(400).json({
            message: `Shop name is missing for item ${item.item_name}.`,
          });
        }
      }
  
      // Step 3: Create the order
      const order = await Orders.create({
        buyer_id: userID,
        total_price: totalPrice,
        payment_method: paymentMethod,
        status: 'pending',
      });
  
      // Step 4: Group items by shop owner and prepare order items
      const groupedItems = {};
      for (const item of cart.ItemsInCart) {
        const shopOwnerId = item.shopOwnerId;
        if (!groupedItems[shopOwnerId]) groupedItems[shopOwnerId] = [];
        groupedItems[shopOwnerId].push({
          order_id: order.order_id,
          item_id: item.Item_ID,
          quantity: item.CartItems.quantity, // Quantity from CartItems
          price: item.CartItems.price, // Price from CartItems
        });
      }
  
      // Step 5: Notify each shop owner and create OrderItems
      for (const shopOwnerId in groupedItems) {
        const itemsForShopOwner = groupedItems[shopOwnerId];
  
        // Create order items for the shop owner
        await OrderItems.bulkCreate(itemsForShopOwner);
  
        // Optionally notify the shop owner
        console.log(`Shop owner ${shopOwnerId} has received a new order.`);
      }
  
      // Step 6: Respond with the created order
      res.status(201).json({
        message: 'Order created successfully',
        order,
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({
        message: 'Failed to create order',
        error: error.message,
      });
    }
  });
  
  
  const getOrdersForSeller = catchAsync(async (req, res, next) => {
    try {
      // Step 1: Decode the JWT token to get the seller's ID
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'You are not logged in' });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const sellerID = decoded.id;
  
      console.log('Decoded Seller ID:', sellerID);
  
      // Step 2: Get the seller's Shop_name from the Sellers table
      const seller = await Sellers.findOne({
        where: { id: sellerID },
        attributes: ['Shop_name'],
      });
  
      if (!seller || !seller.Shop_name) {
        return res.status(404).json({ message: 'Seller not found or shop name is missing' });
      }
  
      const shopName = seller.Shop_name;
      console.log('Seller Shop Name:', shopName);
  
      // Step 3: Find items belonging to the seller's shop using Shop_name
      const sellerItems = await Items.findAll({
        where: { Shop_name: shopName },
        attributes: ['Item_ID'], // Get the item IDs
      });
  
      if (!sellerItems || sellerItems.length === 0) {
        return res.status(404).json({ message: 'No items found for this seller' });
      }
  
      const sellerItemIDs = sellerItems.map((item) => item.Item_ID);
      console.log('Seller Item IDs:', sellerItemIDs);
  
      // Step 4: Fetch orders that contain the seller's items and have a 'pending' status
      const orders = await Orders.findAll({
        where: { status: 'pending' }, // Filter orders by status
        include: [
          {
            model: OrderItems,
            as: 'OrderItemsAlias', // Alias for OrderItems
            where: { item_id: sellerItemIDs },
            attributes: ['item_id', 'quantity', 'price'],
            include: [
              {
                model: Items,
                as: 'ItemsAlias', // Alias for Items
                attributes: ['item_name', 'description', 'Shop_name'], // Include item details
              },
            ],
          },
        ],
        attributes: ['order_id', 'total_price', 'payment_method', 'status', 'created_at'],
      });
  
      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: 'No pending orders found for this seller' });
      }
  
      // Step 5: Respond with the orders
      res.status(200).json({
        message: 'Pending orders fetched successfully',
        orders,
      });
    } catch (error) {
      console.error('Error fetching orders for seller:', error);
      res.status(500).json({
        message: 'Failed to fetch orders for seller',
        error: error.message,
      });
    }
  });
  
  
  
  
  


  const updateOrderStatus = catchAsync(async (req, res, next) => {
    const { order_id, status } = req.body;
  
    // Validate input
    if (!order_id || !status || !['approved', 'declined'].includes(status.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid order ID or status provided.' });
    }
  
    try {
      // Step 1: Find the order
      const order = await Orders.findOne({ where: { order_id } });
      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }
  
      // Step 2: Update order status
      order.status = status.toLowerCase() === 'approved' ? 'completed' : 'cancelled';
      await order.save();
  
      if (status.toLowerCase() === 'approved') {
        // Step 3: Find all OrderItems associated with this order
        const orderItems = await OrderItems.findAll({
          where: { order_id },
          include: [
            {
              model: Items,
              as: 'Item', // Use the correct alias defined in your association
              attributes: ['Item_ID', 'item_name', 'Quantity'],
            },
          ],
        });
  
        if (!orderItems || orderItems.length === 0) {
          return res.status(404).json({ message: 'No items found for this order.' });
        }
  
        // Step 4: Update item quantities
        for (const orderItem of orderItems) {
          const item = orderItem.Item; // Joined item details
  
          if (!item || item.Quantity < orderItem.quantity) {
            return res.status(400).json({
              message: `Insufficient stock for item: ${item.item_name}.`,
            });
          }
  
          // Lower the item's quantity
          item.Quantity -= orderItem.quantity;
          await item.save();
        }
  
        return res.status(200).json({
          message: 'Order approved and item quantities updated successfully.',
        });
      }
  
      // If order is declined, just update status
      return res.status(200).json({
        message: `Order status updated to ${order.status}.`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      return res.status(500).json({
        message: 'Failed to update order status.',
        error: error.message,
      });
    }
  });




  const countPendingOrders = catchAsync(async (req, res, next) => {
    try {
      // Decode the JWT token to get the seller's ID
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'You are not logged in' });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const sellerID = decoded.id;
  
      // Fetch the seller's shop name
      const seller = await Sellers.findOne({
        where: { id: sellerID },
        attributes: ['Shop_name'],
      });
  
      if (!seller || !seller.Shop_name) {
        return res.status(404).json({ message: 'Seller not found or shop name is missing' });
      }
  
      const shopName = seller.Shop_name;
  
      // Find all items belonging to the seller's shop
      const sellerItems = await Items.findAll({
        where: { Shop_name: shopName },
        attributes: ['Item_ID'],
      });
  
      if (!sellerItems || sellerItems.length === 0) {
        return res.status(404).json({ message: 'No items found for this seller' });
      }
  
      const sellerItemIDs = sellerItems.map((item) => item.Item_ID);
  
      // Count orders that are pending and include the seller's items
      const Count = await Orders.count({
        where: { status: 'pending' },
        include: [
          {
            model: OrderItems,
            as: 'OrderItemsAlias',
            where: { item_id: sellerItemIDs },
          },
        ],
      });
  
      res.status(200).json({
        message: 'Pending orders count fetched successfully',
        Count,
      });
    } catch (error) {
      console.error('Error counting pending orders:', error);
      res.status(500).json({
        message: 'Failed to count pending orders',
        error: error.message,
      });
    }
  });
  




  const countCompletedOrders = catchAsync(async (req, res, next) => {
    try {
      // Decode the JWT token to get the seller's ID
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'You are not logged in' });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const sellerID = decoded.id;
  
      // Fetch the seller's shop name
      const seller = await Sellers.findOne({
        where: { id: sellerID },
        attributes: ['Shop_name'],
      });
  
      if (!seller || !seller.Shop_name) {
        return res.status(404).json({ message: 'Seller not found or shop name is missing' });
      }
  
      const shopName = seller.Shop_name;
  
      // Find all items belonging to the seller's shop
      const sellerItems = await Items.findAll({
        where: { Shop_name: shopName },
        attributes: ['Item_ID'],
      });
  
      if (!sellerItems || sellerItems.length === 0) {
        return res.status(404).json({ message: 'No items found for this seller' });
      }
  
      const sellerItemIDs = sellerItems.map((item) => item.Item_ID);
  
      // Count orders that are completed and include the seller's items
      const Count = await Orders.count({
        where: { status: 'completed' },
        include: [
          {
            model: OrderItems,
            as: 'OrderItemsAlias',
            where: { item_id: sellerItemIDs },
          },
        ],
      });
  
      res.status(200).json({
        message: 'Completed orders count fetched successfully',
        Count,
      });
    } catch (error) {
      console.error('Error counting completed orders:', error);
      res.status(500).json({
        message: 'Failed to count completed orders',
        error: error.message,
      });
    }
  });




  const getCompletedOrdersForSeller = catchAsync(async (req, res, next) => {
    try {
      // Step 1: Decode the JWT token to get the seller's ID
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'You are not logged in' });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const sellerID = decoded.id;
  
      console.log('Decoded Seller ID:', sellerID);
  
      // Step 2: Get the seller's Shop_name from the Sellers table
      const seller = await Sellers.findOne({
        where: { id: sellerID },
        attributes: ['Shop_name'],
      });
  
      if (!seller || !seller.Shop_name) {
        return res.status(404).json({ message: 'Seller not found or shop name is missing' });
      }
  
      const shopName = seller.Shop_name;
      console.log('Seller Shop Name:', shopName);
  
      // Step 3: Find items belonging to the seller's shop using Shop_name
      const sellerItems = await Items.findAll({
        where: { Shop_name: shopName },
        attributes: ['Item_ID'], // Get the item IDs
      });
  
      if (!sellerItems || sellerItems.length === 0) {
        return res.status(404).json({ message: 'No items found for this seller' });
      }
  
      const sellerItemIDs = sellerItems.map((item) => item.Item_ID);
      console.log('Seller Item IDs:', sellerItemIDs);
  
      // Step 4: Fetch orders that contain the seller's items and have a 'completed' status
      const orders = await Orders.findAll({
        where: { status: 'completed' }, // Filter orders by 'completed' status
        include: [
          {
            model: OrderItems,
            as: 'OrderItemsAlias', // Alias for OrderItems
            where: { item_id: sellerItemIDs },
            attributes: ['item_id', 'quantity', 'price'],
            include: [
              {
                model: Items,
                as: 'ItemsAlias', // Alias for Items
                attributes: ['item_name', 'description', 'Shop_name'], // Include item details
              },
            ],
          },
        ],
        attributes: ['order_id', 'total_price', 'payment_method', 'status', 'created_at'],
      });
  
      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: 'No completed orders found for this seller' });
      }
  
      // Step 5: Respond with the orders
      res.status(200).json({
        message: 'Completed orders fetched successfully',
        orders,
      });
    } catch (error) {
      console.error('Error fetching completed orders for seller:', error);
      res.status(500).json({
        message: 'Failed to fetch completed orders for seller',
        error: error.message,
      });
    }
  });
  
exports.createOrder = createOrder;
exports.getOrdersForSeller = getOrdersForSeller;
exports.updateOrderStatus = updateOrderStatus;
exports.countPendingOrders = countPendingOrders;
exports.countCompletedOrders = countCompletedOrders;
exports.getCompletedOrdersForSeller = getCompletedOrdersForSeller;


  