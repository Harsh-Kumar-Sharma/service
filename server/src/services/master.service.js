const { db, sequelize } = require('../models');
const { Op } = require('sequelize');

const logger = require('../config/logger');

const configFile = require('./config')



const insertMasterTable = async (data) => {
    try {
        let duplicate = false;

        const PASSAGE_TIME = new Date(data.PASSAGE_TIME).toISOString().replace(/(\.\d{3})?Z$/, '').replace('T', ' ');
        const RE_TIME = new Date(data.RE_STATUS).toISOString().replace(/(\.\d{3})?Z$/, '').replace('T', ' ');


        const data1 = {
            LANE_TRANS_ID: data.LANE_TRANS_ID,
            ENTRY_TRANS_ID: data.API_TRANS_ID,
            EXIT_TRANS_ID: data.API_TRANS_ID,
            ENTRY_PLAZA_CODE: data.PLAZA_CODE,
            EXIT_PLAZA_CODE: data.PLAZA_CODE,
            ENTRY_LANE_ID: data.LANE_ID,
            EXIT_LANE_ID: data.LANE_ID,
            TAG: data.TAG,
            TAG_TID: data.TAG_TID,
            PAN: data.PAN,
            TAG_PLATE: data.TAG_PLATE,
            VEH_PLATE: data.VEH_PLATE,
            TAG_CLASS: data.TAG_CLASS,
            ENTRY_AVC_CLASS: data.VEH_CLASS,
            EXIT_AVC_CLASS: data.VEH_CLASS,
            VEH_CLASS: data.VEH_CLASS,
            TOLL_FARE: 0,
            OW_FARE: 0,
            ENTRY_PASSAGE_TIME: PASSAGE_TIME,
            EXIT_PASSAGE_TIME: PASSAGE_TIME,
            ENTRY_VEH_IMG: data.VEH_IMG_OCR,
            ENTRY_PLATE_IMG: data.PLATE_IMG_OCR,
            EXIT_VEH_IMG: data.VEH_IMG_OCR,
            EXIT_PLATE_IMG: data.PLATE_IMG_OCR,
            CCH_IS_EXEMPTED: '0',
            CCH_IS_VIOLATED: '0',
            PRICE_MODE: 'POINT',
            CCH_OTHER: null,
            CCH_BATCH_ID: null,
            MODE: data.MODE,
            BLACKLIST: null,
            PRO_STATUS: null,
            API_TRANS_STATUS: data.API_TRANS_STATUS,
            TOLL_FILE_STATUS: 'P',
            DISTANCE: null,
            IS_VIRTUAL: null,
            IS_RESP_RECVD: true,
            JOURNEY_TIME: null,
            AVERAGE_SPEED: null,
            ALLOWED_SPEED: null,
            PAYMENT_TYPE: 'TG',
            PAYMENT_SUBTYPE: 'TG',
            REVIEWER_ID: data.REVIEWER_ID,
            RE_VEH_PLATE: data.RE_VEH_PLATE,
            RE_VEH_CLASS: data.RE_VEH_CLASS,
            RE_TIME: RE_TIME,
            RE_COMMENT: data.RE_COMMENT,
            TRIP_TYPE: null,
            RE_STATUS: data.RE_STATUS,
            IS_OVER_SPEED: null,
            NIC_STATUS: null,
            REASONS: null,
            PENALTY_FARE: data.PENALTY_FARE,
            TOTAL_PENALTY_FARE: null,
            ERROR_CODES: '195'
        }
        const check = await db.TBL_MASTER_TRANS.findOne({
            where: {
                [Op.or]: [{ TAG: data.TAG }, { VEH_PLATE: data.VEH_PLATE }],
                [Op.and]: [{ LANE_TRANS_ID: data.LANE_TRANS_ID }]
            },
            raw: true
        });
        if (check) {
            const timeDifferenceInMilliseconds = data.PASSAGE_TIME - check.EXIT_PASSAGE_TIME;
            const diffenceInMinutes = timeDifferenceInMilliseconds / 60000;

            if ((data.PASSAGE_TIME === check.EXIT_PASSAGE_TIME && data.TAG == check.TAG) || (diffenceInMinutes > 0 && diffenceInMinutes <= 10 && data.TAG == check.TAG)) {
                await sequelize.query(`UPDATE TBL_SLAVE_TRANS
                    SET IS_DUPLICATE=1
                    WHERE TAG='${data.TAG}' AND LANE_TRANS_ID='${data.LANE_TRANS_ID}'`);
                logger.info(`Duplicate transaction ${data.LANE_TRANS_ID}`);
                duplicate = true;
            }
        }
        const checkLaneId = await db.TBL_MASTER_TRANS.findOne({
            where: {
                LANE_TRANS_ID: data.LANE_TRANS_ID
            },
            raw: true
        });

        if (!duplicate && !checkLaneId) {
            try {

                const insert = await db.TBL_MASTER_TRANS.create(data1)
                logger.info(`Inserted transaction ${insert.LANE_TRANS_ID}`);
            }
            catch (err) {
                logger.error(err)
            }
            await sequelize.query(`UPDATE TBL_SLAVE_TRANS
                SET MERGE_STATUS=1, IS_DUPLICATE=0
                WHERE TAG='${data.TAG}' AND LANE_TRANS_ID='${data.LANE_TRANS_ID}'`);
        }
    } catch (err) {
        logger.error(err);
    }
};

const getMasterData = async () => {
    try {
        const data = await db.TBL_MASTER_TRANS.findOne({ where: { ENTRY_TRANS_ID: '536062E02031223114236' }, raw: true });
        return data;
    }
    catch (err) {
        logger.error(err)
    }
}



module.exports = {
    getMasterData,
    insertMasterTable
};
