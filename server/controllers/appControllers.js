const App = require("../models/appModel");
const User = require("../models/userModel");

const getAllPosts = async (req, res) => {
  try {
    const getPosts = await App.find({}).sort({ createdAt: -1 });
    res.status(200).json(getPosts);
  } catch (error) {
    res.status(400).json(error);
  }
};

const getallUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json(error);
  }
};

const getSingleUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ _id: id });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json(error);
  }
};

const createPost = async (req, res) => {
  const username = req.user.username;
  const { post } = req.body;
  try {
    const newPost = await App.create({ posted_by: username, post: post });
    await User.findOneAndUpdate(
      { username },
      {
        $push: {
          posts: { post, post_id: newPost._id },
        },
      }
    );
    res.status(200).json(newPost);
  } catch (error) {
    res.status(400).json(error);
  }
};

const likePost = async (req, res) => {
  const { id } = req.params;
  try {
    const likePost = await App.findOneAndUpdate(
      { _id: id },
      { $inc: { likes: 1 } },
      { new: true }
    );
    const user = likePost.posted_by;
    const post = await User.findOneAndUpdate(
      { username: user, "posts.post_id": id },
      { $inc: { "posts.$.likes": 1 } },
      { new: true }
    );
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json(error);
  }
};

const unlikePost = async (req, res) => {
  const { id } = req.params;
  try {
    const unlikePost = await App.findOneAndUpdate(
      { _id: id },
      { $inc: { likes: -1 } },
      { new: true }
    );
    const user = unlikePost.posted_by;
    const post = await User.findOneAndUpdate(
      { username: user, "posts.post_id": id },
      { $inc: { "posts.$.likes": -1 } },
      { new: true }
    );
    res.status(200).json(post);
  } catch (error) {
    res.statua(400).json(error);
  }
};

const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    const deletePost = await App.findOneAndDelete({ _id: id }, { new: true });
    const user = deletePost.posted_by;
    await User.findOneAndUpdate(
      { username: user },
      {
        $pull: {
          posts: {
            post_id: id,
          },
        },
      },
      { new: true }
    );
    res.status(200).json(deletePost);
  } catch (error) {
    res.status(400).json(error);
  }
};

const savePost = async (req, res) => {
  const { id } = req.params;
  const username = req.user.username;
  try {
    const savePost = await User.findOneAndUpdate(
      { username },
      {
        $push: {
          saved_post: {
            post_id: id,
          },
        },
      },
      { new: true }
    );

    const appStats = await App.findOneAndUpdate(
      { _id: id },
      { $inc: { saved: 1 } },
      { new: true }
    );

    const user = appStats.posted_by;

    await User.findOneAndUpdate(
      { username: user, "posts.post_id": id },
      { $inc: { "posts.$.saved": 1 } }
    );

    res.status(200).json(appStats);
  } catch (error) {
    res.status(400).json(error);
  }
};

const unsavePost = async (req, res) => {
  const { id } = req.params;
  const username = req.user.username;
  try {
    const unsave = await User.findOneAndUpdate(
      { username },
      {
        $pull: {
          saved_post: {
            post_id: id,
          },
        },
      },
      { new: true }
    );

    const appStats = await App.findOneAndUpdate(
      { _id: id },
      { $inc: { saved: -1 } },
      { new: true }
    );

    const user = appStats.posted_by;

    await User.findOneAndUpdate(
      { username: user, "posts.post_id": id },
      { $inc: { "posts.$.saved": -1 } }
    );

    res.status(400).json(unsave);
  } catch (error) {
    res.status(400).json(error);
  }
};

const commentPost = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const username = req.user.username;
  try {
    const commentPost = await App.findOneAndUpdate(
      { _id: id },
      {
        $push: {
          comments: {
            commented_by: username,
            comment: comment,
          },
        },
      },
      { new: true }
    );

    const user = commentPost.posted_by;
    await User.findOneAndUpdate(
      { username: user, "posts.post_id": id },
      {
        $push: {
          "posts.$.comments": {
            commented_by: username,
            comment: comment,
          },
        },
      }
    );
    res.status(200).json(commentPost);
  } catch (error) {
    res.status(400).json(error);
  }
};

const deleteComment = async (req, res) => {
  const { post_id } = req.params;
  const { comment_id } = req.params;
  try {
    const deleteComment = await App.findOneAndUpdate(
      { _id: post_id },
      {
        $pull: {
          comments: {
            _id: comment_id,
          },
        },
      },
      { new: true }
    );
    
    res.status(200).json(deleteComment);
  } catch (error) {
    res.status(400).json(error);
  }
};

const likeComment = async (req, res) => {
  const { post_id } = req.params;
  const { comment_id } = req.params;
  try {
    const like = await App.findOneAndUpdate(
      { _id: post_id, "comments._id": comment_id },
      { $inc: { "comments.$.likes": 1 } },
      { new: true }
    );
    res.status(200).json(like)
  } catch (error) {
    res.status(400).json(error);
  }
};

const unlikeComment = async (req, res) => {
  const { post_id } = req.params;
  const { comment_id } = req.params;
  try {
    const unlike = await App.findOneAndUpdate(
      { _id: post_id, "comments._id": comment_id },
      { $inc: { "comments.$.likes": -1 } },
      { new: true }
    );
    res.status(200).json(unlike)
  } catch (error) {
    res.status(400).json(error);
  }
};

const followUser = async (req, res) => {
  const user = req.user.username;
  const { username } = req.params;
  try {
    const getUserInfo = await User.findOne({ username: user });
    const info = getUserInfo.username;
    const follow = await User.findOneAndUpdate(
      { username: username },
      {
        $push: {
          followers: {
            username: info,
          },
        },
      },
      { new: true }
    );
    res.status(200).json(follow);
  } catch (error) {
    res.status(400).json(error);
  }
};

const unfollowUser = async (req, res) => {
  const user = req.user.username;
  const { username } = req.params;
  try {
    const getUserInfo = await User.findOne({ username: user });
    const info = getUserInfo.username;
    const unfollow = await User.findOneAndUpdate(
      { username: username },
      {
        $pull: {
          followers: {
            username: info,
          },
        },
      },
      { new: true }
    );

    res.status(200).json(unfollow);
  } catch (error) {
    res.status(400).json(error);
  }
};

const searchUsers = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username: username });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json(error);
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const del = await User.findOneAndDelete({ _id: id });
    res.status(200).json(del);
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports = {
  getAllPosts,
  getallUsers,
  getSingleUser,
  createPost,
  likePost,
  unlikePost,
  deletePost,
  savePost,
  unsavePost,
  commentPost,
  deleteComment,
  likeComment,
  unlikeComment,
  followUser,
  unfollowUser,
  searchUsers,
  deleteUser,
};
