import React from 'react';
import { styled } from "@mui/material/styles";
import { Alert, Button } from '@mui/material';
import { useQueryContext } from 'components/queryContext';

export const PublicationAlert = styled(({destination, ...other}) => {

    const queryContext = useQueryContext();
    const updateDestinationMutation = queryContext.useUpdateDestination();

    const handlePublish = React.useCallback(() => {
        return updateDestinationMutation.mutateAsync({
            id: destination.id,
            path: destination.path, // Just for query invalidation (see queryContext.useUpdateDestination)
            published: true
        });
    }, [updateDestinationMutation, destination.id, destination.path]);

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