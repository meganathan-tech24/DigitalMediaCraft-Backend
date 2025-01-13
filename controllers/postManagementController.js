const express = require('express');
const _ = require('lodash');

const config = require('../common/config');
const FileUploader = require('../helpers/fileUpload');
const joiSchema = require('../helpers/joiSchema');
const validate = require('../helpers/requestValidation');
const databaseModel = require('../model/index.js');

const router = express.Router();

const methods = {};
const uploader = new FileUploader('./public/uploads/posts');

methods.upload = async (req, res) => {
    try {

        const files = _.map(req.files, file => config.normalize(file.path));
        return res.status(200).json({ status: true, files });
    } catch (error) {
        console.error('Error during file upload:', error);
        return res.status(500).json({ status: false, message: 'File upload failed' });
    }
};

methods.create = async (req, res) => {
    try {
        const post = res.locals.model;
        const { _id: userId } = res.locals.user;

        const model = {
            ...post,
            userId,
            status: post.status || 'draft',
        };

        await databaseModel.socialMediaPost.create(model);

        return res.status(200).json({ status: true, message: 'Post created successfully' });
    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json({ status: false, message: 'Post creation failed' });
    }
};

methods.getAllPost = async (req, res) => {

    try {
        const { _id: userId } = res.locals.user;
        const posts = await databaseModel.socialMediaPost.find({ userId });

        const groupedPosts = _.groupBy(posts, 'status');

        return res.status(200).json({ status: true, posts: groupedPosts });

    } catch (error) {
        console.error('Error getting all post:', error);
        return res.status(500).json({ status: false, message: 'Error getting all post' });
    }

};

router.post('/upload', uploader.multiFileUpload(), methods.upload);
router.post('/create', validate(joiSchema.createPost), methods.create);
router.get('/all', methods.getAllPost);

module.exports = { methods, router };
