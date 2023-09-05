import { useMemo, useCallback } from 'react';
import { useHistory } from "react-router-dom";
import Box from '@mui/material/Box';
import lazyComponent from '../../components/lazyComponent';
import { useQueryContext } from '../../components/queryContext';
import LabeledDivider from '../../components/labeledDivider/labeledDivider';
import ImageSlider from '../../components/imageSlider';
import { VerticalSpacing } from '../../template/spacing';
import {isMobile} from 'react-device-detect';
import { formatDate, formatDateShort, useLanguage, useTranslation } from '../../utils';
import ImageDescription from 'components/imageDescription';
import Alert from '@mui/material/Alert';
import { withLoading, buildLoadingState } from '../../components/hoc';
import { useReactQuery } from '../../components/reactQuery';

function imageFromCover(destination, language) {
    const dateFormater = isMobile ? formatDateShort : formatDate;
    return {
        src: destination.cover,
        // <destination title> (<destination date>)
        title: `${destination.title} (${dateFormater(new Date(destination.date), language)})`,
        sizeRatio: 1.5, // Cover images are paysage only
        path: destination.path
    }
}

const EmptyRelatedDestinations = () => {
    const t = useTranslation("pages.destination");
    return (
        <Box style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Alert severity="info" elevation={4} variant="filled">{t("info:noRelatedDest")}</Alert>
        </Box>
    );
}

const RelatedDestinationsSlider = withLoading(({destination, related, imageHeight}) => {
    const history = useHistory();
    const { language } = useLanguage();
    const images = useMemo(() => related.filter(dest => dest.id !== destination.id).map(dest => imageFromCover(dest, language)), [related, destination, language]);

    const onSelectDestination = (index) => {
        history.push(`/destinations/${images[index].path}`);
    };

    const renderOverlay = useCallback((image) => {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    color: "#fff",
                    backgroundColor: 'rgba(0, 0, 0, 0.3)'
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translateX(-50%) translateY(-50%)'
                    }}
                >
                    <ImageDescription image={image} />
                </Box>
            </Box>
        )
    }, []);

    return (
        <ImageSlider
            images={images}
            currentIndex={-1}
            onThumbnailClick={onSelectDestination}
            style={{
                mx: {
                    "xs": -1,
                    "sm": 0
                }
            }}
            imageHeight={imageHeight}
            emptyComponent={<EmptyRelatedDestinations/>}
            renderOverlay={renderOverlay}
        />
    );
}, [buildLoadingState("related", [undefined])]);

const imageHeight = isMobile ? 120 : 150;

const RelatedDestinationsSliderController = lazyComponent(({destination}) => {
    const queryContext = useQueryContext();
    const { data } = useReactQuery(queryContext.useFetchRelatedDestinations, [destination.regionpath, destination.macro, destination.wide]);
    return <RelatedDestinationsSlider destination={destination} related={data} imageHeight={imageHeight}/>
}, { height: imageHeight });

const RelatedDestinations = ({destination}) => {
    const t = useTranslation("pages.destination");
    return (
        <Box sx={{ width: "100%"}} >
            <LabeledDivider label={t("relatedDestinations")}></LabeledDivider>
            <VerticalSpacing factor={2} />
            <RelatedDestinationsSliderController destination={destination} />
        </Box>
    );
};

export default RelatedDestinations;