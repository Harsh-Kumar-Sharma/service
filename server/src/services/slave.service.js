const { db, sequelize } = require('../models');
const { Op } = require('sequelize');

const logger = require('../config/logger');


const getCount = async () => {
    try {

        const timeZone = 'Asia/Kolkata';
        const options = {
            timeZone: timeZone,
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        };
        // Get the current date and time
        let currentDate = new Date();

        // Subtract 72 hours (72 * 60 * 60 * 1000 milliseconds) from the current date
        let dateBefore72Hours = new Date(currentDate.getTime() - (72 * 60 * 60 * 1000));

        // Format the date to display
        let formattedDate = dateBefore72Hours.toISOString();
        const startDate = new Intl.DateTimeFormat('en-US', options).format(new Date(formattedDate));
        const endDate = new Intl.DateTimeFormat('en-US', options).format(new Date());

        let condition = '';
        condition += `PASSAGE_TIME BETWEEN'${startDate.replace(',', ' ')}' AND '${endDate.replace(',', ' ')}' AND `;

        const count = await sequelize.query(`
            SELECT COUNT(*) AS count
            FROM TBL_SLAVE_TRANS
            WHERE ${condition}
                (
                    (PAYMENT_TYPE = 'TG' AND MERGE_STATUS IS NULL AND IS_DUPLICATE IS NULL)
                    OR (PAYMENT_TYPE = 'EX' AND OPERATOR_COMMENT = 'FASTag' AND MERGE_STATUS != 1 AND IS_DUPLICATE != 1)
                )
        `);

        return { condition, count: count[0][0].count };
    } catch (error) {
        logger.error(error);
        throw error; // Re-throw the error for the caller to handle
    }
};

const getSlaveData = async (condition, pageSize, offset) => {
    try {
        const data = await sequelize.query(`
            SELECT TOP(${pageSize}) *
            FROM (
                SELECT ROW_NUMBER() OVER (ORDER BY PASSAGE_TIME ASC) AS RowNum, *
                FROM TBL_SLAVE_TRANS
                WHERE ${condition}
                (
                    (PAYMENT_TYPE = 'TG' AND MERGE_STATUS IS NULL AND IS_DUPLICATE IS NULL)
                    OR (PAYMENT_TYPE = 'EX' AND OPERATOR_COMMENT = 'FASTag' AND MERGE_STATUS != 1 AND IS_DUPLICATE != 1)
                )
            ) AS paginated
            WHERE RowNum > ${offset}
            ORDER BY PASSAGE_TIME ASC
        `);

        return data[0];
    } catch (error) {
        logger.error(error);
        throw error; // Re-throw
    }
}

module.exports = {
    getSlaveData,
    getCount
};
