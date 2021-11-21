const express                   = require('express');
const cors                      = require('cors');
const compression               = require('compression');
const bodyParser                = require('body-parser');
const helmet                    = require('helmet');
const path                      = require('path');

const webapp = express();
const api = express();

webapp.disable('x-powered-by');
api.disable('x-powered-by');

api.use(cors());
api.options('*', cors());

webapp.use(compression());
webapp.use(helmet());

api.use(helmet());
api.use(bodyParser.json({limit: '1mb'}));

api.get('/favicon.ico', (req, res) => res.status(204));

webapp.use(express.static('./public'));

webapp.get('/meet', (req, res) => {
    res.sendFile(path.join(__dirname, './public/meet.html'));
});

webapp.listen(8080, () => {
    console.log('Webapp ready!');
});

api.listen(8081, () => {
    console.log('API ready!');
});

