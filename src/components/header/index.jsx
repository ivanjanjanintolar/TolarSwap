import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import { ButtonSecondary } from "../button";
import logo from "../../assets/images/logo.svg";
import Menu from "../menu";
import { Row } from "../row";
import { darken } from "polished";
import { Activity } from "react-feather";
import Identicon from "../identicon";
import useScrollPosition from "@react-hook/window-scroll";
import { useDispatch, useSelector } from "react-redux";
import { checkForWeb3 } from "../../core/store/actions/web3";

const HeaderFrame = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr 120px;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 96vw;
  top: 0;
  position: fixed;
  padding: 1rem;
  z-index: 21;

  /* Background slide effect on scroll. */
  background-image: ${({ theme }) =>
    `linear-gradient(to bottom, transparent 50%, ${theme.bg0} 50% )}}`}
  background-position: ${({ showBackground }) =>
    showBackground ? "0 -100%" : "0 0"};
  background-size: 100% 200%;
  box-shadow: 0px 0px 0px 1px ${({ theme, showBackground }) =>
    showBackground ? theme.bg2 : "transparent;"};
  transition: background-position .1s, box-shadow .1s;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding:  1rem;
    grid-template-columns: auto 1fr;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 1rem;
  `}
`;

const TolarIcon = styled.div`
  padding-left: 10px;
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
`;

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
  :hover {
    cursor: pointer;
  }
`;

const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0.5rem 0 0.25rem;
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
`;

const AccountElement = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg2)};
  border-radius: 12px;
  white-space: nowrap;
  width: 100%;
  cursor: pointer;

  :focus {
    border: 1px solid blue;
  }
`;

const HeaderLinks = styled(Row)`
  justify-self: center;
  background-color: ${({ theme }) => theme.bg0};
  width: fit-content;
  padding: 4px;
  border-radius: 16px;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 10px;
  overflow: auto;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-self: flex-end;
  `};
`;

const activeClassName = "ACTIVE";

const StyledNavLink = styled.a.attrs({
  activeClassName,
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
  padding: 8px 12px;
  word-break: break-word;
  height: 40px;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.text1};
    background-color: ${({ theme }) => theme.bg2};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`;

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    width: 100%;
    max-width: 960px;
    padding: 1rem;
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    z-index: 99;
    height: 72px;
    border-radius: 12px 12px 0 0;
    background-color: ${({ theme }) => theme.bg1};
  `};
`;

export const Web3StatusGeneric = styled(ButtonSecondary)`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  align-items: center;
  padding: 0.5rem;
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  :focus {
    outline: none;
  }
`;

export const Web3StatusConnect = styled(Web3StatusGeneric)`
  background-color: ${({ theme }) => theme.primary4};
  border: none;
  color: ${({ theme }) => theme.primaryText1};
  font-weight: 500;

  :hover,
  :focus {
    border: 1px solid ${({ theme }) => darken(0.05, theme.primary4)};
    color: ${({ theme }) => theme.primaryText1};
  }

  ${({ faded }) =>
    faded &&
    css`
      background-color: ${({ theme }) => theme.primary5};
      border: 1px solid ${({ theme }) => theme.primary5};
      color: ${({ theme }) => theme.primaryText1};

      :hover,
      :focus {
        border: 1px solid ${({ theme }) => darken(0.05, theme.primary4)};
        color: ${({ theme }) => darken(0.05, theme.primaryText1)};
      }
    `}
`;

const NetworkIcon = styled(Activity)`
  margin-left: 0.25rem;
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
`;

export default function Header() {
  const connected = useSelector(state=>state.user.isConnected)
  const connectedWalletAddress = useSelector(state=>state.user.account)
  const dispatch = useDispatch();
  const scrollY = useScrollPosition();

  function shortenAddress(address, chars = 4) {
    const parsed = address;
    if (!parsed) {
      return;
      //throw Error(`Invalid 'address' parameter '${address}'.`);
    }
    return `${parsed.substring(0, chars + 2)}...${parsed.substring(
      50 - chars
    )}`;
  }

  return (
    <>
      <HeaderFrame showBackground={scrollY > 45}>
        <Title href=".">
          <TolarIcon>
            <img width={"80px"} src={logo} alt="logo" />
          </TolarIcon>
        </Title>
        <HeaderLinks style={{ top: "10px" }}>
          <StyledNavLink id={`swap-nav-link`} href={"/swap"}>
            <p>Swap</p>
          </StyledNavLink>
          <StyledNavLink
            id={`pool-nav-link`}
            href={"/pool"}
            isActive={(match, { pathname }) =>
              Boolean(match) ||
              pathname.startsWith("/add") ||
              pathname.startsWith("/remove") ||
              pathname.startsWith("/increase") ||
              pathname.startsWith("/find")
            }
          >
            <p>Pool</p>
          </StyledNavLink>
        </HeaderLinks>
        <HeaderControls>
          {(!connected && (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                top: "10px",
                right: "10px",
              }}
            >
              <Web3StatusConnect
                style={{ width: "220px", justifyContent: "center" }}
                disabled={connected}
                onClick={() => dispatch(checkForWeb3())}
              >
                <NetworkIcon /> Connect to a wallet{" "}
              </Web3StatusConnect>
            </div>
          )) || (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                top: "10px",
                right: "10px",
              }}
            >
              <Web3StatusGeneric>
                <NetworkIcon />

                <AccountElement style={{ justifyContent: "center" }}>
                  <Text>
                    {"My Wallet: " +
                      shortenAddress(connectedWalletAddress)}
                  </Text>
                  <Identicon />
                </AccountElement>
              </Web3StatusGeneric>
            </div>
          )}
          <Menu />
        </HeaderControls>
      </HeaderFrame>
    </>
  );
}