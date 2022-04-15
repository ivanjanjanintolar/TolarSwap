import React, { useState, useEffect } from "react";
import { Main } from "./components/main";
import useBlockNumber from "./components/hooks/useBlockNumber";
import SwapCard from "./components/swap-card";
import Pool from "./components/pool-component";
import ThemeProvider from "./theme";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Spinner,
  StyledPollingNumber,
  StyledPollingDot,
  StyledPolling,
} from "./components/hooks/polling";
import Header from "./components/header";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import PoolV2 from "./components/pool-component/v2";
import AddLiquidity from "./components/liquidity";
import { useSelector, useDispatch } from "react-redux";
import { checkForWeb3 } from "./core/store/actions/web3";
import { REACT_APP_ENVIRONMENT } from "./utils/common";
import { checkPairsExistence } from "./core/store/actions/pools";

function App() {
  const blockNumber = useBlockNumber();
  const [isMounting, setIsMounting] = useState(false);
  const connectedAccount = useSelector(state=>state.user.account)
  const dispatch = useDispatch()
  
  useEffect(()=>{
    console.log(`environment: ${REACT_APP_ENVIRONMENT()}`);
    dispatch(checkForWeb3())
  },[])

  useEffect(() => {
    if (!blockNumber) {
      return;
    }
    setIsMounting(true);
    const mountingTimer = setTimeout(() => setIsMounting(false), 1000);

    // this will clear Timeout when component unmount like in willComponentUnmount
    return () => {
      clearTimeout(mountingTimer);
    };
  }, [blockNumber]);

  return (
    <>
      <ThemeProvider>
        <Router>
          <Main>
            <Header />
            <ToastContainer style={{ marginTop: 60, flex: 1 }} theme="dark" />
            <Switch>
              <Route path="/swap" render={() => <SwapCard />} />
              <Route path="/pool" render={() => <Pool />} />
              <Route path="/liquidity" render={() => <PoolV2 />} />
              <Route path="/add/liquidity" render={() => <AddLiquidity />} />
              <Redirect to="/swap" from="/" />
            </Switch>
            <StyledPolling>
              <StyledPollingNumber style={{ fontSize: "12px", paddingTop:'15px' }}>
                {blockNumber}
              </StyledPollingNumber>
              <StyledPollingDot>{isMounting && <Spinner />}</StyledPollingDot>
            </StyledPolling>
          </Main>
        </Router>
      </ThemeProvider>
    </>
  );
}

export default App;