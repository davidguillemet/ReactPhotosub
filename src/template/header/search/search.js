import React from 'react';
import { isMobile } from 'react-device-detect';
import { useNavigate } from 'react-router';
import { Backdrop, Box, Button, ClickAwayListener, Paper, Popper, Portal, Stack } from '@mui/material';
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';


import Search, { SearchResult, defaultSettings, getInitialSearchResult, pushSearchConfigHistory } from 'components/search';
import { HorizontalSpacing, VerticalSpacing } from 'template/spacing';
import { useTranslation } from 'utils';
import TooltipIconButton from 'components/tooltipIconButton';
import ResultGallery from './resultGallery';
import { useAppContext } from 'template/app/appContext';
import { useTheme } from '@mui/material';
import { useAuthContext } from 'components/authentication';

const HeaderSearch = ({
    resultPageSize = 6,
    onExpandedChange,
    visible
}) => {

    const authContext = useAuthContext();
    const theme = useTheme();
    const navigate = useNavigate();
    const { subscribeHistory, unsubscribeHistory } = useAppContext();

    const t = useTranslation("components.search");

    const [ searchResult, setSearchResult ] = React.useState(getInitialSearchResult());
    const [ resultsOpen, setResultsOpen ] = React.useState(false);
    const [ loadingNextPage, setLoadingNextPage ] = React.useState(false);
    const [ pageIndex, setPageIndex ] = React.useState(0);

    const searchInputBoxRef = React.useRef();
    const resultsPaperRef = React.useRef(null);
    const resultsGalleryRef = React.useRef(null);

    const setGalleryResultRef = React.useCallback(element => {
        resultsGalleryRef.current = element;
        if (resultsGalleryRef.current !== null) {
            disableBodyScroll(resultsGalleryRef.current, {
                allowTouchMove: el => {
                    while (el && el !== document.body) {
                        if (el.getAttribute('data-body-scroll-lock-ignore') !== null) {
                            return true;
                        }
                        el = el.parentElement;
                    }
                    return false;
                }});
        }
    }, []);
    React.useEffect(() => {
        if (!resultsOpen) {
            clearAllBodyScrollLocks();
        }
    }, [resultsOpen]);

    React.useEffect(() => {
        return () => {
            clearAllBodyScrollLocks();
        }
    }, []);

    const onShowSearchResult = React.useCallback((searchResult) => {
        setLoadingNextPage(false);
        setResultsOpen(searchResult.totalCount >= 0);
        setSearchResult(searchResult);
        setPageIndex(searchResult.page);
    }, []);

    const handleClose = React.useCallback(() => {
        setResultsOpen(false);
    }, []);

    const onSeeAllResults = React.useCallback(() => {
        handleClose();
        pushSearchConfigHistory(navigate, searchResult.query, defaultSettings, authContext.admin);
    }, [navigate, searchResult, handleClose, authContext.admin]);

    const handleNextSearchPage = React.useCallback(() => {
        setLoadingNextPage(true);
        setPageIndex(prevPage => prevPage  + 1);
    }, []);

    React.useEffect(() => {
        const componentId = "headerSearch";
        subscribeHistory(componentId, handleClose);
        return () => unsubscribeHistory(componentId);
    }, [subscribeHistory, unsubscribeHistory, handleClose]);

    const toolbarPadding = 10;

    const popperModifiers = React.useMemo(() => [
        {
            name: 'customPosition',
            enabled: true,
            phase: 'beforeWrite',
            requires: ['computeStyles'],
            fn({ state }) {
                const { y, height } = state.rects.reference;
                state.styles.popper.left = `${toolbarPadding}px`;
                state.styles.popper.top = `${y + height}px`;
                state.styles.popper.transform = 'none';
                state.styles.popper.width = `${window.innerWidth - 2 * toolbarPadding}px`;
                state.styles.popper.maxHeight = `${Math.max(0, window.innerHeight - y - height - 10)}px`;
            }
        }
    ], []);

    return (
        <>
        <Portal>
            <Backdrop
                open={resultsOpen}
                onClick={handleClose}
                sx={{
                    zIndex: theme.zIndex.appBar - 1,
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                }}
            />
        </Portal>
        <ClickAwayListener onClickAway={handleClose}>
            <Box
                sx={{
                    width: "100%",
                    display: visible ? "flex" : "none"
                }}
            >
                <Search
                    ref={searchInputBoxRef}
                    showSettings={false}
                    pushHistory={false}
                    expandable={true}
                    resultsOpen={resultsOpen}
                    onCloseResults={handleClose}
                    showHelp={!isMobile}
                    onResult={onShowSearchResult}
                    onExpandedChange={onExpandedChange}
                    pageSize={resultPageSize}
                    pageIndex={pageIndex}
                    settings={defaultSettings}
                    alignItems='flex-start'
                />
                <Popper
                    open={resultsOpen}
                    anchorEl={searchInputBoxRef.current}
                    placement="bottom-start"
                    popperOptions={{ strategy: 'fixed' }}
                    modifiers={popperModifiers}
                    sx={{
                        zIndex: theme.zIndex.drawer + 10,
                        display: 'flex',
                    }}
                >
                    <Paper
                        ref={resultsPaperRef}
                        elevation={0}
                        sx={{
                            borderRadius: (theme) => theme.shape.borderRadius,
                            borderColor: (theme) => theme.palette.divider,
                            borderStyle: 'solid',
                            borderWidth: '1px',
                            borderTopWidth: 0,
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 0,
                            p: (theme) => {
                                return theme.shape.borderRadius / 2;
                            },
                            paddingTop: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                        }}
                    >
                        <VerticalSpacing factor={0.5} />
                        <SearchResult result={searchResult} />
                        <ResultGallery
                            ref={setGalleryResultRef}
                            searchResult={searchResult}
                            handleNextSearchPage={handleNextSearchPage}
                            loadingNextPage={loadingNextPage}
                        />
                        <VerticalSpacing />
                        <Divider />
                        <VerticalSpacing />

                        {/* Bottom Toolbar */}
                        <Stack
                            direction="row"
                            sx={{
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <Box sx={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'center'}}>
                                <TooltipIconButton
                                    tooltip={t("nextResults")}
                                    disabled={!searchResult.hasNext}
                                    onClick={handleNextSearchPage}
                                    size="medium"
                                    sx={{mr: 1}}
                                >
                                    <SkipNextIcon fontSize="inherit" />
                                </TooltipIconButton>
                                <Divider
                                    sx={{
                                        height: '28px',
                                        m: '4px'
                                    }}
                                    orientation="vertical"
                                />
                                <HorizontalSpacing factor={0.5} />
                                <TooltipIconButton
                                    tooltip={t("close")}
                                    onClick={handleClose}
                                    size="medium"
                                >
                                    <CloseIcon fontSize="inherit" />
                                </TooltipIconButton>
                            </Box>
                            <Button
                                disabled={resultPageSize >= searchResult.totalCount}
                                onClick={onSeeAllResults}
                                endIcon={<ArrowForwardIcon />}
                                variant="text"
                            >
                                {t("seeAllResults")}
                            </Button>
                        </Stack>
                    </Paper>
                </Popper>
            </Box>
        </ClickAwayListener>
        </>
    );
};

export default HeaderSearch;