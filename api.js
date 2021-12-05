require('dotenv').config();
require('./api/utils/i18n');

const tagLabel = 'Initialization routine';

const express                   = require('express');
const cors                      = require('cors');
const bodyParser                = require('body-parser');
const helmet                    = require('helmet');
const mongoose                  = require('mongoose');
const { RateLimiterMongo }      = require('rate-limiter-flexible');


global.api = {
    config: require('./api/config')
};

global.utilities = require('@growishpay/service-utilities');

const dbConn = require('./api/utils/db');

dbConn
    .then(async db => {

        utilities.logger.info(`Successfully connected to MongoDB cluster.`, {tagLabel, env: process.env.ENV});
        await startAPIServer(db);
        return db;

    })
    .catch(error => {

        if (error && error.message && error.message.code === 'ETIMEDOUT') {

            utilities.logger.info('Attempting to re-establish database connection.', {tagLabel});
            mongoose.connect(process.env.DB_SERVER);

        } else {

            utilities.logger.error('Error while attempting to connect to database.', {error});
            if (process.env.ENV !== 'DEVELOPING')
                process.exit();

            utilities.logger.debug('Process exit avoided in DEVELOPING environment');

        }

    });

const rateLimiter           = require('./api/middlewares/rate-limiter');
const apiMiddleware         = require('./api/middlewares/api');
const maintenanceMiddleware = require('./api/middlewares/maintenance');

const api = express();

api.disable('x-powered-by');

api.use(cors());
api.options('*', cors());

api.use(require('morgan')("combined", {"stream": utilities.logger.stream}));
api.use(helmet());
api.use(bodyParser.json({limit: '1mb'}));

//Sets API helper response functions like, resolve, forbidden, etc. and the chains continues next().
api.use(apiMiddleware);

//Checks if the API is in maintenance mode, if true, blocks the chain and returns a maintenance message. If is false: next().
api.use(maintenanceMiddleware);

api.get('/favicon.ico', (req, res) => res.status(204));

async function startAPIServer(db) {


    const globalRateLimiter = new RateLimiterMongo({
        storeClient: db.connection,
        keyPrefix: 'rateLimitsGlobal',
        points: 10, // 10 requests
        duration: 1, // per 1 second by IP
    });

    api.use(rateLimiter.getMiddleware(globalRateLimiter));

    await require('./api/routes')(api);

    api.use(function (error, req, res, next) {

        if (error) {

            utilities.logger.error("API ERROR NOT HANDLED", {error});
            res.status(400).json({code: 400, data: {} });

        }

        next();

    });

    api.listen(process.env.API_PORT, async () => {

        utilities.logger.info('API server running.', {tagLabel, port: process.env.API_PORT});
        utilities.state.increment('restarts');
        utilities.state.set('APILastBootDate', new Date());

        if(process && typeof process.send === 'function') process.send('ready');

        if (process.env.ENABLE_RESTART_NOTIFICATION === 'true')
            utilities.notifier.send('API server running!', {env: process.env.ENV}, 'low');


        //const mailer = new (require('./api/services/mailer'));
        //mailer.setTemplate(1).to("dom", "ing.domingo.sl@gmail.com").setParams({ meet_id: "123" }).send();

    });

}