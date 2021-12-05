const mongoose = require('mongoose');
const publicFields = require("../plugins/public-fields");

const MeetSchema = new mongoose.Schema({

        organizer: {
            name: {
                type: String,
                minlength: 2,
                maxlength: 120,
                required: true
            },
            email: {
                type: String,
                required: true
            }
        },
        presenterTime: {
            type: Number,
            max: 60*5,
            required: true
        },
        discussionPoint: {
            type: String,
            minlength: 2,
            maxlength: 160,
            required: true
        },
        challenge: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Challenge',
        },
        attendees: [
            {
                name: {
                    type: String,
                    minlength: 2,
                    maxlength: 120,
                    required: true
                },
                email: {
                    type: String,
                    required: true
                },
                video: {
                    embedUrl: {
                        type: String,
                        maxlength: 2000
                    },
                    sharedUrl: {
                        type: String,
                        maxlength: 2000
                    },
                    createAt: {
                        type: Date
                    }
                }
            }
        ]
    },
    {collection: 'meetings', timestamps: true}
);

MeetSchema.plugin(publicFields, [
    "_id",
    "organizer",
    "presenterTime",
    "discussionPoint",
    "challenge"
]);

module.exports = exports = mongoose.model('Meet', MeetSchema);
