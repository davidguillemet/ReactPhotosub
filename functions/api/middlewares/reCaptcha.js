const axios = require("axios");

async function reCaptcha(req, res, next) {
    // First try to validate the reCaptcha token:
    const secret = process.env.RECAPTCHA_SECRETKEY;
    const token = req.body.token;
    try {
        const verify = await axios.post("https://www.google.com/recaptcha/api/siteverify",
            {
                secret: secret,
                response: token,
            },
            {
                headers: {"Content-Type": "multipart/form-data"},
            });
        // verify =
        // {
        //     "success": true|false,
        //     "challenge_ts": timestamp,  // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
        //     "hostname": string,         // the hostname of the site where the reCAPTCHA was solved
        //     "error-codes": [...]        // optional
        // }
        if (verify.data.success === false) {
            return res.status(500).send("It seems you're a spammer...").end();
        }
        return next();
    } catch (error) {
        return res.status(500).send({error: "An error occurred while verifying the reCaptcha token"}).end();
    }
}

module.exports = reCaptcha;
