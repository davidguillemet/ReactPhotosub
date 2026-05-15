import React from 'react';
import { isMobile } from 'react-device-detect';
import { useNavigate } from 'react-router';
import { Box, Button, Paper, Stack } from '@mui/material';
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import { Unstable_Popup as Popup } from '@mui/base/Unstable_Popup';
import { size } from '@floating-ui/dom';
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';


import Search, { SearchResult, SearchSettings, defaultSettings, getInitialSearchResult, pushSearchConfigHistory } from 'components/search';
import { HorizontalSpacing, VerticalSpacing } from 'template/spacing';
import { useTranslation } from 'utils';
import TooltipIconButton from 'components/tooltipIconButton';
import ResultGallery from './resultGallery';
import { useAppContext } from 'template/app/appContext';
import { useTheme } from '@mui/material';

const HeaderSearch = ({
    resultPageSize = 6,
    onExpandedChange,
    visible
}) => {

    const theme = useTheme();
    const navigate = useNavigate();
    const { subscribeHistory, unsubscribeHistory } = useAppContext();

    const t = useTranslation("components.search");

    const [ searchResult, setSearchResult ] = React.useState(getInitialSearchResult());
    const [ settings, setSettings ] = React.useState(defaultSettings);
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
    }, []);

    const handleChangeSettings = React.useCallback((settings) => {
        setSettings(settings);
    }, []);

    const handleClose = React.useCallback(() => {
        setResultsOpen(false);
    }, []);

    const onSeeAllResults = React.useCallback(() => {
        handleClose();
        pushSearchConfigHistory(navigate, searchResult.query, settings);
    }, [navigate, searchResult, settings, handleClose]);

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

    const popupMiddlewarePosition = React.useMemo(() => {
        return {
            name: "SearchResultsMiddlewarePosition",
            fn: ({x, y, elements, rects}) => {
                // Set zIndex between Drawer=1200 and Modal=1300 (ExpandedView)
                elements.floating.style.setProperty("z-index", theme.zIndex.drawer + 10);
                return {
                    x: toolbarPadding,
                    y: rects.reference.y + rects.reference.height,
                };
            }
        }
    }, [theme]);

    const popupMiddlewareSizeOptions = React.useMemo(() => {
        return {
            apply: ({availableWidth, availableHeight, elements, rects}) => {
                Object.assign(elements.floating.style, {
                    width: `${window.innerWidth - 2*toolbarPadding}px`,
                    maxHeight: `${Math.max(0, availableHeight - 10)}px`,
                    display: 'flex'
                });
            }
        };
    }, []);

    return (
        <ClickAwayListener onClickAway={handleClose}>
            <Box
                sx={{
                    width: "100%",
                    display: visible ? "flex" : "none"
                }}
            >
                <Search
                    ref={searchInputBoxRef}
                    showExactSwitch={false}
                    pushHistory={false}
                    expandable={true}
                    resultsOpen={resultsOpen}
                    onCloseResults={handleClose}
                    showHelp={!isMobile}
                    onResult={onShowSearchResult}
                    onExpandedChange={onExpandedChange}
                    pageSize={resultPageSize}
                    pageIndex={pageIndex}
                    settings={settings}
                    alignItems='flex-start'
                />
                <Popup
                    open={resultsOpen}
                    anchor={searchInputBoxRef.current}
                    placement="bottom-start"
                    middleware={[
                        size(popupMiddlewareSizeOptions),
                        popupMiddlewarePosition
                    ]}
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
                        <Divider />
                        <VerticalSpacing factor={0.5} />
                        <SearchSettings settings={settings} onChange={handleChangeSettings} />
                        <VerticalSpacing factor={0.5} />
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
                </Popup>
            </Box>
        </ClickAwayListener>
    );
};

export default HeaderSearch;