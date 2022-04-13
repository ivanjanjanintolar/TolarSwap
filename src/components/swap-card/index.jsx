import React, { useState, useEffect } from "react";
import { CardBody, LightGreyCard } from "../card";
import { ButtonPink, ButtonPrimary, MiddleButton } from "../button";
import { Title } from "../typography";
import { Form, Formik } from "formik";
import { web3, RouterAddress } from "../../utils/Web3Helper";
import { swapExactTokensForTokens } from "../../utils/functions/state-changing/SwapExactTokensForTokens";
import { approveSpendLimit } from "../../utils/functions/state-changing/ApproveSpendLimit";
import { VerticalGap } from "../../style";
import { Web3StatusConnect } from "../header";
import SearchCurrencyModal from "../search-currency";
import { getAmountOfOutputTokens } from "../../utils/functions/read-only/GetAmountsOut";
import { getAmountOfInputTokens } from "../../utils/functions/read-only/GetAmountsIn";
import { CRYPTOCURRENCY_LIST } from "../../constants";
import { CheckAddressAllowanceForToken } from "../address-allowance-check";
import CheckAddressPairExistence from "../check-address-pair-existence";
import { toast } from "react-toastify";
import BigNumber from "bignumber.js";
import promiseRetry from "promise-retry";
import CheckMyBalance from "../address-balance";
import { debounce } from "lodash";
import { useSelector } from "react-redux";

export default function SwapCard() {
  const [allowedToSwap, setAllowedToSwap] = useState(true);
  const [isPairExistent, setIsPairExistent] = useState(false);
  const [sufficientLiquidity, setSufficientLiquidity] = useState(true);
  const [isInputHigherThanBalance, setIsInputHigherThanBalance] =
    useState(false);

  const connected = useSelector(state=>state.user.isConnected)
  const connectedAccount = useSelector(state=>state.user.account)

  const onValueChangeAmountIn = async (props, e) => {
    if (!isPairExistent) {
      setSufficientLiquidity(false);
      return props.setFieldValue("amountOut", "");
    }
    if (
      !Number(e.target.value) ||
      !props?.values?.addressTokenB?.address ||
      !props?.values?.addressTokenA?.address
    ) {
      return props.setFieldValue("amountOut", "");
    }
    const receipt = await getAmountOfOutputTokens(
      Number(e.target.value),
      props.values.addressTokenA.address,
      props.values.addressTokenB.address,
      connectedAccount
    );

    if (receipt.excepted) {
      return;
    }
    const [, tokenOutAmount] = receipt.outputParsed;

    if (tokenOutAmount === 0) {
      setSufficientLiquidity(false);
    }

    props.setFieldValue("amountOut", tokenOutAmount);
  };
  const debouncedOnValueChangeAmountIn = debounce(onValueChangeAmountIn, 1500);

  const onValueChangeAmountOut = async (props, e) => {
    if (!isPairExistent) {
      setSufficientLiquidity(false);
      return props.setFieldValue("amountIn", "");
    }
    if (
      !Number(e.target.value) ||
      !props?.values?.addressTokenB?.address ||
      !props?.values?.addressTokenA?.address
    ) {
      return props.setFieldValue("amountIn", "");
    }
    const receipt = await getAmountOfInputTokens(
      Number(e.target.value),
      props.values.addressTokenB.address,
      props.values.addressTokenA.address,
      connectedAccount
    );

    if (receipt.excepted) {
      return;
    }

    const [, tokenOutAmount] = receipt.outputParsed;

    if (tokenOutAmount === 0) {
      setSufficientLiquidity(false);
    }

    props.setFieldValue("amountIn", tokenOutAmount);
  };

  const debouncedOnValueChangeAmountOut = debounce(onValueChangeAmountOut, 500);

  return (
    <LightGreyCard width="550px">
      <Formik
        initialValues={{
          amountIn: "",
          amountOut: "",
          addressTokenA: CRYPTOCURRENCY_LIST[0],
          addressTokenB: {},
        }}
        onSubmit={async (values, actions) => {
          const swapExactTokensForTokensHex = await swapExactTokensForTokens({
            ...values,
            amountIn: values.amountIn,
            minAmountOut: values.amountOut - (5 / 100) * values.amountOut,
            addressTokenA: values.addressTokenA.address,
            addressTokenB: values.addressTokenB.address,
            account:connectedAccount
          });

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
                  data: swapExactTokensForTokensHex,
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
                        render: `Swap failed!`,
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
                      const { 0: outputParsed } = web3.eth.abi.decodeParameters(
                        ["uint256[]"],
                        value.output
                      );
                      toast.update(id, {
                        render: `You have successfully swapped ${new BigNumber(
                          outputParsed[0]
                        )
                          .shiftedBy(-18)
                          .toFixed(2)} ${
                          values.addressTokenA.symbol
                        } for ${new BigNumber(outputParsed[1])
                          .shiftedBy(-18)
                          .toFixed(2)} ${values.addressTokenB.symbol}! 🥳`,
                        type: "success",
                        autoClose: 5000,
                        isLoading: false,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                      });
                    }
                  },
                  function (err) {
                    toast.update(id, {
                      render: `Swap failed!`,
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
        {(props) => (
          <Form>
            <CheckAddressAllowanceForToken
              name={"addressTokenA"}
              setAllowedToSwap={setAllowedToSwap}
            />
            <CheckAddressPairExistence
              addressTokenA={props.values.addressTokenA}
              addressTokenB={props.values.addressTokenB}
              setIsPairExistent={setIsPairExistent}
              isPairExistent={isPairExistent}
              visible={false}
            />
            <CheckMyBalance
              addressTokenA={props.values.addressTokenA}
              addressTokenB={props.values.addressTokenB}
              isInputHigherThanBalance={isInputHigherThanBalance}
              setIsInputHigherThanBalance={setIsInputHigherThanBalance}
            />
            <CardBody>
              <Title>Swap</Title>
              <VerticalGap gap="16" />
              <SearchCurrencyModal
                currencyInputProps={{
                  onBlur: props.handleBlur,
                  name: "amountIn",
                  onChange: async (e) => {
                    props.handleChange(e);
                    debouncedOnValueChangeAmountIn(props, e);
                  },
                  value: props.values.amountIn,
                }}
                addressInputProps={{
                  onBlur: props.handleBlur,
                  name: "addressTokenA",
                  setFieldValue: async (name, value) => {
                    props.setFieldValue(name, value);
                    props.setFieldValue("amountIn", "");
                    props.setFieldValue("amountOut", "");
                    setSufficientLiquidity(true);
                  },
                  value: props.values.addressTokenA,
                }}
                excludeAddress={props?.values?.addressTokenB?.address}
                formProps={props}
              ></SearchCurrencyModal>
              <MiddleButton
                onClick={async (e) => {
                  e.preventDefault();
                  props.setFieldValue("amountIn", props.values.amountOut);
                  props.setFieldValue("amountOut", props.values.amountIn);

                  props.setFieldValue(
                    "addressTokenA",
                    props.values.addressTokenB
                  );
                  props.setFieldValue(
                    "addressTokenB",
                    props.values.addressTokenA
                  );
                }}
              >
                &#8595;
              </MiddleButton>
              <SearchCurrencyModal
                currencyInputProps={{
                  onBlur: props.handleBlur,
                  name: "amountOut",
                  onChange: async (e) => {
                    props.handleChange(e);
                    debouncedOnValueChangeAmountOut(props, e);
                  },
                  value: props.values.amountOut,
                }}
                addressInputProps={{
                  onBlur: props.handleBlur,
                  name: "addressTokenB",
                  setFieldValue: (name, value) => {
                    props.setFieldValue(name, value);
                    props.setFieldValue("amountOut", "");
                    props.setFieldValue("amountIn", "");
                    setSufficientLiquidity(true);
                  },
                  value: props.values.addressTokenB,
                }}
                excludeAddress={props?.values?.addressTokenA?.address}
                formProps={props}
              ></SearchCurrencyModal>
              <VerticalGap gap="18" />
              {connected &&
                allowedToSwap &&
                !sufficientLiquidity &&
                isPairExistent && (
                  <ButtonPink
                    style={{ textAlign: "center", color: "white" }}
                    disabled="true"
                  >
                    Insufficient liquidity for this trade.
                  </ButtonPink>
                )}
              {connected &&
                allowedToSwap &&
                !sufficientLiquidity &&
                !isPairExistent && (
                  <ButtonPink
                    style={{ textAlign: "center", color: "white" }}
                    disabled="true"
                  >
                    Pool not created, you can add liquidity in Pool section.
                  </ButtonPink>
                )}
              {!allowedToSwap && (
                <ButtonPrimary
                  onClick={async () => {
                    const spendLimitHex = await approveSpendLimit();

                    window.tolar
                      .request({
                        method: "taq_sendTransaction",
                        params: [
                          {
                            sender_address: connectedAccount,
                            receiver_address:
                              props.values.addressTokenA.address,
                            amount: "0",
                            gas: 10000000,
                            gas_price: 1,
                            data: spendLimitHex,
                          },
                        ],
                      })
                      .then((result) => {
                        const id = toast.loading("Transaction pending....");
                        try {
                          promiseRetry(function (retry, number) {
                            const transactionDetails = web3.tolar
                              .getTransaction(result.txHash)
                              .catch(retry);
                            return transactionDetails;
                          }).then(
                            function (value) {
                              setAllowedToSwap(!value.excepted);
                              if (value.excepted) {
                                toast.update(id, {
                                  render: `Transaction failed`,
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
                                  render: "Spend limit approved!",
                                  type: "success",
                                  isLoading: false,
                                  autoClose: 5000,
                                });
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
                  Approve TolarSwap Protocol to use your tokens{" "}
                </ButtonPrimary>
              )}
              {connected &&
                sufficientLiquidity &&
                allowedToSwap &&
                !isInputHigherThanBalance && (
                  <ButtonPrimary type="submit" disabled={!allowedToSwap}>
                    {" "}
                    Swap{" "}
                  </ButtonPrimary>
                )}

              {connected && allowedToSwap && isInputHigherThanBalance && (
                <ButtonPink
                  style={{ textAlign: "center", color: "white" }}
                  disabled="true"
                >
                  Insufficient balance.
                </ButtonPink>
              )}
              {!connected && (
                <Web3StatusConnect
                  style={{ minHeight: "52px" }}
                  disabled={connected}
                  onClick={() => window.location.reload()}
                >
                  {" "}
                  Connect to a wallet{" "}
                </Web3StatusConnect>
              )}
            </CardBody>
          </Form>
        )}
      </Formik>
    </LightGreyCard>
  );
}