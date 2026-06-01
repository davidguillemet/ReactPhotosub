// ============================================================
// DAVID PHOTOSUB — MUI Theme
// Direction : Deep Ocean Editorial
// Palette   : Abyssal navy · Phosphor cyan · Deep azure · Pearl
// Typo      : Newsreader (display) + Inter (body/ui) + JetBrains Mono
// ============================================================
//
// INSTALLATION des polices (dans ton index.html ou index.css) :
// <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
//
// USAGE :
//   import deepOceanTheme from './deepOceanTheme';
//   <ThemeProvider theme={deepOceanTheme}><CssBaseline />{...}</ThemeProvider>
// ============================================================

import { createTheme } from '@mui/material/styles';
import { isMobile } from 'react-device-detect';

// ── Tokens bruts — issus des CSS custom properties de deepOcean.css ──
// oklch → hex/rgba approximations (for MUI color utilities compatibility)
const tokens = {
    bg: '#030a11',                  // --bg:   oklch(0.14 0.02 240)
    bg1: '#03111b',                 // --bg-1: oklch(0.17 0.03 240)
    bg2: '#051828', //'#071a27',  // --bg-2: oklch(0.21 0.035 240)
    ink: '#eff2f5',                 // --ink:  oklch(0.96 0.005 240)
    ink2: '#b2b8bd',                // --ink-2: oklch(0.78 0.01 240)
    ink3: '#737c82',                // --ink-3: oklch(0.58 0.015 240)
    line: 'rgba(32,42,50,0.6)',     // --line: oklch(0.28 0.02 240 / 0.6)
    lineStrong: 'rgba(60,74,84,0.7)',   // --line-strong: oklch(0.4 0.025 240 / 0.7)
    accent: '#17d0d8',                  // --accent: oklch(0.78 0.13 200) — phosphor cyan
    accentLight: '#26d4e8',
    accentDark: '#009aab',
    accentDim: 'rgba(0,192,212,0.12)',
    accentGlow: 'rgba(0,192,212,0.35)',
    accent2: '#168dd9',               // --accent-2: oklch(0.62 0.15 245) — deep azure
    accent2Light: '#3a8fe0',
    accent2Dark: '#1050a0',
    warning: '#e7bc81',                    // --warm: oklch(0.82 0.09 75) — lamp warm
    warningLight: '#f0d48a',
    link: '#4dcfe0',
    linkHover: '#7ddee8',
    linkActive: '#eff2f5', // ink

    // status colors
    errorMain: '#f87171',
    successMain: '#4ade80',
};

// ── Breakpoints ────────────────────────────────────────────
const breakpoints = {
    values: { xs: 0, sm: 560, md: 900, lg: 1280, xl: 1480 },
};

// ── Thème complet ────────────────────────────────────────────
export const deepOceanTheme = createTheme({
    breakpoints,

    // Custom token pour largeur max des pages (cards, sections) — à utiliser dans les composants avec theme.pageWidth
    pageWidth: {
        maxWidth: '800px',
        width: '98%'
    },

    // ════════════════════════════════════════
    // PALETTE
    // ════════════════════════════════════════
    palette: {
        mode: 'dark',

        primary: {
            main: tokens.accent,
            light: tokens.accentLight,
            dark: tokens.accentDark,
            contrastText: tokens.bg,
        },

        secondary: {
            main: tokens.accent2,
            light: tokens.accent2Light,
            dark: tokens.accent2Dark,
            contrastText: tokens.ink,
        },

        background: {
            default: tokens.bg,
            paper: tokens.bg1,
            paperLight: tokens.bg2,
        },

        text: {
            primary: tokens.ink,
            secondary: tokens.ink2,
            disabled: 'rgba(190,202,214,0.35)',
            muted: '#7BAFC8',
        },

        border: {
            main: '#0d3654',
            hover: tokens.ink2,
            focused: tokens.accent,
        },

        line: tokens.line,

        divider: tokens.lineStrong,

        error: {
            main: tokens.errorMain,
            light: '#fca5a5',
            dark: '#dc2626',
            contrastText: tokens.bg,
        },
        warning: {
            main: tokens.warning,
            light: '#f0d48a',
            dark: '#c0984a',
            contrastText: tokens.bg,
        },
        success: {
            main: tokens.successMain,
            light: '#86efac',
            dark: '#16a34a',
            contrastText: tokens.bg,
        },
        info: {
            main: tokens.accent,
            light: tokens.accentLight,
            dark: tokens.accentDark,
            contrastText: tokens.bg,
        },

        // Liens inline — cyan atténué, lisible sur fond sombre sans concurrencer l'accent
        link: {
            main:   tokens.link,  // phosphor cyan adouci — lumineux mais pas agressif
            hover:  tokens.linkHover,  // légèrement plus clair au survol
            active: tokens.linkActive, // page courante — pleine luminosité, neutre (comme .nav-links a.active)
        },
    },

    // ════════════════════════════════════════
    // TYPOGRAPHIE
    // ════════════════════════════════════════
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
        fontWeightLight: 300,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 600,
        htmlFontSize: 15,

        // ── Display / Titres (Newsreader) ──────────────────────
        // clamp() values are moved to MuiTypography styleOverrides to avoid
        // MUI's internal pxToRem() producing invalid rem values on non-numeric strings.
        h1: {
            fontFamily: '"Roboto", Georgia, serif', //'"Open Sans", sans-serif',
            fontWeight: 200,
            fontSize: 'clamp(1.5rem, 6.5vw, 3rem)',
            lineHeight: 0.95,
            letterSpacing: '0.05em', //'-0.02em',
            color: tokens.ink,
            textTransform: "uppercase"
        },
        h2: {
            fontFamily: '"Roboto", Georgia, serif',
            fontWeight: 200,
            fontSize: 'clamp(1.35rem, 6vw, 2.5rem)', // '3.5rem',
            lineHeight: 1.0,
            letterSpacing: '-0.02em',
            color: tokens.ink,
        },
        h3: {
            fontFamily: '"Roboto", Georgia, serif',
            fontWeight: 200,
            fontSize: 'clamp(1.25rem, 2.5vw, 2.1rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            color: tokens.ink
        },
        h4: {
            fontFamily: '"Roboto", Georgia, serif',
            fontWeight: 400,
            fontSize: 'clamp(1.25rem, 2vw, 1.8rem)',
            lineHeight: 1.25,
            letterSpacing: '0.05em',
            color: tokens.ink,
        },
        h5: {
            fontFamily: '"Roboto", Georgia, serif',
            fontWeight: 400,
            fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
            lineHeight: 1.2,
            color: tokens.ink,
        },
        h6: {
            fontFamily: '"Roboto", Georgia, serif',
            fontWeight: 400,
            fontSize: 'clamp(1.15rem, 2vw, 1.25rem)',
            lineHeight: 1.5,
            color: tokens.ink,
        },

        // ── Body (Inter) ────────────────────────────────────────
        body1: {
            fontFamily: '"Inter", sans-serif',
            fontWeight: 300,
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            lineHeight: 1.5,
            color: tokens.ink2,
        },
        body2: {
            fontFamily: '"Inter", sans-serif',
            fontWeight: 300,
            fontSize: 'clamp(0.9rem, 1.8vw, 1.2rem)',
            lineHeight: 1.5,
            color: tokens.ink2,
        },

        // ── Labels / UI ────────────────────────────────────────
        subtitle1: {
            fontFamily: '"Inter", sans-serif',
            fontWeight: 400,
            fontSize: 'clamp(0.8rem, 1.3vw, 0.9rem)',
            lineHeight: 1.6,
            color: tokens.ink,
        },
        subtitle2: {
            fontFamily: '"Inter", sans-serif',
            fontWeight: 500,
            fontSize: 'clamp(0.7rem, 1.1vw, 0.8rem)',
            lineHeight: 1.5,
            letterSpacing: '0.05em',
            color: tokens.ink,
        },

        // ── Overline — correspond au style .eyebrow du CSS ─────
        overline: {
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontWeight: 400,
            fontSize: 'clamp(0.6rem, 1vw, 0.7rem)',
            lineHeight: 1.5,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: tokens.ink3,
        },

        // ── Caption ────────────────────────────────────────────
        caption: {
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontWeight: 400,
            fontSize: 'clamp(0.55rem, 0.9vw, 0.65rem)',
            lineHeight: 1.5,
            letterSpacing: '0.06em',
            color: tokens.ink2,
        },

        // ── Boutons ─────────────────────────────────────────────
        // Note: MuiButton/MuiTab/MuiToggleButton override fontSize via styleOverrides,
        // so this only affects Typography variant="button" used standalone.
        button: {
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontWeight: 500,
            fontSize: 'clamp(0.6rem, 1vw, 0.7rem)',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
        },
    },

    // ════════════════════════════════════════
    // SHAPE — 2px radius, très angulaire (--radius: 2px)
    // ════════════════════════════════════════
    shape: {
        borderRadius: 3, // 2px is too sharp for MUI's hover effects, 3px is a good compromise to keep the edgy style while allowing subtle rounding on hover
    },

    // ════════════════════════════════════════
    // SHADOWS
    // ════════════════════════════════════════
    shadows: [
        'none',
        `0 1px 4px rgba(0,0,0,.5)`,
        `0 2px 8px rgba(0,0,0,.55)`,
        `0 4px 16px rgba(0,0,0,.6)`,
        `0 6px 24px rgba(0,0,0,.6)`,
        `0 8px 32px rgba(0,0,0,.65)`,
        `0 0 0 1px ${tokens.accentDim}`,     // shadow[6] = glow border
        `0 0 16px ${tokens.accentGlow}`,      // shadow[7] = glow cyan
        `0 0 32px ${tokens.accentGlow}`,      // shadow[8] = glow fort
        `0 30px 100px rgba(0,0,0,.6)`,        // shadow[9] = lightbox / dialog
        ...Array(15).fill('none'),
    ],

    // ════════════════════════════════════════
    // TRANSITIONS — calées sur les durées du CSS (.2s, .35s, .55s, .9s)
    // ════════════════════════════════════════
    transitions: {
        duration: {
            shortest: 150,
            shorter: 200,
            short: 250,
            standard: 350,
            complex: 550,
            enteringScreen: 350,
            leavingScreen: 200,
        },
        easing: {
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
            easeOut: 'cubic-bezier(0.2, 0.7, 0.2, 1)',  // cubic-bezier du CSS (.2,.7,.2,1)
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
        },
    },

    // ════════════════════════════════════════
    // COMPOSANTS — surcharges
    // ════════════════════════════════════════
    components: {

        // ── Typography — responsive clamp() sizes ─────────────
        // MuiTypography: {
        //     styleOverrides: {
        //         h1: { fontSize: 'clamp(1.25rem, 7vw, 3.5rem)' },
        //         h2: { fontSize: 'clamp(2.5rem, 6.5vw, 120px)' },
        //         h3: { fontSize: 'clamp(1.8rem, 4vw, 3rem)' },
        //         h4: { fontSize: 'clamp(1rem, 2.5vw, 2.2rem)' },
        //         h6: { fontSize: 'clamp(0.75rem, 2vw, 1.15rem)' },
        //     },
        // },

        // ── CssBaseline ───────────────────────────────────────
        MuiCssBaseline: {
            styleOverrides: `
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
          margin: 0;
          background-color: ${tokens.bg};
          color: ${tokens.ink};
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
          font-size: 15px;
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
          overflow-x: hidden;
        }
        ::selection {
          background: ${tokens.accentDim};
          color: ${tokens.accent};
        }
        img { display: block; max-width: 100%; }
        a { color: inherit; text-decoration: none; }
        button { font: inherit; }
      `,
        },

        // ── Button ────────────────────────────────────────────
        MuiToggleButton: {
            defaultProps: {
                size: "small"
            },
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: 2,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontWeight: 500,
                    fontSize: '0.8rem',
                    transition: 'all 0.5s ease',
                    padding: '8px 10px',
                    [theme.breakpoints.down('sm')]: {
                        fontSize: '0.7rem',
                        padding: '6px 8px',
                    },
                }),
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
                variant: "outlined",
                size: "small"
            },
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: 2,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontWeight: 500,
                    fontSize: '0.65rem',
                    transition: 'all 0.5s ease',
                    padding: '10px 14px',
                    [theme.breakpoints.down('sm')]: {
                        fontSize: '0.55rem',
                        padding: '8px 10px',
                    },
                }),
                contained: {
                    background: tokens.ink,
                    color: tokens.bg,
                    border: `1px solid ${tokens.ink}`,
                    '&:hover': {
                        background: tokens.ink2,
                        color: tokens.bg,
                    },
                    '&:active': { transform: 'translateY(0)' },
                },
                outlined: {
                    borderColor: tokens.ink3,
                    color: tokens.ink3,
                    borderWidth: '1px',
                    '&:hover': {
                        background: tokens.ink3,
                        color: tokens.bg,
                        borderWidth: '1px',
                    },
                },
                text: {
                    color: tokens.accent,
                    padding: '12px 0',
                    '&:hover': {
                        color: tokens.linkHover,
                        background: 'transparent',
                    },
                },
                },
            variants: [
                {
                    props: { variant: 'outlined', color: 'primary' },
                    style: {
                        borderColor: tokens.ink,
                        color: tokens.ink,
                        '&:hover': {
                            background: tokens.ink,
                            borderColor: tokens.ink,
                            color: tokens.bg,
                        },
                    },
                },
                {
                    props: { variant: 'contained', color: 'primary' },
                    style: {
                        background: tokens.accent,
                        color: tokens.bg,
                        '&:hover': {
                            background: tokens.accentLight,
                            boxShadow: `0 8px 24px ${tokens.accentGlow}`,
                        },
                    },
                },
                {
                    props: { variant: 'contained', color: 'secondary' },
                    style: {
                        background: tokens.accent2,
                        color: tokens.ink,
                        '&:hover': {
                            background: tokens.accent2Dark,
                            boxShadow: `0 8px 24px ${tokens.accentGlow}`,
                            color: tokens.ink
                        },
                    },
                },
            ],
        },

        // ── IconButton ────────────────────────────────────────
        MuiIconButton: {
            defaultProps: {
                size: "small"
            },
            styleOverrides: {
                root: {
                    color: tokens.ink2,
                    border: `1px solid ${tokens.ink3}`,
                    transition: 'all 0.2s',
                    '&:hover': {
                        color: tokens.ink,
                        background: tokens.accentGlow,
                    },
                    "&.Mui-disabled": {
                        color: tokens.ink3,
                        borderColor: tokens.ink3,
                    }
                },
            },
            variants: [
                {
                    props: { variant: 'noBorder' },
                    style: {
                        border: 'none',
                        '&:hover': {
                            background: 'transparent',
                        },
                    },
                },
                {
                    props: { variant: 'noBorder', color: 'warning' },
                    style: {
                        color: tokens.warning,
                        border: 'none',
                        '&:hover': {
                            background: 'transparent',
                            color: tokens.warningLight
                        },
                    },
                },
                {
                    props: { variant: 'light' },
                    style: {
                        color: tokens.ink,
                        border: `1px solid ${tokens.ink}`,
                        transition: 'all 0.2s',
                        '&:hover': {
                            color: tokens.ink
                        },
                    },
                }
            ]
        },

        // ── Card ──────────────────────────────────────────────
        MuiCard: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    background: tokens.bg1,
                    borderRadius: 2,
                    border: `1px solid ${tokens.line}`,
                    overflow: 'hidden',
                    transition: 'all 0.35s ease',
                    '&:hover': {
                        border: `1px solid ${tokens.lineStrong}`,
                        transform: 'translateY(-3px)',
                        boxShadow: `0 12px 40px rgba(0,0,0,0.5)`,
                    },
                },
            },
        },

        MuiCardMedia: {
            styleOverrides: {
                root: {
                    transition: 'transform 0.9s cubic-bezier(.2,.7,.2,1), filter 0.4s',
                    filter: 'saturate(0.92) contrast(1.05)',
                    '&:hover': {
                        transform: 'scale(1.06)',
                        filter: 'saturate(1.1) contrast(1)',
                    },
                },
            },
        },

        MuiCardContent: {
            styleOverrides: {
                root: {
                    padding: '24px',
                    '&:last-child': { paddingBottom: '24px' },
                },
            },
        },

        // ── Paper ─────────────────────────────────────────────
        MuiPaper: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    background: tokens.bg1,
                    borderRadius: 2,
                    backgroundImage: 'none',
                },
                outlined: {
                    border: `1px solid ${tokens.line}`,
                },
            },
        },

        // ── Drawer ────────────────────────────────────────────
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    background: tokens.bg,
                    borderRight: `1px solid ${tokens.divider}`,
                    borderRadius: 0,
                },
            },
        },

        // ── AppBar / nav ──────────────────────────────────────
        MuiAppBar: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    background: 'linear-gradient(to bottom, rgba(16,19,26,0.78), transparent)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: 'none',
                    boxShadow: 'none',
                },
                colorDefault: {
                    background: tokens.bg,
                    borderBottom: `1px solid ${tokens.line}`,
                },
            },
        },

        // MuiToolbar: {
        //     styleOverrides: {
        //         root: {
        //             padding: '0 48px !important',
        //             minHeight: '72px !important',
        //         },
        //     },
        // },

        // ── Tabs ──────────────────────────────────────────────
        MuiTabs: {
            styleOverrides: {
                root: {
                    borderBottom: `1px solid ${tokens.lineStrong}`,
                },
                indicator: {
                    background: tokens.accent,
                    height: '1px',
                },
            },
        },

        MuiTab: {
            styleOverrides: {
                root: ({ theme }) => ({
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontWeight: 400,
                    fontSize: '0.8rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: tokens.ink2,
                    borderRadius: 0,
                    minHeight: 48,
                    transition: 'color 0.2s',
                    '&.Mui-selected': { color: tokens.ink },
                    '&:hover': {
                        color: tokens.ink,
                        background: 'transparent',
                    },
                    [theme.breakpoints.down('sm')]: {
                        fontSize: '0.7rem',
                    },
                }),
            },
        },

        // ── TextField / Input ─────────────────────────────────
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                slotProps: {
                    inputLabel: { shrink: true }
                },
            },
        },

        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 2,
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '1rem',
                    fontWeight: 300,
                    color: tokens.ink,
                    background: 'transparent',
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: tokens.lineStrong,
                        transition: 'border-color 0.2s',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: tokens.ink2,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: tokens.accent,
                        borderWidth: '1px',
                    },
                },
                input: {
                    padding: '13px 18px',
                    '&::placeholder': { color: tokens.ink3, opacity: 1 },
                },
                notchedOutline: {
                    '& legend': {
                        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                        fontSize: '0.6rem',
                        letterSpacing: '0.18em',
                        //textTransform: 'uppercase'
                    }
                }
            },
        },

        MuiInputBase: {
            defaultProps: {
                size: isMobile ? "small" : "medium"
            }
        },

        MuiInputLabel: {
            defaultProps: {
                size: isMobile ? "small" : "medium"
            },
            styleOverrides: {
                root: {
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: '0.8rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: tokens.ink3,
                    '&.Mui-focused': { color: tokens.accent },
                },
                shrink: {
                    transform: 'translate(14px, -6px) scale(0.75)',
                },
            },
        },

        MuiFormHelperText: {
            styleOverrides: {
                root: {
                    marginTop: 5,
                },
            },
        },

        // ── Chip ──────────────────────────────────────────────
        MuiChip: {
            defaultProps: {
                variant: 'outlined',
            },
            styleOverrides: {
                root: {
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: '0.55rem',
                    fontWeight: 400,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                },
                colorPrimary: {
                    background: tokens.accentDim,
                    color: tokens.accent,
                    border: `1px solid rgba(0,192,212,0.25)`,
                    '&:hover': { background: 'rgba(0,192,212,0.22)' },
                },
                outlined: {
                    borderColor: tokens.ink3,
                    color: tokens.ink2,
                    '&:hover': {
                        background: 'rgba(240,244,248,0.05)',
                        borderColor: tokens.ink3,
                    },
                },
            },
            variants: [
                {
                    props: { variant: 'outlined', color: 'error' },
                    style: {
                        background: `${tokens.errorMain}25`,
                        color: tokens.errorMain,
                        border: `1px solid ${tokens.errorMain}40`,
                        '&:hover': {
                            background: 'rgba(248,113,113,0.05)',
                            border: `1px solid ${tokens.errorMain}60`,
                        },
                    },
                },
                {
                    props: { variant: 'outlined', color: 'success' },
                    style: {
                        background: `${tokens.successMain}25`,
                        color: tokens.successMain,
                        border: `1px solid ${tokens.successMain}40`,
                        '&:hover': {
                            background: 'rgba(248,113,113,0.05)',
                            border: `1px solid ${tokens.successMain}60`,
                        },
                    },
                },
            ],
        },

        // ── Divider ───────────────────────────────────────────
        MuiDivider: {
            styleOverrides: {
                root: { borderColor: tokens.lineStrong },
                light: { borderColor: tokens.lineStrong },
            },
        },

        // ── Tooltip ───────────────────────────────────────────
        MuiTooltip: {
            defaultProps: { arrow: false },
            styleOverrides: {
                tooltip: {
                    background: tokens.bg2,
                    color: tokens.ink,
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: '0.58rem',
                    letterSpacing: '0.08em',
                    borderRadius: 2,
                    border: `1px solid ${tokens.lineStrong}`,
                    padding: '10px 12px',
                }
            },
        },

        // ── Dialog ────────────────────────────────────────────
        MuiDialog: {
            styleOverrides: {
                paper: {
                    background: tokens.bg1,
                    borderRadius: 2,
                    border: `1px solid ${tokens.lineStrong}`,
                    boxShadow: `0 30px 100px rgba(0,0,0,0.6)`,
                },
                backdrop: {
                    background: 'rgba(16,19,26,0.85)',
                    backdropFilter: 'blur(14px)',
                },
            },
        },

        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontFamily: '"Roboto", Georgia, serif',
                    fontWeight: 300,
                    fontSize: '1.8rem',
                    letterSpacing: '-0.01em',
                    color: tokens.ink,
                    padding: '28px 32px 16px',
                    borderBottom: `1px solid ${tokens.line}`,
                },
            },
        },

        MuiDialogContent: {
            styleOverrides: {
                root: { padding: '24px 32px' },
            },
        },

        MuiDialogActions: {
            styleOverrides: {
                root: {
                    padding: '16px 32px 24px',
                    borderTop: `1px solid ${tokens.line}`,
                    gap: '8px',
                },
            },
        },

        // ── List / ListItem ───────────────────────────────────
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    padding: '10px 10px',
                    transition: 'all 0.2s',
                    borderLeft: `2px solid transparent`,
                    '&:hover': {
                        background: tokens.bg2,
                        color: tokens.linkHover,
                        '& .MuiTypography-root, & .MuiListItemIcon-root': {
                            color: tokens.linkHover
                        }
                    },
                    '&.Mui-selected': {
                        background: 'rgba(240,244,248,0.06)',
                        color: tokens.linkActive,
                        borderLeft: `2px solid ${tokens.accent}`,
                        '&:hover': {
                            background: 'rgba(240,244,248,0.08)'
                        },
                    },
                },
            },
        },

        MuiListItemText: {
            styleOverrides: {
                primary: {
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: '0.8rem',
                    fontWeight: 400,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: tokens.ink2,
                },
                secondary: {
                    fontSize: '0.8rem',
                    color: tokens.ink3,
                },
            },
        },

        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    color: tokens.ink3,
                    minWidth: 50,
                },
            },
        },

        // ── Menu ──────────────────────────────────────────────
        MuiMenu: {
            styleOverrides: {
                paper: {
                    background: tokens.bg2,
                    borderRadius: 2,
                    border: `1px solid ${tokens.lineStrong}`,
                    boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
                },
            },
        },

        MuiMenuItem: {
            styleOverrides: {
                root: {
                    //fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: '1rem',
                    letterSpacing: '0.1em',
                    color: tokens.ink2,
                    borderRadius: 0,
                    padding: '10px 20px',
                    transition: 'all 0.15s',
                    '&:hover': {
                        background: 'rgba(240,244,248,0.05)',
                        color: tokens.ink,
                    },
                    '&.Mui-selected': {
                        background: tokens.accentDim,
                        color: tokens.accent,
                    },
                },
            },
        },

        // ── Breadcrumbs ───────────────────────────────────────
        MuiBreadcrumbs: {
            styleOverrides: {
                root: {
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: '0.6rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: tokens.ink3,
                },
                separator: { color: tokens.accent },
            },
        },

        // ── LinearProgress ────────────────────────────────────
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    height: 1,
                    background: tokens.line,
                },
                bar: { background: tokens.ink },
            },
        },

        // ── CircularProgress ──────────────────────────────────
        MuiCircularProgress: {
            defaultProps: { color: 'primary' },
            styleOverrides: {
                circle: { strokeLinecap: 'square' },
            },
        },

        // ── Skeleton ──────────────────────────────────────────
        MuiSkeleton: {
            defaultProps: { animation: 'wave' },
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    background: tokens.bg2,
                    '&::after': {
                        background: `linear-gradient(90deg, transparent, rgba(240,244,248,0.04), transparent)`,
                    },
                },
            },
        },

        // ── Accordion ─────────────────────────────────────────
        MuiAccordion: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    background: tokens.bg1,
                    borderRadius: '0 !important',
                    border: `1px solid ${tokens.line}`,
                    borderBottom: 'none',
                    '&:last-child': { borderBottom: `1px solid ${tokens.line}` },
                    '&.Mui-expanded': {
                        margin: 0,
                        borderColor: tokens.lineStrong,
                    },
                },
            },
        },

        MuiAccordionSummary: {
            styleOverrides: {
                root: {
                    padding: '0 24px',
                    minHeight: 56,
                    '&.Mui-expanded': { minHeight: 56 },
                    '& .MuiAccordionSummary-expandIconWrapper': {
                        color: tokens.ink3,
                    },
                },
                content: {
                    fontFamily: '"Roboto", Georgia, serif',
                    fontSize: '1rem',
                    color: tokens.ink,
                    margin: '18px 0',
                    '&.Mui-expanded': { margin: '18px 0' },
                },
            },
        },

        MuiAccordionDetails: {
            styleOverrides: {
                root: {
                    padding: '0 24px 20px',
                    borderTop: `1px solid ${tokens.line}`,
                },
            },
        },

        // ── Alert ─────────────────────────────────────────────
        MuiAlert: {
            defaultProps: { variant: 'outlined' },
            styleOverrides: {
                root: {
                    borderRadius: 5,
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '0.8rem',
                    fontWeight: 300,
                    alignItems: 'center',
                }
            },
            variants: [
                {
                    props: { variant: 'outlined', severity: 'warning' },
                    style: {
                        borderColor: `rgba(232,196,106,0.3)`,
                        color: tokens.warning,
                        background: `rgba(232,196,106,0.08)`,
                    }
                },
                {
                    props: { variant: 'outlined', severity: 'success' },
                    style: {
                        borderColor: `rgba(74,222,128,0.3)`,
                        color: tokens.successMain,
                        background: `rgba(74,222,128,0.08)`,
                    }
                },
                {
                    props: { variant: 'outlined', severity: 'error' },
                    style: {
                        borderColor: `rgba(248,113,113,0.3)`,
                        color: tokens.error,
                        background: `rgba(248,113,113,0.08)`,
                    }
                },
                {
                    props: { variant: 'outlined', severity: 'info' },
                    style: {
                        borderColor: `rgba(0,192,212,0.3)`,
                        color: tokens.accent,
                        background: tokens.accentDim,
                    }
                }
            ]
        },

        MuiSnackbar: {
            styleOverrides: {
                root: {
                    background: tokens.bg2,
                    border: `1px solid ${tokens.line}`,
                    borderRadius: 3
                },
                content: {
                    background: tokens.bg2
                }
            }
        },

        MuiSnackbarContent: {
            styleOverrides: {
                root: {
                    background: tokens.bg2
                },
                message: {
                    background: tokens.bg2,
                    color: tokens.ink
                }
            }
        },

        // ── Badge ─────────────────────────────────────────────
        MuiBadge: {
            styleOverrides: {
                badge: {
                    borderRadius: 2,
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: '0.55rem',
                    fontWeight: 500,
                    minWidth: 18,
                    height: 18,
                    padding: '0 4px',
                },
            },
        },

        // ── Switch ────────────────────────────────────────────
        MuiSwitch: {
            styleOverrides: {
                root: {
                    //padding: 6
                },
                thumb: {
                    //borderRadius: 4,
                    //background: tokens.bg,
                },
                track: {
                    background: tokens.bg,
                    border: `1px solid ${tokens.ink}`,
                },
                switchBase: {
                    '&.Mui-checked': {
                        color: tokens.accent,
                        '& + .MuiSwitch-track': {
                            background: tokens.accentGlow,
                            opacity: 1,
                            border: `1px solid rgba(0,192,212,0.5)`,
                        },
                    },
                },
            },
        },

        // ── Checkbox ──────────────────────────────────────────
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    color: tokens.lineStrong,
                    borderRadius: 0,
                    '&.Mui-checked': { color: tokens.accent },
                },
            },
        },

        // ── Radio ─────────────────────────────────────────────
        MuiRadio: {
            styleOverrides: {
                root: {
                    color: tokens.lineStrong,
                    '&.Mui-checked': { color: tokens.accent },
                },
            },
        },

        // ── Slider ────────────────────────────────────────────
        MuiSlider: {
            styleOverrides: {
                root: { color: tokens.ink },
                thumb: {
                    borderRadius: 0,
                    width: 12,
                    height: 12,
                    '&:hover, &.Mui-focusVisible': {
                        boxShadow: `0 0 0 8px rgba(240,244,248,0.08)`,
                    },
                },
                rail: { background: tokens.bg2, opacity: 1 },
                track: { border: 'none' },
            },
        },

        // ── Pagination ────────────────────────────────────────
        MuiPaginationItem: {
            styleOverrides: {
                root: {
                    borderRadius: 2,
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: '0.62rem',
                    letterSpacing: '0.08em',
                    color: tokens.ink3,
                    border: `1px solid transparent`,
                    transition: 'all 0.2s',
                    '&:hover': {
                        background: 'rgba(240,244,248,0.05)',
                        borderColor: tokens.lineStrong,
                        color: tokens.ink,
                    },
                    '&.Mui-selected': {
                        background: 'rgba(240,244,248,0.06)',
                        borderColor: tokens.ink3,
                        color: tokens.ink,
                        '&:hover': { background: 'rgba(240,244,248,0.08)' },
                    },
                },
            },
        },

        // ── ImageList ─────────────────────────────────────────
        MuiImageListItem: {
            styleOverrides: {
                root: {
                    overflow: 'hidden',
                    '& img': {
                        transition: 'transform 0.9s cubic-bezier(.2,.7,.2,1), filter 0.4s',
                        filter: 'saturate(0.92) contrast(1.05)',
                    },
                    '&:hover img': {
                        transform: 'scale(1.06)',
                        filter: 'saturate(1.1) contrast(1)',
                    },
                },
            },
        },

        MuiImageListItemBar: {
            styleOverrides: {
                root: {
                    background: 'linear-gradient(to top, rgba(16,19,26,0.9), transparent)',
                },
                title: {
                    fontFamily: '"Roboto", Georgia, serif',
                    fontSize: '1.1rem',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    color: tokens.ink,
                },
                subtitle: {
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: '0.55rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: tokens.accent,
                },
            },
        },
    },
});
