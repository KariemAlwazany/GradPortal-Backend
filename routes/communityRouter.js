const express = require('express');
const authController = require('./../controllers/authController');
const community = require('./../controllers/communityController');
const upload = require('./../middleware/multer'); 

const router = express.Router();
router.use(authController.protect);

router.post('/createPost', upload.single('image'), community.createPost);
router.post('/addComment/:postId', community.addComment);
router.post('/addLike/:postId', community.addLike);
router.post('/removeLike/:postId', community.removeLike);

router.patch('/editPost/:id', community.editPost);
router.patch('/editComment/:id', community.editComment);

router.get('/getAllPosts', community.getAllPosts);
router.get('/getAllComments/:postId', community.getAllComments);
router.get('/countComments', community.countComments);
router.get('/getUserPosts/:username', community.getUserPosts);
router.get('/countLikes/:postId', community.countLikes);
router.get('/getAllUsers', community.getAllUsers);

router.delete('/deletePost/:id', community.deletePost);
router.delete('/deleteComment/:id', community.deleteComment);

module.exports = router;