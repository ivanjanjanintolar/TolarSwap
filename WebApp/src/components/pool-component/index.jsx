import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { AutoColumn } from "../column";
import { RowBetween, RowFixed } from "../row";
import { ButtonGray, ButtonPrimary, ButtonOutlined } from "../button";
import Menu from "../menu";
import { Link } from "react-router-dom";
import { SwapPoolTabs } from "../navigation-tabs";
import CTACard from "./CTACard";
import { TYPE, theme } from "../../theme";
import {
  Inbox,
  Download,
  ChevronDown,
  ChevronsRight,
  PlusCircle,
  Layers,
  BookOpen,
} from "react-feather";
import { useSelector } from "react-redux";

const PageWrapper = styled(AutoColumn)`
  max-width: 870px;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width: 800px;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    max-width: 500px;
  `};
`;

const HideSmall = styled.span`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`;

const TitleRow = styled(RowBetween)`
  color: ${({ theme }) => theme.text2};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    flex-direction: column-reverse;
  `};
`;
const ButtonRow = styled(RowFixed)`
  & > *:not(:last-child) {
    margin-right: 8px;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  `};
`;
const MenuItem = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-start;
`;
const MoreOptionsButton = styled(ButtonGray)`
  border-radius: 12px;
  flex: 1 1 auto;
  padding: 6px 8px;
`;
const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  border-radius: 12px;
  padding: 6px 8px;
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex: 1 1 auto;
    width: 49%;
  `};
`;

const MainContentWrapper = styled.main`
  background-color: ${({ theme }) => theme.bg0};
  padding: 8px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
`;

export default function Pool() {
  const connected = useSelector(state=>state.user.isConnected)
  const connectedAccount = useSelector(state=>state.user.account)

  const menuItems = [
    {
      content: (
        <MenuItem>
          <PlusCircle size={16} style={{ marginRight: "12px" }} />
          <p>Create a pool</p>
        </MenuItem>
      ),
      link: "/add/ETH",
      external: false,
    },
    {
      content: (
        <MenuItem>
          <Layers size={16} style={{ marginRight: "12px" }} />
          <p>V2 liquidity</p>
        </MenuItem>
      ),
      link: "/pool/v2",
      external: false,
    },
    {
      content: (
        <MenuItem>
          <BookOpen size={16} style={{ marginRight: "12px" }} />
          <p>Learn</p>
        </MenuItem>
      ),
      link: "https://tolar.io/",
      external: true,
    },
  ];

  return (
    <PageWrapper>
      <SwapPoolTabs active={"pool"} />
      <AutoColumn gap="lg" justify="center">
        <AutoColumn gap="lg" style={{ width: "100%" }}>
          <TitleRow style={{ marginTop: "1rem" }} padding={"0"}>
            <HideSmall>
              <TYPE.mediumHeader>
                <p>Pools Overview</p>
              </TYPE.mediumHeader>
            </HideSmall>
            <ButtonRow>
              <ButtonOutlined
                as={Link}
                to="/liquidity"
                style={{
                  padding: "8px 16px",
                  margin: "0 4px",
                  borderRadius: "12px",
                  width: "fit-content",
                  fontSize: "14px",
                }}
              >
                <Layers size={14} style={{ marginRight: "8px" }} />
                View Liquidity
              </ButtonOutlined>
              <ResponsiveButtonPrimary
                id="join-pool-button"
                as={Link}
                to="/add/liquidity"
              >
                + Add Liquidity
              </ResponsiveButtonPrimary>
            </ButtonRow>
          </TitleRow>
          <MainContentWrapper>
            <CTACard />
          </MainContentWrapper>
          <RowFixed justify="center" style={{ width: "100%" }}></RowFixed>
        </AutoColumn>
      </AutoColumn>
    </PageWrapper>
  );
}