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

export function pushSearchConfigHistory(navigate, query, settings) {
    let path = '/search?';
    if (query && query.length > 0) {
        path += new URLSearchParams({query: query}).toString();
        path += '&';
    }
    path += `exact=${settings ? settings.exact : false}`;
    navigate(path);
}
