import React from 'react';
import Button from "@material-ui/core/Button";

import Gallery from '../../components/gallery';
import Search from '../../components/search';
import { PageTitle } from '../../template/pageTypography';

const NextPageButton = ({
    onClick,
    count       // The number of images currently displayed
}) => (
    <Button
        sx={{ mt: 3}}
        variant="contained"
        color="primary"
        onClick={onClick}>
            Voir les images suivantes
    </Button>
);

const SearchPage = () => {

    return (
        <React.Fragment>
            <PageTitle>Recherche</PageTitle>
            <Search
                showExactSwitch={true}
                galleryComponent={<Gallery style={{width: '100%'}} colWidth={300} margin={5}/>}
                nextPageComponent={<NextPageButton />}
            />
        </React.Fragment>
    );
};

export default SearchPage;