const DataError = (error) => {
    if (typeof error === 'string') {
        return {
            error: {
                message: error
            }
        }
    }
    return {
        error
    };
};

export default function actionFactory(queryClient, dataProvider, actionProperties) {

    const { initializeIntentHandlers, validateFormData, getQueryKey } = actionProperties;

    const intentHandlers = initializeIntentHandlers(queryClient, dataProvider);

    return async ({request, params}) => {

        // Ensure the Content-Type is application/json
        // => submit shall be called with options as { method: "post", encType: "application/json" })
        if (request.headers.get("Content-Type") !== "application/json") {
            return DataError("Unsupported Media Type");
            // throw new Response("Unsupported Media Type", { status: 415 });
        }

        const formData = await request.json();

        if (!formData.intent) {
            return DataError("Missing intent");
            //throw new Response("Bad Request: Missing intent", { status: 400 });
        }

        const handler = intentHandlers.get(formData.intent);
        if (handler === undefined) {
            return DataError(`No handler found for intent '${formData.intent}'`);
            // throw new Response(`No handler found for intent ${formData.intent}`, { status: 400 });
        }

        if (validateFormData) {
            try {
                validateFormData(formData);
            } catch (error) {
                return DataError(error);
            //     if (error instanceof Response) {
            //         throw error;
            //     }
            //     throw new Response(error.message, { status: 400 });
            }
        }

        try {
            const mutationResult = await handler.call(formData);
            const queryKey = getQueryKey(formData);
            const prevQueryData = queryClient.getQueryData(queryKey);
            const newQueryData = await handler.updateCache(prevQueryData, mutationResult, formData);
            queryClient.setQueryData(queryKey, newQueryData);
        } catch (e) {
            return DataError(e);
        }

        return formData.intent;
    }
};
