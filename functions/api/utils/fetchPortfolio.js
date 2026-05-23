module.exports = function(config) {
    const fetchPortfolio = (req, res, next, ids) => {
        res.locals.errorMessage = "Failed to load portfolio.";
        return config.pool().raw(
            `SELECT 
                i.*, (
                    SELECT row_to_json(destination_row)
                    FROM (
                        SELECT d.*
                        FROM destinations_with_regionpath d
                        WHERE d.path = i.path
                    ) destination_row
                ) AS destination
            FROM images i
            ${ids ? `WHERE i.id IN (${ids.join(",")})` : "WHERE i.portfolio = true"}
            ORDER BY RANDOM()`) // Random order to avoid always showing the same images when portfolio is enabled
            .then((result) => {
                const images = result.rows;
                images.forEach((image) => {
                    // Convert src property from '2014/misool/DSC_456.jpg' to a real url
                    image.src = config.convertPathToUrl(image.path + "/" + image.name);
                });
                res.json(images);
            }).catch(next);
    };

    return fetchPortfolio;
};
