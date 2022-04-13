import React, { useState } from "react";
import { Info, MessageCircle } from "react-feather";
import styled from "styled-components";
import { ReactComponent as MenuIcon } from "../../assets/images/menu.svg";
import { HorizontalGap } from "../../style";

const StyledMenuIcon = styled(MenuIcon)`
  path {
    stroke: ${({ theme }) => theme.text1};
  }
`;

const StyledMenuButton = styled.button`
  width: 100%;
  height: 100%;
  border: none;
  background-color: pparent;
  margin: 0;
  padding: 0;
  height: 35px;
  background-color: ${({ theme }) => theme.bg2};

  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg3};
  }

  svg {
    margin-top: 2px;
  }
`;

const StyledMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`;

const MenuFlyout = styled.span`
  min-width: 8.125rem;
  background-color: ${({ theme }) => theme.bg2};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04),
    0px 16px 24px rgba(0, 0, 0, 0.04), 0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 3rem;
  z-index: 100;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    top: -17.25rem;
  `};
`;

const MenuItem = styled.a`
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  padding: 0.5rem 0.5rem;
  color: ${({ theme }) => theme.text2};
  :hover {
    color: ${({ theme }) => theme.text1};
    cursor: pointer;
    text-decoration: none;
  }
  > svg {
    margin-right: 8px;
  }
`;

export default function Menu() {
  const [open, setOpen] = useState(false);

  return (
    <StyledMenu>
      <StyledMenuButton onClick={() => setOpen(!open)}>
        <StyledMenuIcon />
      </StyledMenuButton>

      {open && (
        <MenuFlyout
          style={{
            position: "absolute",
            right: "4px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <MenuItem onClick={() => window.open("https://tolar.io/")}>
            <div>
              <p>Website</p>
            </div>
            <HorizontalGap gap="12" />
            <Info size={14} />
          </MenuItem>
          <MenuItem onClick={() => window.open("https://t.me/tolarofficial")}>
            <div>
              <p>Telegram</p>
            </div>
            <HorizontalGap gap="12" />
            <MessageCircle size={14} />
          </MenuItem>
        </MenuFlyout>
      )}
    </StyledMenu>
  );
}