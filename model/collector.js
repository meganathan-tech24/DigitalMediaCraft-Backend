const { Schema } = require('mongoose');

const collectorSchema = new Schema({
    data: Object,
}, { timestamps: true });

module.exports = collectorSchema;
