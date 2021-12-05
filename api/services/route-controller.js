module.exports = (controllerName, fn) => {

    return async function(req, res) {
        try {
            utilities.logger.debug('Running...', { tagLabel: controllerName });
            await fn(req, res);
        } catch (error) {
            res.apiErrorResponse(error, controllerName);
        }
    };

};