module.exports = function(admin, config) {
    admin.use(config.isAuthenticated, config.isAuthorized(["admin"]));

    require("./bucket")(admin, config);
    require("./destinations")(admin, config);
    require("./subgalleries")(admin, config);
    require("./images")(admin, config);
    require("./regions")(admin, config);
    require("./locations")(admin, config);
    require("./users")(admin, config);
};
