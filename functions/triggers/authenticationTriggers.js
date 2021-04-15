const axios = require("axios");
const {logger} = require("../utils/logger");

const _baseApiUrl = "https://photosub.web.app";

exports.deleteUser = async function(user) {
    try {
        await axios.delete(_baseApiUrl + "/api/userdata", {
            data: {
                uid: user.uid,
                displayName: user.displayName,
            },
        });
        logger.info(`The data for user ${user.displayName} has been removed.`);
    } catch (error) {
        logger.error(`Failed to delete data for user ${user.displayName}.`, error);
    }
};
