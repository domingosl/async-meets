//regex are supported
module.exports = [
    '/status',
    {
        url: /\/meets\/.+/gm,
        methods: ['POST']
    },
    {
        url: '/meets',
        methods: ['GET']
    }
];