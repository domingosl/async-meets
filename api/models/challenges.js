const mongoose = require('mongoose');
const publicFields = require("../plugins/public-fields");

const ChallengesSchema = new mongoose.Schema({

        name: {
            type: String
        },
        showName: {
            type: String
        },
        description: {
            type: String
        }

    },
    {collection: 'challenges', timestamps: true}
);

ChallengesSchema.plugin(publicFields, [
    "_id",
    "name",
    "showName",
    "description"
]);

module.exports = exports = mongoose.model('Challenge', ChallengesSchema);
