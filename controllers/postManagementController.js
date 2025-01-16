const express = require('express');
const _ = require('lodash');
const mongoose = require('mongoose');

const config = require('../common/config');
const facebook = require('../helpers/facebook.js');
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
        const posts = await databaseModel.socialMediaPost.find({ userId }).sort({ createdAt: -1 }).lean();

        const groupedPosts = _.groupBy(posts, 'status');

        return res.status(200).json({ status: true, posts: groupedPosts });

    } catch (error) {
        console.error('Error getting all post:', error);
        return res.status(500).json({ status: false, message: 'Error getting all post' });
    }

};

methods.statusChange = async (req, res) => {

    try {

        const { postId, status, scheduledAt } = res.locals.model;
        const { _id: userId } = res.locals.user;

        if (!mongoose.isObjectIdOrHexString(postId)) return res.status(400).json({ status: false, message: 'Invalid post ID' });

        if (status === 'published') {

            // Publish the post
            const response = await facebook.facebookPost(postId, userId);

            if (!response?.status) return res.status(500).json({ status: false, message: response.message });
            console.log('Facebook post response:', JSON.stringify(response));

            // Update the post status
            const updateOne = {
                status: 'published',
                publishedAt: new Date(),
                externalPostId: response.data.id,
                externalLink: response.data.permalink_url
            };

            const pushOne = {
                ...response.data,
                timestamp: new Date(),
                status: 'published'
            };

            await databaseModel.socialMediaPost.updateOne({ _id: postId }, { $set: updateOne, $push: { postHistory: pushOne } });

            return res.status(200).json({ status: true, message: response.message });

        } else if (status === 'scheduled') {

            // Schedule the post
            const request = {
                postId: postId,
                userId: userId,
                published: true,
                scheduledAt: scheduledAt
            };

            const response = await facebook.facebookPost(request);

            if (!response?.status) return res.status(500).json({ status: false, message: response.message });
            console.log('Facebook post response:', JSON.stringify(response));

            // Update the post status
            const updateOne = {
                status: 'scheduled',
                publishedAt: new Date(),
                externalPostId: response.data.id,
                scheduledAt: scheduledAt,
                externalLink: response.data.permalink_url
            };

            const pushOne = {
                ...response.data,
                timestamp: new Date(),
                status: 'scheduled'
            };

            await databaseModel.socialMediaPost.updateOne({ _id: postId }, { $set: updateOne, $push: { postHistory: pushOne } });

            return res.status(200).json({ status: true, message: 'Post scheduled successfully' });

        }

    } catch (error) {
        console.error('Error changing status:', error);
        return res.status(500).json({ status: false, message: 'Error changing status' });
    }

    return false;

};

router.post('/upload', uploader.multiFileUpload(), methods.upload);
router.post('/create', validate(joiSchema.createPost), methods.create);
router.post('/status', validate(joiSchema.statusChange), methods.statusChange);
router.get('/all', methods.getAllPost);

module.exports = { methods, router };
