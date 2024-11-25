const express = require('express');
const itemsController = require('./../controllers/itemsController');
const authController = require('./../controllers/authController');

const router = express.Router();
const upload = require('./../middleware/multer'); 


router.use(authController.protect);
router.post('/additem', upload.single('Picture'), itemsController.addItem);
router.route('/:id')
  .get(itemsController.getItemsByID);
  
router.get('/getAllitems', itemsController.findAllItems);

router.route('/updateitems/:id')
    .patch(itemsController.updateItems);
    
router.route('/deleteitems/:id')
    .delete(itemsController.deleteItems);

// router.route('/getName/:Username')
//   .get(itemsController.getitemsByName);

module.exports = router;

