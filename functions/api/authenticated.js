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
        response.locals = {...response.locals, uid: decodedToken.uid, roles: decodedToken.roles, email: decodedToken.email};
        return next();
    } catch (err) {
        console.error(`${err.code} -  ${err.message}`);
        return response.status(500).send({error: err});
    }
}

function isAuthorized(requiredRoles) {
    return async (request, response, next) => {
        const {roles} = response.locals;
        if (!roles) {
            return response.status(403).send({message: "No Role assigned", locals: response.locals});
        }

        let allRoles = true;
        requiredRoles.forEach((requiredRole) => {
            if (!roles.includes(requiredRole)) {
                allRoles = false;
            }
        });

        if (allRoles === true) {
            return next();
        }

        return response.status(403).send({message: "All required roles are not assigned"});
    };
}

module.exports = {
    isAuthenticated,
    isAuthorized,
};
