const fs                        = require('fs');
const appRoot                   = require('app-root-path').path;

module.exports = async api => {

    fs.readdirSync(`${appRoot}/api/routes`).forEach(file => {

        if(file === 'index.js')
            return;

        api.use(require('./' + file));
    });


};