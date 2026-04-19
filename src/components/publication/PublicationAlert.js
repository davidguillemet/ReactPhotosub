import React from 'react';
import { styled } from "@mui/material/styles";
import { Alert, Button } from '@mui/material';
import { useAsyncFetcher } from 'components/reactRouter';
import { DESTINATION_INTENT_UPDATE } from 'utils/destinations';

export const PublicationAlert = styled(({destination, ...other}) => {

    const { submit: fetcherSubmit } = useAsyncFetcher("PublicationAlert", "/destinations");

    const handlePublish = React.useCallback(() => {
        fetcherSubmit({
            id: destination.id,
            path: destination.path, // Just for query invalidation (see intent handler DESTINATION_UPDATE_INTENT in DestinationsAction.js)
            published: true,
            intent: DESTINATION_INTENT_UPDATE
        }).then(() => {
            // No need to do anything as the query invalidation will trigger a refetch of the destination with the new published value
        });
    }, [fetcherSubmit, destination.id, destination.path]);

    if (destination.published === true) {
        return null;
    }

    return (
        <Alert
            severity='error'
            variant="filled" {...other}
            action={
                <Button size="small" variant='contained' onClick={handlePublish}>
                    Publier
                </Button>
            }
        >
            Cette destination n'est pas publiée.
        </Alert>
    );
})({});