
module.exports = {
    v1: [
        {
            path: '/oauth',
            controller: '../controllers/oauthUserController.js'
        },
        {
            path: '/digital-media',
            controller: '../controllers/mediaConnection.js'
        },
        {
            path: '/post',
            controller: '../controllers/postManagementController.js'
        }
    ]
};
