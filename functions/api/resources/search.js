module.exports = function(config) {
    // Search for images
    config.app.route("/search")
        .post(async function(req, res, next) {
            const searchData = req.body;
            const page = searchData.page;
            const query = searchData.query;
            const pageSize = searchData.pageSize;
            config.pool("images")
                .select("name", "path", "title", "description")
                .limit(pageSize).offset(page * pageSize)
                // title is written in french
                // description in english, but in franch "manta" is extracted as lexeme "mant"...
                // on the other hand stopwork as "the" or "le" are ignored only if we use a config "english" or "french"...
                .whereRaw(`to_tsvector('french', title) @@ to_tsquery('${query}')`)
                .then((results) => {
                    res.json(results);
                }).catch((err) => {
                    config.logger.error(`Failed to search images from query "${query}"`, err);
                    res.status(500).send("Error while searching image.").end();
                });
        });
};
