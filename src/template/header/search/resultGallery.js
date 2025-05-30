import React from 'react';
import { Box } from '@mui/material';
import Gallery from 'components/gallery';
import NextPageButton from './nextPageButton';

const ResultGallery = React.forwardRef(({
    searchResult,
    handleNextSearchPage,
    loadingNextPage
}, ref) => {
    return (
        <Box
            ref={ref}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden'
            }}
        >
            <Gallery
                images={searchResult.images}
                count={searchResult.totalCount}
                hasNext={searchResult.hasNext}
                onNextPage={handleNextSearchPage}
                colWidth="small"
            />
            {
                searchResult.hasNext &&
                <NextPageButton onClick={handleNextSearchPage} loading={loadingNextPage} />
            }
        </Box>
    );
});

export default ResultGallery;