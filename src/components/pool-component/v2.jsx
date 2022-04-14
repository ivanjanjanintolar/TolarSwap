import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { AutoColumn } from "../column";
import { DataCard, CardBGImage, CardNoise, CardSection } from "./styled";
import { RowBetween, RowFixed } from "../row";
import { ButtonPrimary, ButtonSecondary } from "../button";
import { SwapPoolTabs } from "../navigation-tabs";
import { ExternalLink, TYPE, theme } from "../../theme";
import { Text } from "rebass";
import { Link } from "react-router-dom";
import { Card } from "../card";
import { Web3StatusGeneric } from "../header";
import { web3, FactoryAddress, RouterAddress } from "../../utils/Web3Helper";
import abi from "ethereumjs-abi";
import { long, short } from "../../utils/AddressCalculator";
import { ListItemButton } from "@mui/material";
import { BigNumber } from "bignumber.js";
import { removeLiquidity } from "../../utils/functions/state-changing/RemoveLiquidity";
import { approveSpendLimit } from "../../utils/functions/state-changing/ApproveSpendLimit";
import { checkForAllowance } from "../../utils/functions/read-only/CheckForAllowance";
import { LPSpinner } from "../hooks/polling";
import promiseRetry from "promise-retry";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { checkForWeb3 } from "../../core/store/actions/web3";

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`;

const HideSmall = styled.span`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`;

const VoteCard = styled(DataCard)`
  background: radial-gradient(
    76.02% 75.41% at 1.84% 0%,
    #27ae60 0%,
    #000000 100%
  );
  overflow: hidden;
`;

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    flex-direction: column-reverse;
  `};
`;

const ButtonRow = styled(RowFixed)`
  gap: 8px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    flex-direction: row-reverse;
    justify-content: space-between;
  `};
`;

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  width: fit-content;
  border-radius: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 48%;
  `};
`;

const ResponsiveButtonSecondary = styled(ButtonSecondary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 48%;
  `};
`;

export default function PoolV2() {
  const connected = useSelector(state=>state.user.isConnected)
  const connectedAccount = useSelector(state=>state.user.account)
  const dispatch = useDispatch()
  const [addressLiquidityList, setAddressLiquidityList] = useState([]);
  const [isMounting, setIsMounting] = useState(false);
  const [liquidityState, setLiquidityState] = useState(
    <div style={{ color: "white" }}>Fetching your LP balances...</div>
  );

  //Experiment

  // const onAccountChange = async () => {
  //   if (typeof window.tolar !== "undefined") {
  //     window.tolar.on("accountsChanged", async function (accounts) {
  //       const account = accounts[0];
  //       setConnectedAccount(account);
  //       setAddressLiquidityList([]);
  //       setLiquidityState(
  //         <div style={{ color: "white" }}>Fetching your LP balances...</div>
  //       );
  //     });
  //   } else {
  //     window.addEventListener("load", function () {
  //       // do things after the DOM loads fully
  //       alert("Install Taquin wallet to interact with TolarSwap");
  //     });
  //   }
  // };

  const removeAddressLiquidity = async (
    addressTokenA,
    addressTokenB,
    liquidity
  ) => {
    const result = await removeLiquidity(
      addressTokenA,
      addressTokenB,
      liquidity,
      connectedAccount
    );
    window.tolar
      .request({
        method: "taq_sendTransaction",
        params: [
          {
            sender_address: connectedAccount,
            receiver_address: RouterAddress,
            amount: "0",
            gas: 10000000,
            gas_price: 1,
            data: result,
          },
        ],
      })
      .then((result) => {
        const id = toast.loading("Transaction pending...");
        try {
          promiseRetry(function (retry, number) {
            const transactionDetails = web3.tolar
              .getTransaction(result.txHash)
              .catch(retry);
            return transactionDetails;
          }).then(
            function (value) {
              if (value.excepted) {
                toast.update(id, {
                  render: `Failed to remove liquidity!`,
                  type: "error",
                  autoClose: 5000,
                  isLoading: false,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                });
              } else {
                toast.update(id, {
                  render: `Liquidity removed successfully!`,
                  type: "success",
                  autoClose: 5000,
                  isLoading: false,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                });
                setTimeout(() => {
                  window.location.reload();
                }, 5000);
              }
            },
            function (err) {
              toast.update(id, {
                render: `Failed to remove liquidity!`,
                type: "error",
                autoClose: 5000,
                isLoading: false,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
            }
          );
        } catch (e) {
          console.log(e);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getAddressLiquidity = async () => {
    const pairsLength = abi.simpleEncode("allPairsLength()");

    const quoteHex = pairsLength.toString("hex");

    const quoteOutput = await web3.tolar.tryCallTransaction(
      connectedAccount,
      FactoryAddress,
      0,
      600000,
      1,
      quoteHex,
      await web3.tolar.getNonce(connectedAccount)
    );

    const { 0: quoteB } = web3.eth.abi.decodeParameters(
      ["uint"],
      quoteOutput.output
    );

    const addressLiquidity = [];

    for (let i = 0; i < quoteB; i++) {
      const getPairAddress = abi.simpleEncode("allPairs(uint):(address)", i);

      const getPairAddressHex = getPairAddress.toString("hex");

      const pairsAddress = await web3.tolar.tryCallTransaction(
        connectedAccount,
        FactoryAddress,
        0,
        600000,
        1,
        getPairAddressHex,
        await web3.tolar.getNonce(connectedAccount)
      );

      const { 0: addressOutput } = web3.eth.abi.decodeParameters(
        ["address"],
        pairsAddress.output
      );

      const token0 = abi.simpleEncode("token0()");
      const token0Hex = token0.toString("hex");

      const token0Name = await web3.tolar.tryCallTransaction(
        connectedAccount,
        long(addressOutput),
        0,
        600000,
        1,
        token0Hex,
        await web3.tolar.getNonce(connectedAccount)
      );

      const { 0: token0Address } = web3.eth.abi.decodeParameters(
        ["address"],
        token0Name.output
      );

      const token1 = abi.simpleEncode("token1()");
      const token1Hex = token1.toString("hex");

      const token1Name = await web3.tolar.tryCallTransaction(
        connectedAccount,
        long(addressOutput),
        0,
        600000,
        1,
        token1Hex,
        await web3.tolar.getNonce(connectedAccount)
      );

      const { 0: token1Address } = web3.eth.abi.decodeParameters(
        ["address"],
        token1Name.output
      );

      const getToken0Symbol = abi.simpleEncode("symbol()");
      const getToken0SymbolHex = getToken0Symbol.toString("hex");

      const token0Symbol = await web3.tolar.tryCallTransaction(
        connectedAccount,
        long(token0Address),
        0,
        600000,
        1,
        getToken0SymbolHex,
        await web3.tolar.getNonce(connectedAccount)
      );

      const { 0: tokenSymbol } = web3.eth.abi.decodeParameters(
        ["string"],
        token0Symbol.output
      );

      const getToken1Symbol = abi.simpleEncode("symbol()");
      const getToken1SymbolHex = getToken1Symbol.toString("hex");

      const token1Symbol = await web3.tolar.tryCallTransaction(
        connectedAccount,
        long(token1Address),
        0,
        600000,
        1,
        getToken1SymbolHex,
        await web3.tolar.getNonce(connectedAccount)
      );

      const { 0: tokenSymbol1 } = web3.eth.abi.decodeParameters(
        ["string"],
        token1Symbol.output
      );

      const balanceOf = abi.simpleEncode(
        "balanceOf(address):(uint)",
        short(connectedAccount)
      );
      const balanceOfHex = balanceOf.toString("hex");

      const getBalance = await web3.tolar.tryCallTransaction(
        connectedAccount,
        long(addressOutput),
        0,
        600000,
        1,
        balanceOfHex,
        await web3.tolar.getNonce(connectedAccount)
      );

      const { 0: balanceOutput } = web3.eth.abi.decodeParameters(
        ["uint"],
        getBalance.output
      );

      const allowance = await checkForAllowance(connectedAccount);

      const receipt = await web3.tolar.tryCallTransaction(
        connectedAccount,
        long(addressOutput).toLowerCase(),
        0,
        600000,
        1,
        allowance,
        await web3.tolar.getNonce(connectedAccount)
      );

      const { 0: resultSpendLimit } = web3.eth.abi.decodeParameters(
        ["uint256"],
        receipt.output
      );

      if (balanceOutput > 0) {
        addressLiquidity.push({
          addressOfThePair: addressOutput,
          LPTokens: balanceOutput,
          tokenASymbol: tokenSymbol,
          tokenBSymbol: tokenSymbol1,
          tokenAAdress: token0Address,
          tokenBAdress: token1Address,
          pairAddress: addressOutput,
          spendLimit: resultSpendLimit,
          myLPTokensBalance: balanceOutput,
        });
      }
    }
    setAddressLiquidityList(addressLiquidity);
    setIsMounting(false);
    setLiquidityState(
      <div style={{ color: "white" }}>No liquidity found. </div>
    );
  };

  // useEffect(() => {
  //   onAccountChange();
  // }, []);

  useEffect(() => {
    getAddressLiquidity();
  }, [connectedAccount]);

  useEffect(() => {
    setIsMounting(true);
  }, [connectedAccount]);

  return (
    <PageWrapper>
      <SwapPoolTabs active={"pool"} />
      <VoteCard>
        <CardBGImage />
        <CardNoise />
        <CardSection>
          <AutoColumn gap="md">
            <RowBetween>
              <TYPE.white fontWeight={600}>
                <p>Liquidity provider rewards</p>
              </TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.white fontSize={14}>
                <p>
                  Liquidity providers earn a 0.3% fee on all trades proportional
                  to their share of the pool. Fees are added to the pool, accrue
                  in real time and can be claimed by withdrawing your liquidity.
                </p>
              </TYPE.white>
            </RowBetween>
            <ExternalLink
              style={{ color: "white", textDecoration: "underline" }}
              target="_blank"
              href="https://uniswap.org/docs/v2/core-concepts/pools/"
            >
              <TYPE.white fontSize={14}>
                <p>Read more about providing liquidity</p>
              </TYPE.white>
            </ExternalLink>
          </AutoColumn>
        </CardSection>
        <CardBGImage />
        <CardNoise />
      </VoteCard>

      <AutoColumn gap="lg" justify="center">
        <AutoColumn gap="md" style={{ width: "100%" }}>
          <TitleRow style={{ marginTop: "1rem" }} padding={"0"}>
            <HideSmall>
              <TYPE.mediumHeader
                style={{
                  marginTop: "0.5rem",
                  justifySelf: "flex-start",
                  color: "white",
                }}
              >
                <p>Your V2 liquidity</p>
              </TYPE.mediumHeader>
            </HideSmall>
            <ButtonRow>
              <ResponsiveButtonSecondary
                as={Link}
                padding="6px 8px"
                to="/add/liquidity"
              >
                <p>Create a pair</p>
              </ResponsiveButtonSecondary>
              <ResponsiveButtonPrimary
                id="join-pool-button"
                as={Link}
                to="/add/liquidity"
                padding="6px 8px"
              >
                <Text fontWeight={500} fontSize={16}>
                  <p>Add Liquidity</p>
                </Text>
              </ResponsiveButtonPrimary>
            </ButtonRow>
          </TitleRow>

          {!connected ? (
            <Card padding="40px">
              <Web3StatusGeneric
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(checkForWeb3())
                }}
              >
                <TYPE.body color={theme.text3} textAlign="center">
                  <p>Connect to a wallet to view your liquidity.</p>
                </TYPE.body>
              </Web3StatusGeneric>
            </Card>
          ) : (
            <Card>
              {addressLiquidityList.length === 0 ? (
                <TYPE.body color={theme.text3} textAlign="center">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {isMounting && <LPSpinner />} {liquidityState}
                  </div>
                </TYPE.body>
              ) : (
                addressLiquidityList.map(
                  ({
                    tokenASymbol,
                    tokenBSymbol,
                    LPTokens,
                    tokenAAdress,
                    tokenBAdress,
                    pairAddress,
                    spendLimit,
                    myLPTokensBalance,
                  }) => (
                    <Web3StatusGeneric>
                      <ListItemButton>
                        <div>
                          {`${tokenASymbol} / ${tokenBSymbol}`},
                          <div>
                            {" "}
                            {`Your LP Tokens : ${new BigNumber(LPTokens)
                              .shiftedBy(-18)
                              .toFixed(2)}`}
                          </div>
                        </div>
                        {(parseFloat(spendLimit) >=
                          parseFloat(myLPTokensBalance) && (
                          <ButtonPrimary
                            style={{
                              marginLeft: "auto",
                              width: "130px",
                              height: "50px",
                            }}
                            onClick={async () => {
                              removeAddressLiquidity(
                                tokenAAdress,
                                tokenBAdress,
                                LPTokens
                              );
                            }}
                          >
                            Remove Liquidity
                          </ButtonPrimary>
                        )) || (
                          <ButtonPrimary
                            style={{
                              marginLeft: "auto",
                              width: "170px",
                              height: "50px",
                            }}
                            onClick={async () => {
                              const spendLimitHex = await approveSpendLimit();

                              window.tolar
                                .request({
                                  method: "taq_sendTransaction",
                                  params: [
                                    {
                                      sender_address: connectedAccount,
                                      receiver_address:
                                        long(pairAddress).toLowerCase(),
                                      amount: "0",
                                      gas: 10000000,
                                      gas_price: 1,
                                      data: spendLimitHex,
                                    },
                                  ],
                                })
                                .then((result) => {
                                  const id = toast.loading(
                                    "Transaction pending..."
                                  );
                                  try {
                                    promiseRetry(function (retry, number) {
                                      const transactionDetails = web3.tolar
                                        .getTransaction(result.txHash)
                                        .catch(retry);
                                      return transactionDetails;
                                    }).then(
                                      function (value) {
                                        if (value.excepted) {
                                          toast.update(id, {
                                            render: `Transaction failed!`,
                                            type: "error",
                                            autoClose: 5000,
                                            isLoading: false,
                                            hideProgressBar: false,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: true,
                                            progress: undefined,
                                          });
                                        } else {
                                          toast.update(id, {
                                            render: `Spend limit approved!`,
                                            type: "success",
                                            autoClose: 5000,
                                            isLoading: false,
                                            hideProgressBar: false,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: true,
                                            progress: undefined,
                                          });
                                          window.location.reload();
                                        }
                                      },
                                      function (err) {
                                        toast.update(id, {
                                          render: `Transaction failed!`,
                                          type: "error",
                                          autoClose: 5000,
                                          isLoading: false,
                                          hideProgressBar: false,
                                          closeOnClick: true,
                                          pauseOnHover: true,
                                          draggable: true,
                                          progress: undefined,
                                        });
                                      }
                                    );
                                  } catch (e) {
                                    console.log(e);
                                  }
                                })
                                .catch((error) => {
                                  console.log(error);
                                });
                            }}
                          >
                            {" "}
                            Approve to remove{" "}
                          </ButtonPrimary>
                        )}
                      </ListItemButton>
                    </Web3StatusGeneric>
                  )
                )
              )}
            </Card>
          )}
        </AutoColumn>
      </AutoColumn>
    </PageWrapper>
  );
}