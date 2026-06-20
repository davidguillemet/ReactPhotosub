import React from 'react';
import { styled } from '@mui/material/styles';
import { isMobile } from 'react-device-detect';
import Box from "@mui/material/Box";
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import HelpIcon from '@mui/icons-material/Help';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CircularProgress from '@mui/material/CircularProgress';
import InputBase from '@mui/material/InputBase';
import Chip from "@mui/material/Chip";

import { useTranslation, debounce } from 'utils';
import { useStateWithDep } from '../hooks';
import { useTheme } from '@mui/material/styles';

import { gsap } from "gsap";
import { useGSAP } from '@gsap/react';
gsap.registerPlugin(useGSAP);

const SearchIconButton = styled(IconButton)(({theme}) => ({
    padding: 10
}));

const StatusIcon = ({searchIsRunning}) => {
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: 24,
            height: 24,
            color: 'inherit'
        }}>
            {
                searchIsRunning === true ?
                <CircularProgress size={20} /> :
                <SearchIcon
                    fontSize={isMobile ? "small" : "medium"}
                />
            }
        </Box>
    );
};

const ResultStatus = ({searchResult}) => {
    const totalCount = searchResult.totalCount;
    if (searchResult.hasError === true) {
        return <ErrorIcon sx={{ml: 1,}} color="error"/>
    } else if (totalCount === 0) {
        return <WarningIcon sx={{ml: 1}} color="warning" />
    } else if (totalCount > 0) {
        return <Chip color="success" sx={{ ml: 1 }} label={totalCount}></Chip>
    }

    return null;
}

const SearchInput = ({
    imageCount,
    searchResult,
    running,
    onChange,
    onOpenHelp,
    showResultCount,
    initialValue,
    expandable,
    resultsOpen,
    onCloseResults,
    onExpandedChange,
    onFocus,
    showHelp = true}) => {

    const t = useTranslation("components.search");
    const theme = useTheme();
    const [value, setValue] = useStateWithDep(initialValue);
    const [ expanded, setExpanded ] = React.useState(false);
    const containerRef = React.useRef(null);
    const inputRef = React.useRef(null);
    const inputAdornmentRef = React.useRef(null);

    const onValueChange = React.useCallback((event) => {
        setValue(event.target.value);
        onChange(event.target.value)
    }, [onChange, setValue])

    const onClickSearchIcon = React.useCallback(() => {
        setExpanded(prevExpanded => !prevExpanded);
    }, []);

    const debouncedOnClickSearchIcon = React.useMemo(() => {
        return debounce(onClickSearchIcon, 500, true /* Immediate */);
    }, [onClickSearchIcon]);

    const onClearSearch = React.useCallback(() => {
        onChange('');
    }, [onChange]);

    const handleOnFocus = React.useCallback(() => {
        if (expandable && expanded) {
            // Workaround since "expanded" class is removed from inputBase on focus !!
            inputRef.current.classList.add('expanded');
            if (onFocus) onFocus();
            if (searchResult.totalCount >= 0) {
                containerRef.current.classList.add('withResults');
            }
        }
    }, [onFocus, expandable, expanded, searchResult.totalCount]);

    const animationEase = "power1.inOut";
    const animationDuration = 0.4;
    const expandTimelineRef = React.useRef(null);

    React.useLayoutEffect(() => {
        if (expandTimelineRef.current !== null) {
            expandTimelineRef.current.kill();
            expandTimelineRef.current = null;
        }
    }, []);

    useGSAP(() => {
        if (expanded) {
            if (expandTimelineRef.current === null) {
                const expandTween = gsap.to(containerRef.current, {
                    duration: animationDuration,
                    ease: animationEase,
                    width: `100%`,
                    borderColor: theme.palette.divider,
                    backgroundColor: theme.palette.background.paper,
                    onStart: () => {
                        if (onExpandedChange) onExpandedChange(true);
                    }
                });
                const inputTargets = gsap.utils.toArray([
                    inputRef.current,
                    inputAdornmentRef.current
                ]);
                const showInputTween = gsap.to(inputTargets, {
                    duration: animationDuration,
                    ease: animationEase,
                    opacity: 1,
                    display: 'flex'
                });
                expandTimelineRef.current = gsap.timeline();
                expandTimelineRef.current.add(expandTween);
                expandTimelineRef.current.add(showInputTween, "<");
            }
            expandTimelineRef.current.play().then(() => {
                inputRef.current.children[0].focus();
            });
        } else if (expandTimelineRef.current !== null) {
            if (onCloseResults) onCloseResults();
            if (onExpandedChange) onExpandedChange(false);
            expandTimelineRef.current.reverse();
        }
    }, {
        dependencies: [expanded],
        scope: containerRef,
    });

    React.useEffect(() => {
        if (expandable && expanded) {
            if (resultsOpen) {
                containerRef.current.classList.add('withResults');
            } else {
                containerRef.current.classList.remove('withResults');
            }
        }
    }, [expandable, expanded, resultsOpen]);

    return (
        <Paper
            ref={containerRef}
            elevation={expandable ? 0 : 1}
            sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                width: expandable ? '56px' : '100%',
                borderRadius: (theme) => theme.shape.borderRadius,
                borderStyle: "solid",
                borderWidth: "1px",
                borderColor: theme => expandable ? 'transparent' : theme.palette.divider,
                backgroundColor: 'transparent',
                py: '2px',
                px: '4px',
                m: 0,
                '&.withResults': {
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0
                },
                '&:hover': {    
                    color: theme.palette.text.secondary,
                    ...(!expandable && {
                        borderColor: theme.palette.border.hover,
                    })
                },
                '&:has(div.Mui-focused)': {    
                    color: theme.palette.text.secondary,
                    ...(!expandable && {
                        borderColor: theme.palette.border.focused,
                    })
                }
            }}
        >
            <SearchIconButton
                disabled={!expandable}
                onClick={expandable ? debouncedOnClickSearchIcon : null}
                variant="noBorder"
            >
                <StatusIcon searchIsRunning={running} />
            </SearchIconButton>
            <InputBase
                ref={inputRef}
                sx={{
                    flex: 1,
                    ml: 1,
                    opacity: expandable ? 0 : 1,
                    display: expandable ? 'none' : 'flex',
                }}
                placeholder={imageCount !== undefined  ? t("inputPlaceHolder", imageCount) : ""}
                autoFocus={true}
                fullWidth
                type="text"
                onChange={onValueChange}
                onFocus={handleOnFocus}
                value={value}
                endAdornment={
                    <IconButton
                        onClick={expandable ? debouncedOnClickSearchIcon : onClearSearch}
                        size='small'
                        variant="noBorder"
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            />
            <Box
                ref={inputAdornmentRef}
                sx={{
                    display: expandable ? 'none' : 'flex',
                    alignItems: 'center',
                    opacity: expandable ? 0 : 1,
                }}
            >
                {
                    (showHelp || (showResultCount && searchResult.totalCount !== -1)) &&
                    <Divider
                        color={expandable ? 'lightgrey' : 'grey'}
                        sx={{
                            height: '28px',
                            m: '4px'
                        }}
                        orientation="vertical"
                    />
                }
                {
                    showResultCount &&
                    <ResultStatus searchResult={searchResult} />
                }
                {
                    showHelp &&
                    <SearchIconButton onClick={onOpenHelp} size='small' variant="noBorder">
                        <HelpIcon fontSize='small' sx={{color: "inherit" }}/>
                    </SearchIconButton>
                }
            </Box>
        </Paper>
    );
};

export default SearchInput;
