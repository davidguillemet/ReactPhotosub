export const QUERY_ERROR = "error";

export function useReactQuery(fetchFunction, argsOrOptions1 = null, argsOrOptions2 = null) {

    const fetchFunctionArgs =
        argsOrOptions1 !== null && Array.isArray(argsOrOptions1) === true ? argsOrOptions1 :
        argsOrOptions2 !== null && Array.isArray(argsOrOptions2) === true ? argsOrOptions2 :
        [];

    const queryOptions =
        argsOrOptions1 !== null && Array.isArray(argsOrOptions1) === false ? argsOrOptions1 :
        argsOrOptions2 !== null && Array.isArray(argsOrOptions2) === false ? argsOrOptions2 :
        {};

    const queryResult = fetchFunction(...fetchFunctionArgs);
    const { isError } = queryResult;
    if (isError === true) {
        // Used by hoc withLoading() to display a generic error message
        const errorPlaceholder =
            queryOptions !== null && queryOptions.errorPlaceholder ? queryOptions.errorPlaceholder :
            QUERY_ERROR;
        queryResult.data = errorPlaceholder;
    }
    return queryResult;
}
