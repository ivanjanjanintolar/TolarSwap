import styled from "styled-components/macro";
import { AutoColumn } from "../column";
import { DarkGreyCard } from "../card";
import { Input } from "../textInput";
import { ButtonDropdown } from "../button";

export const Wrapper = styled.div`
  position: relative;
  padding: 20px;
  min-width: 480px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    min-width: 400px;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  min-width: 340px;
`};
`;

export const ScrollablePage = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
`;

export const FixedPreview = styled.div`
  position: relative;
  padding: 16px;
  width: 260px;
  height: fit-content;
  margin-top: 42px;
  background: ${({ theme }) => theme.bg0};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04),
    0px 16px 24px rgba(0, 0, 0, 0.04), 0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  position: sticky;
  top: 64px;
`;

export const DynamicSection = styled(AutoColumn)`
  opacity: ${({ disabled }) => (disabled ? "0.3" : "1")};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "initial")};
`;

export const CurrencyDropdown = styled(ButtonDropdown)`
  width: 48.5%;
`;

export const PreviewCard = styled(DarkGreyCard)`
  padding: 8px;
  border-radius: 12px;
  min-height: 40px;
  opacity: ${({ disabled }) => (disabled ? "0.2" : "1")};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledInput = styled(Input)`
  background-color: ${({ theme }) => theme.bg0};
  text-align: left;
  font-size: 18px;
  width: 100%;
`;

export const HeaderContent = styled.div`
  width: 100%;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: start;
  justify-content: flex-start;
  padding: 1 rem;
  color: rgb(255, 255, 255);
`;

export const PoolDetails = styled.div`
  border: 1 px solid rgb(44, 47, 54);
  background-color: rgb(33, 36, 41);
  width: 100%;
  padding: 1 rem;
  border-radius: 20 px;
  box-sizing: border-box;
  margin: 0 px;
  min-width: 0 px;
  padding: 1 rem;
  color: rgb(255, 255, 255);
`;

export const PoolDetailsInnerWrapper = styled.div`
  display: grid;
  grid-auto-rows: auto;
  row-gap: 12 px;
`;

export const PoolDetailsInnerWrapperWrap = styled.div`
  flex-wrap: wrap;
  margin: -4 px;
  justify-content: space-around;
  width: 100%;
  display: flex;
  padding: 0 px;
  -webkit-box-align: center;
  align-items: center;
  justify-content: space-around;
  box-sizing: border-box;
  margin: 0 px;
  min-width: 0 px;
`;