const axios = require('axios');
const _ = require('lodash');

const helper = require('./common.js');
const databaseModel = require('../model/index.js');
require('dotenv').config();

const { FACEBOOK_GRAPH_API, BACKEND_API_URL } = process.env;

const methods = {};

methods.facebookPost = async (postId) => {
    try {
        // Fetch post details from the database
        const socialMediaPost = await databaseModel.socialMediaPost.findById(postId).lean();

        if (!socialMediaPost) {
            console.error(`No post found with ID: ${postId}`);
            return;
        }

        // Fetch social media accounts
        const socialMedia = await helper.getSocialMedia(socialMediaPost.userId, 'facebook_page_media');

        if (!socialMedia?.accounts?.length) {
            console.error('No Facebook page connected');
            return;
        }

        // Retrieve the Facebook page details
        const pageDetails = _.find(socialMedia.accounts, { id: socialMediaPost.pageId });

        if (!pageDetails) {
            console.error(`Page not connected: ${socialMediaPost.pageId}`);
            return;
        }

        const { access_token: FACEBOOK_ACCESS_TOKEN } = pageDetails;

        // Validate file presence and prepare payload
        const postFile = socialMediaPost.files?.[0];
        if (!postFile) {
            console.error(`No file associated with post ID: ${postId}`);
            return;
        }

        const payload = {
            message: socialMediaPost.message,
            link: `${BACKEND_API_URL}/${postFile}`,
            published: false,
        };

        // Post to Facebook
        const url = `${FACEBOOK_GRAPH_API}/${socialMediaPost.pageId}/feed`;
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${FACEBOOK_ACCESS_TOKEN}`,
            },
        });

        console.log('Facebook post successful:', response.data);
    } catch (error) {
        console.error('Error while posting to Facebook:', error.response?.data || error.message);
    }
};

module.exports = methods;
