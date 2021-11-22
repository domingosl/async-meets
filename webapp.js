const express                   = require('express');
const cors                      = require('cors');
const compression               = require('compression');
const bodyParser                = require('body-parser');
const helmet                    = require('helmet');
const path                      = require('path');

const webapp = express();

webapp.disable('x-powered-by');

webapp.use(compression());
webapp.use(helmet({ contentSecurityPolicy: false }));

webapp.use(express.static('./public'));

webapp.get('/meet', (req, res) => {
    res.sendFile(path.join(__dirname, './public/meet.html'));
});

webapp.listen(8080, () => {
    console.log('Webapp ready!');
});
