const express = require('express');
const itemsController = require('./../controllers/itemsController');
const authController = require('./../controllers/authController');

const router = express.Router();
const upload = require('./../middleware/multer'); 


router.use(authController.protect);

router.post('/additem', upload.single('Picture'), itemsController.addItem);
router.post('/additemStudent', upload.single('Picture'), itemsController.addItemForStudent);

router.patch('/updateItem/:item_id', itemsController.updateItem);

router.get('/getSelleritems', itemsController.getItemsForSeller);
router.get('/getSellerItemsByCategory', itemsController.getSellerItemsByCategory);
router.get('/getItemsByCategory', itemsController.getItemsByCategory)
router.get('/getAllItems', itemsController.getAllItems);
router.get('/searchItems', itemsController.searchItems);
router.get('/searchItemsForSeller', itemsController.searchItemsForSeller);
router.get('/countItemsForSeller', itemsController.countItemsForSeller);
router.get('/limitedStockItemsForSeller', itemsController.limitedStockForSeller);
router.get('/outOfStockItemsForSeller', itemsController.outOfStockItemsForSeller);
router.get('/countLimitedStock', itemsController.countLimitedStock);
router.get('/countOutOfStockItems', itemsController.countOutOfStockItems);
router.get('/getItemsForStudent', itemsController.getItemsForStudent);

router.delete('/deleteItem/:id', itemsController.deleteItems);

module.exports = router;

