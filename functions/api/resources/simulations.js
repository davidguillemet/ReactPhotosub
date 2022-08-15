module.exports = function(config) {
    // Authentication required for the following routes:
    config.app.use("/simulations", config.isAuthenticated);

    config.app.route("/simulations")
        // get all simulations
        .get(async function(req, res, next) {
            res.locals.errorMessage = "Le chargement des compositions a échoué.";
            return config.pool("user_data")
                .select("simulations")
                .where("uid", res.locals.uid)
                .then((dataArray) => {
                    let data = [];
                    if (dataArray.length > 0) {
                        data = dataArray[0];
                    }
                    res.json(data);
                }).catch(next);
        })
        // Add or update a simulation for the authenticated user
        .post(async function(req, res, next) {
            const newSimulation = req.body;
            const newSimulationString = JSON.stringify(newSimulation);
            let promise = null;
            res.locals.errorMessage = `La sauvegarde de la composition '${newSimulation.name}' a échoué.`;
            if (newSimulation.dbindex === null || newSimulation.dbindex === undefined) {
                // Add a simulation
                promise = config.pool()
                    .raw(`update user_data set simulations = simulations::jsonb || '${newSimulationString}'::jsonb where uid = '${res.locals.uid}' returning simulations`);
            } else {
                // Update a simulation from its index
                promise = config.pool()
                    .raw(`update user_data set simulations = jsonb_set(simulations, '{${newSimulation.dbindex}}', '${newSimulationString}', false) where uid = '${res.locals.uid}' returning simulations`);
            }
            return promise.then((result) => {
                res.json(result.rows[0].simulations);
            }).catch(next);
        })
        // Remove a simulation for the authenticated user
        .delete(async function(req, res, next) {
            const deleteData = req.body;
            res.locals.errorMessage = "La suppression de la composition a échoué.";
            return config.pool()
                .raw(`update user_data set simulations = simulations - ${deleteData.index} where uid = '${res.locals.uid}' returning simulations`)
                .then((result) => {
                    res.json(result.rows[0].simulations);
                }).catch(next);
        });
};
