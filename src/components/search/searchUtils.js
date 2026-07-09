export function getInitialSearchResult() {
    return {
        images: [],
        hasNext: false,
        hasError: false,
        query: "",
        page: 0,
        totalCount: -1
    }
}

export function pushSearchConfigHistory(navigate, query, settings, admin = false) {
    let path = '/search?';
    if (query && query.length > 0) {
        path += new URLSearchParams({query: query}).toString();
    }
    // Don't insert settings in the query string since they are now forced to be exact and fuzzy by default.
    // path += '&';
    // path += `exact=${settings ? settings.exact : false}`;
    // if (admin) {
    //     path += `&fuzzy=${settings ? settings.fuzzy : false}`;
    // }
    navigate(path);
}
