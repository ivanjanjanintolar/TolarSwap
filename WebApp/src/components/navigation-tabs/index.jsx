import styled from 'styled-components/macro'
import { darken } from 'polished'
import { NavLink, Link as HistoryLink, useLocation } from 'react-router-dom'

import { ArrowLeft } from 'react-feather'
import Row, { RowBetween } from '../row'

import { TYPE, theme } from '../../theme'

const Tabs = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  border-radius: 3rem;
  justify-content: space-evenly;
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  height: 3rem;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text3};
  font-size: 20px;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 500;
    color: ${({ theme }) => theme.text1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`

const ActiveText = styled.div`
  font-weight: 500;
  font-size: 20px;
`

const StyledArrowLeft = styled(ArrowLeft)`
  color: ${({ theme }) => theme.text1};
`

export function SwapPoolTabs({ active }) {
  return (
    <Tabs style={{ marginBottom: '20px', display: 'none', padding: '1rem 1rem 0 1rem' }}>
      <StyledNavLink id={`swap-nav-link`} to={'/swap'} isActive={() => active === 'swap'}>
        <p>Swap</p>
      </StyledNavLink>
      <StyledNavLink id={`pool-nav-link`} to={'/pool'} isActive={() => active === 'pool'}>
        <p>Pool</p>
      </StyledNavLink>
    </Tabs>
  )
}

export function FindPoolTabs({ origin }) {
  return (
    <Tabs>
      <RowBetween style={{ padding: '1rem 1rem 0 1rem' }}>
        <HistoryLink to={origin}>
          <StyledArrowLeft />
        </HistoryLink>
        <ActiveText>
          <p>Import V2 Pool</p>
        </ActiveText>
      </RowBetween>
    </Tabs>
  )
}

export function AddRemoveTabs({
  adding,
  creating,
  defaultSlippage,
  positionID,
}) {
  const location = useLocation()

  // detect if back should redirect to v3 or v2 pool page
  const poolLink = location.pathname.includes('add/v2')
    ? '/pool/v2'
    : '/pool' + (!!positionID ? `/${positionID.toString()}` : '')

  return (
    <Tabs>
      <RowBetween style={{ padding: '1rem 1rem 0 1rem' }}>
        <HistoryLink
          to={poolLink}
          onClick={() => {
           ""
          }}
        >
          <StyledArrowLeft stroke={theme.text2} />
        </HistoryLink>
        <TYPE.mediumHeader fontWeight={500} fontSize={20}>
          {creating ? (
            <p>Create a pair</p>
          ) : adding ? (
            <p>Add Liquidity</p>
          ) : (
            <p>Remove Liquidity</p>
          )}
        </TYPE.mediumHeader>
      </RowBetween>
    </Tabs>
  )
}

export function CreateProposalTabs() {
  return (
    <Tabs>
      <Row style={{ padding: '1rem 1rem 0 1rem' }}>
        <HistoryLink to="/vote">
          <StyledArrowLeft />
        </HistoryLink>
        <ActiveText style={{ marginLeft: 'auto', marginRight: 'auto' }}>Create Proposal</ActiveText>
      </Row>
    </Tabs>
  )
}