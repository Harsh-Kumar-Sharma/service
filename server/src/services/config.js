const { db, sequelize } = require('../models');

let configData = {}

async function getConfig() {
    configData = await sequelize.query(`SELECT *
    FROM TBL_MASTER_CONFIG`)
}

// setInterval(getConfig, 2000);


const publicConfig = () => {
    return configData;
}

module.exports = {
    getConfig,
    publicConfig
}