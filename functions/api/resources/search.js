const _exactPhraseDelimiter = "/";
const _searchCriteriaMinLength = 3;
const _unnestedTagColumn = "tag";
const _flatTagsRows = "flat_tags";

// Minimum pg_trgm word_similarity (0..1) for a fuzzy (inclusion) match.
// Lower  -> more typo-tolerant, more noise.
// Higher -> stricter, fewer false positives.
const FUZZY_THRESHOLD = 0.45;

function extractCriteriaList(queryString) {
    const criteriaArray = [];
    // Regular expression:
    // optional spaces followed by
    // an optional dash followed by
    // any character except space and slash
    // OR
    // slash, any character except slash, ending slash
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
    return config.pool().raw("\"id\", \"version\", \"name\", \"path\", \"title\", \"description\", \"sizeRatio\", \"create\", \"tags\", count(*) OVER() AS total_count");
}

function getWhereFunctionFromSingleCriteria(builder, criteria) {
    return builder.orWhereRaw("? = ANY (tags)", [criteria]).orWhere("caption", "like", "% " + criteria + " %");
}

// Builds an exact, tag-scoped predicate for a single criteria, including the
// dash/space variant handling (e.g. "poisson fantôme" <-> "poisson-fantôme").
// Used directly for exact mode, and under whereNot() for exclusion in fuzzy mode.
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

// ////////////////
// - Recherche tolérante aux fautes de frappe (fuzzy / non-exact mode):
//
// Positive criteria are matched fuzzily against the normalized "search_text"
// column (title + description + tags, lowercased and accent-folded by the
// migration) using pg_trgm word_similarity().
//
// Negative criteria ("-term") are matched EXACTLY and tag-scoped, reusing the
// same predicate as exact mode under whereNot(). Exclusion is deliberately NOT
// fuzzy: a fuzzy "-diver" would over-remove (e.g. catch "river"), silently
// dropping valid results. A diver in a picture means "diver" is in the tags,
// so an exact tag match is both safer and truer to the data model.
//
//   select ..., count(*) OVER() as total_count
//   from images
//   where word_similarity(f_unaccent('gorgone'), search_text) >= 0.45        -- include
//     and NOT ('diver' = ANY (tags) or caption like '% diver %')             -- exclude "-diver"
//   order by (word_similarity(f_unaccent('gorgone'), search_text)) desc
//
// Notes:
//   - "search_text" and "f_unaccent" are created by migration_trigram_search.sql.
//   - criteria.value is already lowercased by the route; f_unaccent() removes
//     accents so it matches the normalization of search_text.
//   - The functional word_similarity(...) predicate does not use the GIN index.
//     For a large catalog, switch positive matches to the "<%" operator and
//     SET pg_trgm.word_similarity_threshold per request to hit the index.
// similarityFn: "word_similarity" (broad, prefix-tolerant) or
//               "strict_word_similarity" (whole-word boundaries, fewer false positives)
function buildSearchQueryFuzzy(config, criteriaList, page, pageSize, similarityFn = "word_similarity") {
    let sqlQuery = config.pool()
        .select(getFinalColumnSelection(config))
        .from("images");

    criteriaList.forEach((criteria) => {
        if (criteria.not === true) {
            // Exclusion stays exact and tag-scoped (same predicate as exact mode).
            sqlQuery = sqlQuery.whereNot(getWhereFunctionFromCriteria(criteria));
        } else {
            // Inclusion is fuzzy: typo + accent tolerant against title+description+tags.
            sqlQuery = sqlQuery.whereRaw(
                `${similarityFn}(f_unaccent(?), search_text) >= ?`,
                [criteria.value, FUZZY_THRESHOLD],
            );
        }
    });

    // ORDER BY relevance: sum of similarity across the positive criteria, so
    // images matching every term strongly rank above weaker / partial matches.
    // (Pure-exclusion queries have no positive criteria -> fall back to date order.)
    const positiveCriteria = criteriaList.filter((criteria) => criteria.not !== true);
    if (positiveCriteria.length > 0) {
        const relevanceExpr = positiveCriteria
            .map(() => `${similarityFn}(f_unaccent(?), search_text)`)
            .join(" + ");
        sqlQuery = sqlQuery.orderByRaw(
            `(${relevanceExpr}) desc`,
            positiveCriteria.map((criteria) => criteria.value),
        );
    }

    return sqlQuery;
}

function getSelectFromFlatTags(sqlQuery) {
    return sqlQuery.distinct("id", "version", "name", "path", "title", "description", "sizeRatio", "create", "tags").from(_flatTagsRows);
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
            config.pool().raw(`select id, version, name, path, title, description, "sizeRatio", "create", "tags", coalesce(caption, '') as caption, unnest(coalesce(tags, '{X}')) as ${_unnestedTagColumn} from images`))
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

module.exports = function(app, config) {
    // Search for images
    app.route("/search")
        .post(async function(req, res, next) {
            const searchData = req.body;
            const page = searchData.page;
            const pageSize = searchData.pageSize;
            const processId = searchData.processId;

            // Now we force exact and fuzzy to true, because we don't want to expose these settings to the user.
            // The user should not be able to disable fuzzy search, because it is a key feature of the search engine.
            // But just inn case something goes wrong, we can rollback to the previous behavior by uncommenting
            // the following lines and removing the forced values below.
            // const settings = searchData.settings;
            const exact = true; // settings.exact;
            const fuzzy = true; // settings.fuzzy;

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

            const fullSqlQuery =
                exact === true && fuzzy === true ? buildSearchQueryFuzzy(config, criteriaList, page, pageSize, "strict_word_similarity") :
                    exact === true ? buildSearchQueryExact(config, criteriaList, page, pageSize) :
                        fuzzy === true ? buildSearchQueryFuzzy(config, criteriaList, page, pageSize) :
                            buildSearchQueryNotExact(config, criteriaList, page, pageSize);

            res.locals.errorMessage = `la recherche "${searchData.query}" a échoué.`;
            return fullSqlQuery
                .orderBy("create", "desc") // recent images first (secondary sort after relevance in fuzzy mode)
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
                }).catch(next);
        });
};
