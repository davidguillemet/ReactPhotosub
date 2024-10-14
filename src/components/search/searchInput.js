import React from 'react';
import { styled } from '@mui/material/styles';
import { green, orange, red } from '@mui/material/colors';
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

import { gsap } from "gsap";
import { useGSAP } from '@gsap/react';

import { useTranslation, debounce } from 'utils';
import { useStateWithDep } from '../hooks';

const SearchIconButton = styled(IconButton)(({theme}) => ({
    padding: 10,
    color: "inherit"
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
                <CircularProgress size={20} color="inherit"/> :
                <SearchIcon fontSize={isMobile ? "small" : "medium"} color="inherit"></SearchIcon>
            }
        </Box>
    );
};

const ResultStatus = ({searchResult}) => {
    const totalCount = searchResult.totalCount;
    if (searchResult.hasError === true) {
        return <ErrorIcon sx={{ml: 1, color: red[400]}} />
    } else if (totalCount === 0) {
        return <WarningIcon sx={{ml: 1, color: orange[400]}} />
    } else if (totalCount > 0) {
        return <Chip color="success" sx={{ml: 1, bgcolor: totalCount > 0 ? green[600] : orange[700]}} label={totalCount}></Chip>
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

    useGSAP(() => {
        if (expanded) {
            if (expandTimelineRef.current === null) {
                const expandTween = gsap.to(containerRef.current, {
                    duration: animationDuration,
                    ease: animationEase,
                    width: `100%`,
                    borderColor: "rgb(255,255,255,0.4)",
                    backgroundColor: 'rgb(255,255,255,0.1)',
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
        scope: containerRef
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
            elevation={!expandable || expanded ? 1 : 0}
            sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                width: expandable ? '56px' : '100%',
                borderRadius: (theme) => theme.shape.borderRadius,
                borderStyle: "solid",
                borderWidth: "1px",
                borderColor: theme => expandable ? 'rgb(255,255,255,0)' : theme.palette.divider,
                backgroundColor: 'rgb(255,255,255,0)',
                py: '2px',
                px: '4px',
                m: 0,
                color: 'inherit',
                '&.withResults': {
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0
                }
            }}
        >
            <SearchIconButton
                disabled={!expandable}
                onClick={expandable ? debouncedOnClickSearchIcon : null}
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
                    color: 'inherit'
                }}
                placeholder={imageCount !== undefined  ? t("inputPlaceHolder", imageCount) : ""}
                autoFocus={true}
                fullWidth
                type="text"
                onChange={onValueChange}
                onFocus={handleOnFocus}
                value={value}
                endAdornment={
                    <IconButton color="inherit" onClick={onClearSearch}>
                        <CloseIcon size="small"/>
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
                        sx={{
                            height: '28px',
                            m: '4px',
                            color: 'inherit' // TODO change divider color in header bar
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
                    <SearchIconButton onClick={onOpenHelp}>
                        <HelpIcon />
                    </SearchIconButton>
                }
            </Box>
        </Paper>
    );
};

export default SearchInput;
