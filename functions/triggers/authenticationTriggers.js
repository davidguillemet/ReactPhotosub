const axios = require("axios");
const {apiBaseUrl, verifyCustomTokenApiUrl, logger} = require("./config");

const admin = require("firebase-admin");

exports.deleteUser = async function(user) {
    admin.auth().createCustomToken(user.uid)
        .then((customToken) => {
            return axios.post(verifyCustomTokenApiUrl, {
                token: customToken,
                returnSecureToken: true,
            });
        })
        .then((res) => {
            const idToken = res.data.idToken;
            return axios.delete(apiBaseUrl + "/api/userdata", {
                data: {
                    uid: user.uid,
                    displayName: user.displayName,
                },
                headers: { // Authenticate the request
                    Authorization: `Bearer ${idToken}`,
                },
            });
        })
        .then(() => {
            logger.info(`The data for user ${user.displayName} has been removed.`);
        })
        .catch((error) => {
            logger.error(`Failed to delete data for user ${user.displayName}.`, error);
        });
};
