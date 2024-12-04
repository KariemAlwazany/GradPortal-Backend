const express = require('express');
const itemsController = require('./../controllers/itemsController');
const authController = require('./../controllers/authController');

const router = express.Router();
const upload = require('./../middleware/multer'); 


router.use(authController.protect);
router.post('/additem', upload.single('Picture'), itemsController.addItem);
  
router.get('/getSelleritems', itemsController.getItemsForSeller);
router.get('/getSellerItemsByCategory', itemsController.getSellerItemsByCategory);
router.get('/getItemsByCategory', itemsController.getItemsByCategory)
router.get('/getAllItems', itemsController.getAllItems);
router.patch('/updateItem/:item_id', itemsController.updateItem);
router.get('/searchItems', itemsController.searchItems);
router.get('/searchItemsForSeller', itemsController.searchItemsForSeller);

// router.route('/updateitems/:id')
//     .patch(itemsController.updateItems);
    
// router.route('/deleteitems/:id')
//     .delete(itemsController.deleteItems);

// router.route('/getName/:Username')
//   .get(itemsController.getitemsByName);

module.exports = router;

