const admin = require("firebase-admin");

const appCheckVerification = async (req, res, next) => {
    const appCheckToken = req.header("X-Firebase-AppCheck");

    if (!appCheckToken) {
        return res.status(401).send({message: "Unauthorized [missing Firebase appCheck header]"});
    }

    try {
        await admin.appCheck().verifyToken(appCheckToken);
        return next();
    } catch (err) {
        return res.status(401).send({message: err.message});
    }
};

module.exports = appCheckVerification;
