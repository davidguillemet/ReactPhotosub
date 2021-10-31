import React from 'react';
import LoadingButton from "@material-ui/core/Button";

import Gallery from '../../components/gallery';
import Search from '../../components/search';
import { PageTitle } from '../../template/pageTypography';

const NextPageButton = ({
    onClick,
    loading,
    count       // The number of images currently displayed
}) => (
    <LoadingButton
        loading={loading}
        sx={{ mt: 3}}
        variant="contained"
        color="primary"
        onClick={onClick}>
            Résultats suivants
    </LoadingButton>
);

const SearchPage = () => {

    return (
        <React.Fragment>
            <PageTitle>Recherche</PageTitle>
            <Search
                showExactSwitch={true}
                galleryComponent={Gallery}
                nextPageComponent={NextPageButton}
            />
        </React.Fragment>
    );
};

export default SearchPage;