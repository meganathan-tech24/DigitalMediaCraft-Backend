const axios = require('axios');
const _ = require('lodash');
const dayjs = require('dayjs');

const helper = require('./common.js');
const databaseModel = require('../model/index.js');
require('dotenv').config();


const { FACEBOOK_GRAPH_API, BACKEND_API_URL } = process.env;

const methods = {};

methods.facebookPost = async (params) => {
    try {
        // Fetch post details from the database
        const socialMediaPost = await databaseModel.socialMediaPost.findOne({ _id: params['postId'], userId: params['userId'] }).lean();

        if (!socialMediaPost) {
            
            return { status: false, message: 'Post not found' };
        }

        // Fetch social media accounts
        const socialMedia = await helper.getSocialMedia(socialMediaPost.userId, 'facebook_page_media');

        if (!socialMedia?.accounts?.length) {
            console.error('No Facebook page connected');
            return { status: false, message: 'No Facebook page connected' };
        }

        // Retrieve the Facebook page details
        const pageDetails = _.find(socialMedia.accounts, { id: socialMediaPost.pageId });

        if (!pageDetails) {
            console.error(`Page not connected: ${socialMediaPost.pageId}`);
            return { status: false, message: 'Page not connected' };
        }

        const { access_token: FACEBOOK_ACCESS_TOKEN } = pageDetails;

        // Validate file presence and prepare payload
        const postFile = socialMediaPost.files?.[0];
        if (!postFile) {
            console.error(`No file associated with post ID: ${params['postId']}`);
            return { status: false, message: 'No file associated with the post' };
        }

        const payload = {
            message: socialMediaPost.message,
            // link: `${BACKEND_API_URL}/${postFile}`,
            link: 'https://images.unsplash.com/photo-1736695454593-421a67c6b627',
            published: !params['published'],
        };

        if (params['published']) {

            if (isNaN(params.scheduledAt)) {
                return { status: false, message: 'Invalid scheduled time' };
            }

            // Set the scheduled publish time to 5 minutes from now
            payload['scheduled_publish_time'] = dayjs().add(10, 'days').utc().unix();
        }

        // Post to Facebook
        const url = `${FACEBOOK_GRAPH_API}/${socialMediaPost.pageId}/feed`;
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${FACEBOOK_ACCESS_TOKEN}`,
            },
        });

        const postRequest = {
            postId: response.data.id,
            accessToken: FACEBOOK_ACCESS_TOKEN,
        };

        const postDetails = await methods.facebookPostDetails(postRequest);

        return { status: true, message: 'Post published successfully', data: postDetails };

    } catch (error) {
        console.log(error);
        console.error('Error while posting to Facebook:', error.response);
    }

    return { status: false, message: 'Facebook post failed' };
};


methods.facebookPostDetails = async (params) => {

    try {
        const { postId, accessToken } = params;

        const url = `${FACEBOOK_GRAPH_API}/${postId}?fields=is_published,message,permalink_url,icon,full_picture,created_time,scheduled_publish_time,backdated_time`;
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return { status: true, message: 'Post details fetched successfully', data: response.data };

    } catch (error) {
        console.error('Error while fetching Facebook post details:', error.response);
    }

    return { status: false, message: 'Failed to fetch post details' };


};

module.exports = methods;
