require('dotenv').config();
const dbConn = require('./api/utils/db');
const Challenges = require('./api/models/challenges');

dbConn
    .then(async db => {

        await Challenges.insertMany([
            {
                name: 'pushups',
                showName: 'Push ups',
                description: "Do the most push ups you can do right after finishing your point"
            },
            {
                name: 'pets',
                showName: 'Pets',
                description: "Present while holding your pet"
            },
            {
                name: 'plank',
                showName: 'Plank!',
                description: "Present while planking"
            },
            {
                name: 'talents',
                showName: 'Talent',
                description: "By the end of your presentation you must show your hidden talent"
            },
            {
                name: 'foodie',
                showName: 'Snack',
                description: "Present while eating a snack"
            },
            {
                name: 'standing',
                showName: 'Stand up!',
                description: "Present while standing up"
            },
            {
                name: 'wow',
                showName: 'Fact',
                description: "Share an interesting fact after your presentation"
            }
        ])

        console.log("Done!");

    })
    .catch(error => {
            console.log("Fail!", {error});
    });