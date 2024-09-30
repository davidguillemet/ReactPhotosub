import React from 'react';
import { isMobile } from 'react-device-detect';
import { useHistory } from 'react-router-dom';
import { Box, Paper } from '@mui/material';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/base/ClickAwayListener';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import SkipNextIcon from '@mui/icons-material/SkipNext';

import Search, { SearchResult, SearchSettings, defaultSettings, getInitialSearchResult, pushSearchConfigHistory } from 'components/search';
import { HorizontalSpacing, VerticalSpacing } from 'template/spacing';
import { useTranslation, useScrollBlock } from 'utils';
import { useResizeObserver } from 'components/hooks';
import TooltipIconButton from 'components/tooltipIconButton';
import ResultGallery from './resultGallery';
import { useAppContext } from 'template/app/appContext';

const popperSizeModifier = {
    name: "SizeModifier",
    enabled: true,
    phase: 'read',
    fn: ({state}) => {
        const popperOffsets = state.modifiersData.popperOffsets;
        const popperMaxHeight = window.innerHeight - popperOffsets.y - 10;
        state.styles.popper = {
            ...state.styles.popper,
            maxHeight: `${popperMaxHeight}px`
        };
    }
};

const HeaderSearch = ({
    resultPageSize = 6,
    onExpandedChange
}) => {

    const history = useHistory();
    const { subscribeHistory, unsubscribeHistory } = useAppContext();

    const t = useTranslation("components.search");

    const [blockScroll, allowScroll] = useScrollBlock();

    const [ searchResult, setSearchResult ] = React.useState(getInitialSearchResult());
    const [ settings, setSettings ] = React.useState(defaultSettings);
    const [ resultsOpen, setResultsOpen ] = React.useState(false);
    const [ loadingNextPage, setLoadingNextPage ] = React.useState(false);
    const [ pageIndex, setPageIndex ] = React.useState(0);

    const searchInputBoxResizeObserver = useResizeObserver();
    const resultsPaperRef = React.useRef(null);

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
        if (onExpandedChange) onExpandedChange(false);
        pushSearchConfigHistory(history, searchResult.query, settings);
    }, [history, searchResult, settings, handleClose, onExpandedChange]);

    const handleNextSearchPage = React.useCallback(() => {
        setLoadingNextPage(true);
        setPageIndex(prevPage => prevPage  + 1);
    }, []);

    React.useEffect(() => {
        if (resultsOpen) {
            blockScroll();
        } else {
            allowScroll();
        }
        return () => {
            allowScroll();
        }
    }, [resultsOpen, blockScroll, allowScroll]);

    React.useEffect(() => {
        if (resultsPaperRef.current === null) return;
        resultsPaperRef.current.width = searchInputBoxResizeObserver.width;
    }, [searchInputBoxResizeObserver.width]);

    React.useEffect(() => {
        const componentId = "headerSearch";
        subscribeHistory(componentId, handleClose);
        return () => unsubscribeHistory(componentId);
    }, [subscribeHistory, unsubscribeHistory, handleClose]);

    return (
        <ClickAwayListener onClickAway={handleClose}>
            <Box sx={{width: "100%"}}>
                <Search
                    ref={searchInputBoxResizeObserver.ref}
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
                <Popper
                    open={resultsOpen}
                    anchorEl={searchInputBoxResizeObserver.element}
                    placement="bottom-start"
                    sx={{ zIndex: theme => theme.zIndex.modal, display: 'flex' }}
                    modifiers={[
                        popperSizeModifier
                    ]}
                >
                    <Paper
                        ref={resultsPaperRef}
                        elevation={6}
                        sx={{
                            borderRadius: (theme) => theme.shape.borderRadius,
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 0,
                            p: (theme) => {
                                return theme.shape.borderRadius / 2;
                            },
                            paddingTop: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            width: `${searchInputBoxResizeObserver.width}px`,
                            backgroundColor: (theme) => theme.palette.background
                        }}
                    >
                        <VerticalSpacing factor={0.5} />
                        <SearchResult result={searchResult} />
                        <Divider />
                        <VerticalSpacing factor={0.5} />
                        <SearchSettings settings={settings} onChange={handleChangeSettings} />
                        <VerticalSpacing factor={0.5} />
                        <ResultGallery
                            searchResult={searchResult}
                            handleNextSearchPage={handleNextSearchPage}
                            loadingNextPage={loadingNextPage}
                        />
                        <VerticalSpacing />
                        <Divider />
                        <VerticalSpacing />
                        <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start'}}>
                            <TooltipIconButton
                                tooltip={t("nextResults")}
                                disabled={!searchResult.hasNext}
                                onClick={handleNextSearchPage}
                                size="medium"
                            >
                                <SkipNextIcon fontSize="inherit" />
                            </TooltipIconButton>
                            <TooltipIconButton
                                tooltip={t("seeAllResults")}
                                disabled={resultPageSize >= searchResult.totalCount}
                                onClick={onSeeAllResults}
                                size="medium"
                            >
                                <SearchIcon fontSize="inherit" />
                            </TooltipIconButton>
                            <HorizontalSpacing factor={1} />
                            <Divider
                                sx={{
                                    height: '28px',
                                    m: '4px'
                                }}
                                orientation="vertical"
                            />
                            <HorizontalSpacing factor={1} />
                            <TooltipIconButton
                                tooltip={t("close")}
                                onClick={handleClose}
                                size="medium"
                            >
                                <CloseIcon fontSize="inherit" />
                            </TooltipIconButton>
                        </Box>
                    </Paper>
                </Popper>
            </Box>
        </ClickAwayListener>
    );
};

export default HeaderSearch;