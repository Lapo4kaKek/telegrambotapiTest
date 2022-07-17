const {Sequelize} = require('sequelize');
module.exports = new Sequelize(
    'telega_bot',
    'root',
    'root',
    {
        host:'46.148.224.99',
        port:'6432',
        dialect: `postgres`
    }
)