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

export function pushSearchConfigHistory(history, query, settings) {
    const historyConfig = {
        pathname: '/search'
    };
    if (query && query.length > 0) {
        historyConfig.search = '?' + new URLSearchParams({query: query}).toString() + `&exact=${settings ? settings.exact : false}`;
    }
    history.push(historyConfig);
}
