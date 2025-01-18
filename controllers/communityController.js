const Post = require('../models/postModel');
const Comment = require('../models/commentModel');
const {User} = require('../models/userModel');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');

const createPost = async (req, res, next) => {
  try {
    const { content } = req.body;
    const image = req.file ? req.file.buffer : null;

    if (!req.user || !req.user.Username) {
      return next(new AppError('User information not found in request', 400));
    }

    const createdBy = req.user.Username;

    const post = await Post.create({
      content,
      image,
      createdBy,
      sharedBy: null,
      originalPostId: null,
      likes: 0,
    });

    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    console.error('Error creating post:', error);
    next(error);
  }
};





const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: Comment,
        as: 'comments',
      },
      order: [['createdAt', 'DESC']],
    });

    const processedPosts = posts.map(post => {
      const postJson = post.toJSON();
      return {
        ...postJson,
        image: post.image ? post.image.toString('base64') : null,
        isShared: Boolean(post.sharedBy),
        sharedBy: post.sharedBy || null,
        originalPostId: post.originalPostId || null,
        likes: post.likes,
      };
    });

    res.status(200).json({ posts: processedPosts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    next(error);
  }
};





const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const userId = decoded.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const image = req.file ? req.file.buffer : null;
    const comment = await Comment.create({
      postId,
      content,
      image,
      createdBy: user.Username,
    });

    res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        id: comment.id,
        content: comment.content,
        image: comment.image ? comment.image.toString('base64') : null,
        createdBy: user.Username,
        createdAt: comment.createdAt,
      },
    });
  } catch (error) {
    console.error('Error in addComment:', error.message, error.stack);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};





const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const userId = decoded.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const username = user.Username;

    const post = await Post.findByPk(id);
    if (!post) return next(new AppError('Post not found', 404));

    if (post.createdBy !== username) {
      return res.status(403).json({ message: 'You are not authorized to delete this post' });
    }

    await post.destroy();
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error in deletePost:', error.message, error.stack);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};







const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const userId = decoded.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const username = user.Username;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.createdBy !== username) {
      return res.status(403).json({ message: 'You are not authorized to delete this comment' });
    }

    await comment.destroy();
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error in deleteComment:', error.message, error.stack);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};





const editPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const image = req.file ? req.file.buffer : null;

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const userId = decoded.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const username = user.Username;

    const post = await Post.findByPk(id);
    if (!post) {
      return next(new AppError('Post not found', 404));
    }

    if (post.createdBy !== username) {
      return res.status(403).json({ message: 'You are not authorized to edit this post' });
    }

    if (content) post.content = content;
    if (image) post.image = image;

    await post.save();

    res.status(200).json({
      message: 'Post updated successfully',
      post: {
        ...post.toJSON(),
        image: post.image ? post.image.toString('base64') : null,
      },
    });
  } catch (error) {
    console.error('Error editing post:', error.message, error.stack);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};





const editComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const image = req.file ? req.file.buffer : null;

    // Extract the user ID from the JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const userId = decoded.id;

    // Fetch the Username from the User table
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const username = user.Username;

    // Find the comment by ID
    const comment = await Comment.findByPk(id);
    if (!comment) return next(new AppError('Comment not found', 404));

    // Check if the user is the creator of the comment
    if (comment.createdBy !== username) {
      return res.status(403).json({ message: 'You are not authorized to edit this comment' });
    }

    // Update the comment
    comment.content = content || comment.content;
    comment.image = image || comment.image;
    await comment.save();

    res.status(200).json({
      message: 'Comment updated successfully',
      comment: {
        id: comment.id,
        content: comment.content,
        image: comment.image ? comment.image.toString('base64') : null,
        createdBy: comment.createdBy,
        createdAt: comment.createdAt,
      },
    });
  } catch (error) {
    console.error('Error in editComment:', error.message, error.stack);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};





const countComments = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const count = await Comment.count({ where: { postId } });
    res.status(200).json({ count });
  } catch (error) {
    next(error);
  }
};





const getAllComments = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.findAll({
      where: { postId },
      order: [['createdAt', 'ASC']],
    });

    const commentsWithImages = comments.map(comment => ({
      ...comment.toJSON(),
      image: comment.image ? comment.image.toString('base64') : null,
    }));

    res.status(200).json({ comments: commentsWithImages });
  } catch (error) {
    next(error);
  }
};





const getUserPosts = async (req, res, next) => {
  try {
    const { username } = req.params;
    console.log('Received username:', username); // Debug log

    const posts = await Post.findAll({
      where: { createdBy: username },
      include: {
        model: Comment,
        as: 'comments',
      },
      order: [['createdAt', 'DESC']],
    });

    const processedPosts = posts.map(post => ({
      ...post.toJSON(),
      image: post.image ? post.image.toString('base64') : null,
      likes: post.likes,
      isShared: Boolean(post.sharedBy),
      sharedBy: post.sharedBy || null,
      originalPostId: post.originalPostId || null,
    }));

    res.status(200).json({ posts: processedPosts });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    next(error);
  }
};






const addLike = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await Post.increment('likes', {
      where: { id: postId },
    });

    res.status(201).json({ message: 'Like added successfully', likes: post.likes + 1 });
  } catch (error) {
    console.error('Error in addLike:', error.message, error.stack);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};





const countLikes = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ postId, likes: post.likes });
  } catch (error) {
    console.error('Error in countLikes:', error.message, error.stack);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};





const removeLike = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const token = req.headers.authorization?.split(' ')[1];


    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.likes > 0) {
      await Post.decrement('likes', {
        where: { id: postId },
      });
      res.status(200).json({ message: 'Like removed successfully', likes: post.likes - 1 });
    } else {
      res.status(400).json({ message: 'No likes to remove' });
    }
  } catch (error) {
    console.error('Error in removeLike:', error.message, error.stack);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};




const getAllUsers = async (req, res, next) => {

  const user = await User.findAll();

  res.status(200).send(user);
};





const shareItem = async (req, res, next) => {
  try {
    const { content } = req.body;
    const image = req.file ? req.file.buffer : null;

    if (!req.user || !req.user.Username) {
      return next(new AppError('User information not found in request', 400));
    }

    const createdBy = req.user.Username;

    const post = await Post.create({
      content,
      image,
      createdBy,
      sharedBy: null,
      originalPostId: null,
      likes: 0,
    });

    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    console.error('Error creating post:', error);
    next(error);
  }
};

exports.createPost = createPost;
exports.getAllPosts = getAllPosts;
exports.addComment = addComment;
exports.deletePost = deletePost;
exports.deleteComment = deleteComment;
exports.editPost = editPost;
exports.editComment = editComment;
exports.countComments = countComments;
exports.getAllComments = getAllComments;
exports.getUserPosts = getUserPosts;
exports.addLike = addLike;
exports.countLikes = countLikes;
exports.removeLike = removeLike;
exports.getAllUsers = getAllUsers;
exports.shareItem = shareItem;