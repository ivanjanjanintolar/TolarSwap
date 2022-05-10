import React, { useMemo } from "react";
import { Text } from "rebass";
import styled, {
  createGlobalStyle,
  css,
  ThemeProvider as StyledComponentsThemeProvider,
} from "styled-components";
import ReactGA from "react-ga";

const StyledLink = styled.a`
  text-decoration: none;
  cursor: pointer;
  color: ${({ theme }) => theme.primary1};
  font-weight: 500;

  :hover {
    text-decoration: underline;
  }

  :focus {
    outline: none;
    text-decoration: underline;
  }

  :active {
    text-decoration: none;
  }
`;

export const MEDIA_WIDTHS = {
  upToExtraSmall: 500,
  upToSmall: 720,
  upToMedium: 960,
  upToLarge: 1280,
};

const mediaWidthTemplates = Object.keys(MEDIA_WIDTHS).reduce(
  (accumulator, size) => {
    accumulator[size] = (a, b, c) => css`
      @media (max-width: ${MEDIA_WIDTHS[size]}px) {
        ${css(a, b, c)}
      }
    `;
    return accumulator;
  },
  {}
);
function handleClickExternalLink(event) {
  const { target, href } = event.currentTarget;

  const anonymizedHref = href;

  // don't prevent default, don't redirect if it's a new tab
  if (target === "_blank" || event.ctrlKey || event.metaKey) {
    ReactGA.outboundLink({ label: anonymizedHref }, () => {
      console.debug("Fired outbound link event", anonymizedHref);
    });
  } else {
    event.preventDefault();
    // send a ReactGA event and then trigger a location change
    ReactGA.outboundLink({ label: anonymizedHref }, () => {
      window.location.href = anonymizedHref;
    });
  }
}

export function ExternalLink({
  target = "_blank",
  href,
  rel = "noopener noreferrer",
  ...rest
}) {
  return (
    <StyledLink
      target={target}
      rel={rel}
      href={href}
      onClick={handleClickExternalLink}
      {...rest}
    />
  );
}

const white = "#FFFFFF";
const black = "#000000";

export function colors(darkMode) {
  return {
    // base
    white,
    black,

    // text
    text1: darkMode ? "#FFFFFF" : "#000000",
    text2: darkMode ? "#C3C5CB" : "#565A69",
    text3: darkMode ? "#8F96AC" : "#6E727D",
    text4: darkMode ? "#B2B9D2" : "#C3C5CB",
    text5: darkMode ? "#2C2F36" : "#EDEEF2",

    // backgrounds / greys
    bg0: darkMode ? "#191B1F" : "#FFF",
    bg1: darkMode ? "#212429" : "#F7F8FA",
    bg2: darkMode ? "#2C2F36" : "#EDEEF2",
    bg3: darkMode ? "#40444F" : "#CED0D9",
    bg4: darkMode ? "#565A69" : "#888D9B",
    bg5: darkMode ? "#6C7284" : "#888D9B",
    bg6: darkMode ? "#1A2028" : "#6C7284",

    //specialty colors
    modalBG: darkMode ? "rgba(0,0,0,.425)" : "rgba(0,0,0,0.3)",
    advancedBG: darkMode ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.6)",

    //primary colors
    primary1: darkMode ? "#2172E5" : "#E8006F",
    primary2: darkMode ? "#3680E7" : "#FF8CC3",
    primary3: darkMode ? "#4D8FEA" : "#FF99C9",
    primary4: darkMode ? "#376bad70" : "#F6DDE8",
    primary5: darkMode ? "#153d6f70" : "#FDEAF1",

    // color text
    primaryText1: darkMode ? "#438BF0" : "#D50066",

    // secondary colors
    secondary1: darkMode ? "#2172E5" : "#E8006F",
    secondary2: darkMode ? "#17000b26" : "#F6DDE8",
    secondary3: darkMode ? "#17000b26" : "#FDEAF1",

    // other
    red1: darkMode ? "#FF4343" : "#DA2D2B",
    red2: darkMode ? "#F82D3A" : "#DF1F38",
    red3: "#D60000",
    green1: darkMode ? "#27AE60" : "#007D35",
    yellow1: "#E3A507",
    yellow2: "#FF8F00",
    yellow3: "#F3B71E",
    blue1: darkMode ? "#2172E5" : "#0068FC",
    blue2: darkMode ? "#5199FF" : "#0068FC",
    error: darkMode ? "#FD4040" : "#DF1F38",
    success: darkMode ? "#27AE60" : "#007D35",
    warning: "#FF8F00",

    // dont wanna forget these blue yet
    blue4: darkMode ? "#153d6f70" : "#C4D9F8",
    // blue5: darkMode ? '#153d6f70' : '#EBF4FF',
  };
}

export function theme(darkMode) {
  return {
    ...colors(darkMode),

    grids: {
      sm: 8,
      md: 12,
      lg: 24,
    },

    //shadows
    shadow1: darkMode ? "#000" : "#2F80ED",

    // media queries
    mediaWidth: mediaWidthTemplates,

    // css snippets
    flexColumnNoWrap: css`
      display: flex;
      flex-flow: column nowrap;
    `,
    flexRowNoWrap: css`
      display: flex;
      flex-flow: row nowrap;
    `,
  };
}

export default function ThemeProvider({ children }) {
  const darkMode = true;

  const themeObject = useMemo(() => theme(darkMode), [darkMode]);

  return (
    <StyledComponentsThemeProvider theme={themeObject}>
      {children}
    </StyledComponentsThemeProvider>
  );
}

const TextWrapper = styled(Text)`
  color: ${({ color, theme }) => theme[color]};
`;

export const TYPE = {
  main(props) {
    return <TextWrapper fontWeight={500} color={"text2"} {...props} />;
  },
  link(props) {
    return <TextWrapper fontWeight={500} color={"primary1"} {...props} />;
  },
  label(props) {
    return <TextWrapper fontWeight={600} color={"text1"} {...props} />;
  },
  black(props) {
    return <TextWrapper fontWeight={500} color={"text1"} {...props} />;
  },
  white(props) {
    return <TextWrapper fontWeight={500} color={"white"} {...props} />;
  },
  body(props) {
    return (
      <TextWrapper fontWeight={400} fontSize={16} color={"text1"} {...props} />
    );
  },
  largeHeader(props) {
    return <TextWrapper fontWeight={600} fontSize={24} {...props} />;
  },
  mediumHeader(props) {
    return <TextWrapper fontWeight={500} fontSize={20} {...props} />;
  },
  subHeader(props) {
    return <TextWrapper fontWeight={400} fontSize={14} {...props} />;
  },
  small(props) {
    return <TextWrapper fontWeight={500} fontSize={11} {...props} />;
  },
  blue(props) {
    return <TextWrapper fontWeight={500} color={"blue1"} {...props} />;
  },
  yellow(props) {
    return <TextWrapper fontWeight={500} color={"yellow3"} {...props} />;
  },
  darkGray(props) {
    return <TextWrapper fontWeight={500} color={"text3"} {...props} />;
  },
  gray(props) {
    return <TextWrapper fontWeight={500} color={"bg3"} {...props} />;
  },
  italic(props) {
    return (
      <TextWrapper
        fontWeight={500}
        fontSize={12}
        fontStyle={"italic"}
        color={"text2"}
        {...props}
      />
    );
  },
  error({ error, ...props }) {
    return (
      <TextWrapper
        fontWeight={500}
        color={error ? "red1" : "text2"}
        {...props}
      />
    );
  },
};

export const ThemedGlobalStyle = createGlobalStyle`
html {
  color: ${({ theme }) => theme.text1};
  background-color: ${({ theme }) => theme.bg1} !important;
}

a {
 color: ${({ theme }) => theme.blue1}; 
}
`;