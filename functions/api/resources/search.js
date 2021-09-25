const _exactPhraseDelimiter = "/";
const _searchCriteriaMinLength = 3;
const _unnestedTagColumn = "tag";
const _flatTagsRows = "flat_tags";

function extractCriteriaList(queryString) {
    const criteriaArray = [];
    // Regular expression:
    // optional spaces followed by
    //   an optional dash followed by
    //      any character except space and slash
    //    OR
    //      slash, any charater except slash, ending slash
    const criteriaRegexp = new RegExp("[ ]*(-?(?:(?:[^ /]+)|(?:/[^/]+/)))", "g");
    let match = null;
    while ((match = criteriaRegexp.exec(queryString)) !== null) {
        let criteria = match[1]; // One single main group
        let notOption = false;

        if (criteria.startsWith("-")) {
            notOption = true;
            criteria = criteria.substring(1);
        }

        const hasQuotes = criteria.startsWith(_exactPhraseDelimiter) && criteria.endsWith(_exactPhraseDelimiter);
        if (hasQuotes === true) {
            criteria = criteria.slice(1, -1);
        }

        if (criteria.length === 0) {
            continue;
        }

        const criteriaIsValid = criteria.length >= _searchCriteriaMinLength;
        const criteriaObject = {
            "value": criteria,
            "valid": criteriaIsValid,
            "not": notOption,
            "hasQuotes": hasQuotes,
            "phraseDelimiter": _exactPhraseDelimiter,
            "criteriaMinLength": _searchCriteriaMinLength,
        };

        criteriaArray.push(criteriaObject);
    }
    return criteriaArray;
}

function getFinalColumnSelection(config) {
    return config.pool().raw("\"id\", \"name\", \"path\", \"title\", \"description\", \"sizeRatio\", count(*) OVER() AS total_count");
}

function getWhereFunctionFromSingleCriteria(builder, criteria) {
    return builder.orWhereRaw("? = ANY (tags)", [criteria]).orWhere("caption", "like", "% " + criteria + " %");
}

function getWhereFunctionFromCriteria(criteriaObject) {
    return (builder) => {
        let chainedBuilder = getWhereFunctionFromSingleCriteria(builder, criteriaObject.value);
        if (criteriaObject.value.indexOf(" ") !== -1) {
            // The criteria contains a space
            // -> try also with a dash
            // ex: "poisson fantôme" -> "poisson-fantôme"
            const criteriaWithDash = criteriaObject.value.replace(" ", "-");
            chainedBuilder = getWhereFunctionFromSingleCriteria(chainedBuilder, criteriaWithDash);
        }
        if (criteriaObject.value.indexOf("-") !== -1) {
            // The criteria contains a dash
            // -> try also with a space
            // ex: "poisson-fantôme" -> "poisson fantôme"
            const criteriaWithSpace = criteriaObject.value.replace("-", " ");
            getWhereFunctionFromSingleCriteria(chainedBuilder, criteriaWithSpace);
        }
    };
}

// /////////////////////
// - Termes exacts:
//
//   select id, path, name from images
//     where  ('alcyonides' = ANY (tags) or caption like '% alcyionides %')
//     and    NOT ('bait ball' = ANY (tags) or caption like '% bait ball %');
function buildSearchQueryExact(config, criteriaList, page, pageSize) {
    let sqlQuery = config.pool().select(getFinalColumnSelection(config)).from("images");

    for (let criteriaIndex = 0; criteriaIndex < criteriaList.length; criteriaIndex++) {
        const criteriaObject = criteriaList[criteriaIndex];

        const whereClauseFunction = getWhereFunctionFromCriteria(criteriaObject);
        if (criteriaIndex === 0) {
            sqlQuery = criteriaObject.not === true ?
                sqlQuery.whereNot(whereClauseFunction) :
                sqlQuery.where(whereClauseFunction);
        } else {
            sqlQuery = criteriaObject.not === true ?
                sqlQuery.andWhereNot(whereClauseFunction) :
                sqlQuery.andWhere(whereClauseFunction);
        }
    }

    return sqlQuery;
}

function getSelectFromFlatTags(sqlQuery) {
    return sqlQuery.distinct("id", "name", "path", "title", "description", "sizeRatio").from(_flatTagsRows);
}

function addWhereClauseFromFlatTags(sqlQuery, criteria) {
    return criteria.not === false ?
        sqlQuery
            .where(_unnestedTagColumn, "like", `%${criteria.value}%`)
            .orWhere("caption", "like", `%${criteria.value}%`) :
        sqlQuery
            .whereRaw(`id NOT IN (select distinct id from ${_flatTagsRows} where ${_unnestedTagColumn} like '%${criteria.value}%' or caption like '%${criteria.value}%')`);
}
// ////////////////
// - Contient:
//
//     WITH unnestedtags AS (select id, path, name, tags, unnest(tags) as tag from images)
//     select distinct id, path, name, tags from unnestedtags
//     where tag like '%alcyon%' or caption like '%alcyon%'
//     intersect
//     select distinct id, path, name, tags from unnestedtags
//     where id NOT IN (select distinct id from unnestedtags where tag like '%plongeur%' or caption like '%plongeur%')

function buildSearchQueryNotExact(config, criteriaList, page, pageSize) {
    const sqlQuery = config.pool()
        .with(
            _flatTagsRows,
            config.pool().raw(`select id, name, path, title, description, "sizeRatio", coalesce(caption, '') as caption, unnest(tags) as ${_unnestedTagColumn} from images`))
        .with(
            "results",
            (qb) => {
                let sqlQuery = qb;
                const intersectQueries = [];
                for (let criteriaIndex = 0; criteriaIndex < criteriaList.length; criteriaIndex++) {
                    const criteria = criteriaList[criteriaIndex];
                    if (criteriaIndex == 0) {
                        sqlQuery = addWhereClauseFromFlatTags(
                            getSelectFromFlatTags(sqlQuery),
                            criteria);
                    } else {
                        intersectQueries.push(addWhereClauseFromFlatTags(
                            getSelectFromFlatTags(config.pool()),
                            criteria));
                    }
                }
                if (intersectQueries.length > 0) {
                    sqlQuery = sqlQuery.intersect(intersectQueries);
                }
                return sqlQuery;
            })
        .select(getFinalColumnSelection(config))
        .from("results");

    return sqlQuery;
}

module.exports = function(config) {
    // Search for images
    config.app.route("/search")
        .post(async function(req, res, next) {
            const searchData = req.body;
            const page = searchData.page;
            const pageSize = searchData.pageSize;
            const exact = searchData.exact;
            const processId = searchData.processId;

            const searchQuery = searchData.query.trim().toLowerCase();
            const criteriaList = extractCriteriaList(searchQuery);

            if (criteriaList.length === 0) {
                res.json({
                    items: [],
                    criteria: criteriaList,
                    processId: processId,
                });
                return;
            }

            const fullSqlQuery = exact === true ?
                buildSearchQueryExact(config, criteriaList, page, pageSize) :
                buildSearchQueryNotExact(config, criteriaList, page, pageSize);

            fullSqlQuery
                .limit(pageSize)
                .offset(page * pageSize)
                .then((results) => {
                    results.forEach((image) => {
                        // Convert cover property from '2014/misool/DSC_456.jpg' to a real url
                        image.src = config.convertPathToUrl(image.path + "/" + image.name);
                    });
                    res.json({
                        items: results,
                        criteria: criteriaList,
                        query: searchData.query,
                        processId: processId,
                        totalCount: results.length > 0 ? results[0].total_count : 0,
                    });
                }).catch((err) => {
                    config.logger.error(`Failed to search images from query "${searchData.query}"`);
                    config.logger.error(err.toString());
                    res.status(500).end();
                });
        });
};
