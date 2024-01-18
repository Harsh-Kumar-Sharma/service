const catchAsync = require('../utils/catchAsync');
const slaveService = require('../services/slave.service');
const masterService = require('../services/master.service')
const logger = require('../config/logger');

const convertIntoMaster = async () => {
    try {
        while (true) {
            const count = await slaveService.getCount();
            console.log(count)
            const pageSize = 100; // Set your desired page size

            // Calculate the total number of pages
            const totalPage = Math.ceil(count.count / pageSize);

            for (let i = 0; i < totalPage; i++) {
                const pageNumber = i + 1; // Page numbers are usually 1-indexed

                // Calculate the offset for the current page
                const offset = (pageNumber - 1) * pageSize;

                // Fetch data for the current page
                const masterData = await slaveService.getSlaveData(count.condition, pageSize, offset);

                // Process each record in the current page
                for (let val of masterData) {
                    // Use await here to ensure the asynchronous insert operation completes before moving to the next iteration
                    await masterService.insertMasterTable(val);
                }
            }
        }
    } catch (error) {
        logger.error(error);
    }
};



module.exports = {
    convertIntoMaster,
};
