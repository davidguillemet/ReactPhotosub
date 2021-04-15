const admin = require("firebase-admin");

async function isAuthenticated(request, response, next) {
    const {authorization} = request.headers;

    if (!authorization) {
        return response.status(401).send({message: "Unauthorized"});
    }

    if (!authorization.startsWith("Bearer")) {
        return response.status(401).send({message: "Unauthorized"});
    }

    const split = authorization.split("Bearer ");
    if (split.length !== 2) {
        return response.status(401).send({message: "Unauthorized"});
    }

    const token = split[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        response.locals = {...response.locals, uid: decodedToken.uid, role: decodedToken.role, email: decodedToken.email};
        return next();
    } catch (err) {
        console.error(`${err.code} -  ${err.message}`);
        return response.status(401).send({message: "Unauthorized"});
    }
}

module.exports = isAuthenticated;
