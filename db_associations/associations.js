const { User } = require('../models/userModel');
const Sellers = require('../models/sellerModel');
const { FavProjects } = require('../models/favProjectsModel');
const { Projects } = require('../models/projectsModel');
const { WaitingList } = require('../models/waitingModel');
const { Student } = require('../models/studentModel');
const { Submit } = require('../models/submitModel');
const { Doctor } = require('../models/doctorModel');
const Items = require('../models/itemsModel');
const Shop = require('../models/shopModel');
const Receipt = require('../models/receiptModel');
const Offers = require('../models/offersModel');
const Requests = require('../models/buyRequestsModel');
const Cart = require('../models/cartModel');
const CartItems = require('../models/cartItemsModel');
const Users = require('../models/userModel');
const Orders = require('../models/ordersModel');
const OrderItems = require('../models/orderItemsModel');
const FavoriteItems = require('../models/favotireItemsModel');
const Post = require('../models/postModel');
const Comment = require('../models/commentModel');
const Rating = require('../models/ratingModel');

// FavProjects and Projects relationship
FavProjects.belongsTo(Projects, {
  foreignKey: 'GP_ID',
  as: 'graduationProject',
});

Projects.hasMany(FavProjects, {
  foreignKey: 'GP_ID',
  as: 'favProjects',
});

// WaitingList and Student relationship
WaitingList.belongsTo(Student, { foreignKey: 'Partner_1', as: 'StudentInfo' });
Student.hasMany(WaitingList, {
  foreignKey: 'Partner_1',
  as: 'WaitListEntries',
});

// Student and User relationship
Student.belongsTo(User, { foreignKey: 'Username', targetKey: 'Username' });
User.hasOne(Student, { foreignKey: 'Username', sourceKey: 'Username' });

// Doctor and User relationship
Doctor.belongsTo(User, { foreignKey: 'Username', targetKey: 'Username' });
User.hasOne(Doctor, { foreignKey: 'Username', sourceKey: 'Username' });

// Sellers and User relationship
Sellers.belongsTo(User, { foreignKey: 'Username', targetKey: 'Username' });
User.hasOne(Sellers, { foreignKey: 'Username', sourceKey: 'Username' });

// Items and Sellers relationship
Items.belongsTo(Sellers, { foreignKey: 'Shop_name', as: 'shop' });
Sellers.hasMany(Items, { foreignKey: 'Shop_name', as: 'items' });

// Shop and Sellers relationship
Shop.belongsTo(Sellers, { foreignKey: 'Seller_Username', as: 'seller' });

// Receipt relationships
Receipt.belongsTo(Sellers, { foreignKey: 'shop_name', as: 'shop' });
Receipt.belongsTo(Sellers, { foreignKey: 'Seller_Username', as: 'seller' });
Receipt.belongsTo(User, { foreignKey: 'buyer_Username', as: 'buyer' });

Cart.hasMany(CartItems, { foreignKey: 'cart_id', as: 'CartItemsList' });
CartItems.belongsTo(Cart, { foreignKey: 'cart_id', as: 'ParentCart' });

Cart.belongsToMany(Items, {
  through: CartItems,
  foreignKey: 'cart_id',
  as: 'ItemsInCart',
});
Items.belongsToMany(Cart, {
  through: CartItems,
  foreignKey: 'item_id',
  as: 'CartsContainingItem',
});
// Orders and Receipt relationship
Orders.hasMany(Receipt, { foreignKey: 'order_id', as: 'OrderReceipts' });
Receipt.belongsTo(Orders, { foreignKey: 'order_id', as: 'ParentOrder' });

// Requests and User relationship
Requests.belongsTo(User, { as: 'Sender', foreignKey: 'sender_id' });
Requests.belongsTo(User, { as: 'Recipient', foreignKey: 'recipient_id' });

// Community relationships
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

User.hasMany(FavoriteItems, { foreignKey: 'user_id' });
FavoriteItems.belongsTo(User, { foreignKey: 'user_id' });

Items.hasMany(FavoriteItems, { foreignKey: 'item_id' });
FavoriteItems.belongsTo(Items, { foreignKey: 'item_id' });


User.hasMany(Requests, {
  foreignKey: 'sender_id',
  as: 'SentRequests',
});
User.hasMany(Requests, {
  foreignKey: 'recipient_id',
  as: 'ReceivedRequests',
});

// Items and Offers relationship
Items.hasMany(Offers, {
  foreignKey: 'Item_ID',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Offers.belongsTo(Items, {
  foreignKey: 'Item_ID',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});


User.hasMany(Rating, { foreignKey: 'user_id' });
Items.hasMany(Rating, { foreignKey: 'item_id' });
Rating.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
Rating.belongsTo(Items, { foreignKey: 'item_id' });



// Orders and OrderItems
Orders.hasMany(OrderItems, { foreignKey: 'order_id', as: 'OrderItemsList' });
OrderItems.belongsTo(Orders, { foreignKey: 'order_id', as: 'ParentOrder' });

// Items and OrderItems
Items.hasMany(OrderItems, { foreignKey: 'item_id', as: 'ItemOrderList' });
OrderItems.belongsTo(Items, { foreignKey: 'item_id', as: 'OrderedItem' });

Orders.hasMany(OrderItems, { as: 'OrderItemsAlias', foreignKey: 'order_id' });
OrderItems.belongsTo(Orders, { as: 'OrderItemsAlias', foreignKey: 'order_id' });

OrderItems.belongsTo(Items, { as: 'ItemsAlias', foreignKey: 'item_id' });
Items.hasMany(OrderItems, { as: 'ItemsAlias', foreignKey: 'item_id' });

// Orders - OrderItems Association
Orders.hasMany(OrderItems, { foreignKey: 'order_id', as: 'OrderItems' });
OrderItems.belongsTo(Orders, { foreignKey: 'order_id', as: 'Order' });

// OrderItems - Items Association
OrderItems.belongsTo(Items, { foreignKey: 'item_id', as: 'Item' });
Items.hasMany(OrderItems, { foreignKey: 'item_id', as: 'OrderItems' });





// Submit and Projects loose association
Submit.belongsTo(Projects, {
  as: 'Project', // Alias to reference Projects in joins
});
Projects.hasMany(Submit, {
  as: 'Submissions',
});

// Projects and Students relationship
Projects.belongsTo(Student, {
  as: 'Student1',
  foreignKey: 'Student_1',
  targetKey: 'Username',
});
Projects.belongsTo(Student, {
  as: 'Student2',
  foreignKey: 'Student_2',
  targetKey: 'Username',
});

// User and Cart relationship
User.hasOne(Cart, {
  foreignKey: 'user_id',
  as: 'UserCart',
});
Cart.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'Owner',
});

module.exports = {
  FavProjects,
  Projects,
  WaitingList,
  Student,
  Submit,
  Doctor,
  FavoriteItems,
  Sellers,
  Items,
  Shop,
  Receipt,
  Offers,
  Requests,
  Cart,
  CartItems,
  Orders,
  Users,
  Rating,
};
