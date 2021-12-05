require('dotenv').config();

const express                   = require('express');
const compression               = require('compression');
const helmet                    = require('helmet');
const path                      = require('path');
const fs                        = require('fs');

const webapp = express();

webapp.disable('x-powered-by');

webapp.use(compression());
webapp.use(helmet({ contentSecurityPolicy: false }));

webapp.use(express.static('./public'));

webapp.get('/meet/:meetId/attendee/:attendeeId', (req, res) => {
    //TODO: USE EJS
    const file = fs.readFileSync(path.join(__dirname, './public/meet.html'), { encoding:'utf8' });
    res.send(file.replace('{{meetId}}', req.params.meetId).replace('{{attendeeId}}', req.params.attendeeId));
});

webapp.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

webapp.listen(process.env.WEBAPP_PORT, () => {
    console.log('Webapp ready!');
});