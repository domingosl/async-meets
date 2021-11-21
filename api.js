const express                   = require('express');
const cors                      = require('cors');
const bodyParser                = require('body-parser');
const helmet                    = require('helmet');

const api = express();

api.disable('x-powered-by');

api.use(cors());
api.options('*', cors());

api.use(helmet());
api.use(bodyParser.json({limit: '1mb'}));

api.get('/favicon.ico', (req, res) => res.status(204));

api.listen(8081, () => {
    console.log('API ready!');
});