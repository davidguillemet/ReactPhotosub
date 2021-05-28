module.exports = function(config) {
    // Authentication required for the following routes:
    config.app.use("/simulations", config.isAuthenticated);

    config.app.route("/simulations")
        // get all simulations
        .get(async function(req, res, next) {
            try {
                const dataArray = await config.pool("user_data").select("simulations").where("uid", res.locals.uid);
                let data = [];
                if (dataArray.length > 0) {
                    data = dataArray[0];
                }
                res.json(data);
            } catch (err) {
                config.logger.error(`Failed to load simulations for uid ${req.params.uid}.`, err);
                res.status(500)
                    .send(`Unable to load simulations for uid ${req.params.uid}.`)
                    .end();
            }
        })
        // Add or update a simulation for the authenticated user
        .post(async function(req, res, next) {
            const newSimulation = req.body;
            const newSimulationString = JSON.stringify(newSimulation);
            try {
                let result = null;
                if (newSimulation.dbindex === null || newSimulation.dbindex === undefined) {
                    // Add a simulation
                    result = await config.pool()
                        .raw(`update user_data set simulations = simulations::jsonb || '${newSimulationString}'::jsonb where uid = '${res.locals.uid}' returning simulations`);
                } else {
                    // Update a simulation from its index
                    result = await config.pool()
                        .raw(`update user_data set simulations = jsonb_set(simulations, '{${newSimulation.dbindex}}', '${newSimulationString}', false) where uid = '${res.locals.uid}' returning simulations`);
                }
                res.json(result.rows[0].simulations);
            } catch (err) {
                config.logger.error(`Failed to add a new simulation for user ${res.locals.uid}.`, err);
                res.status(500).send(`Failed to add a new simulation for user ${res.locals.uid}.`).end();
            }
        })
        // Remove a simulation for the authenticated user
        .delete(async function(req, res, next) {
            const deleteData = req.body;
            try {
                const result = await config.pool()
                    .raw(`update user_data set simulations = simulations - ${deleteData.index} where uid = '${res.locals.uid}' returning simulations`);
                res.json(result.rows[0].simulations);
            } catch (err) {
                config.logger.error(`Failed to remove simulation #${deleteData.index} for user ${res.locals.uid}.`, err);
                res.status(500).send(`Failed to remove simulation #${deleteData.index} for user ${res.locals.uid}.`).end();
            }
        });
};
