const db = require('./../models/sellerModel');
const Seller = db.Seller;
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryController');





getSellerByName = catchAsync(async (req, res) => {
    Username = req.params.Username;
    const seller = await Seller.findOne({
      where: { Username: Username },
    });
    if (!seller) {
        return res.status(404).send({ message: 'Seller not found' });
      }
    res.status(200).send(seller);
  });


exports.findAllSellers = factory.getAll(Seller);
exports.addSeller = factory.createOne(Seller);
exports.updateSeller = factory.updateOne(Seller);
exports.deleteSeller = factory.deleteOne(Seller);
exports.getSellerByID = factory.getOne(Seller);
exports.getSellerByName = getSellerByName;