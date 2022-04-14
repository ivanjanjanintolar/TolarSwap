import React, { useState, useEffect } from "react";
import { CardBody, LightGreyCard, GreyCard } from "../card";
import { ButtonPrimary, MiddleButton, ButtonPink } from "../button";
import { Title } from "../typography";
import { Form, Formik } from "formik";
import { web3, RouterAddress } from "../../utils/Web3Helper";
import { addLiquidity } from "../../utils/functions/state-changing/AddLiquidity";
import { approveSpendLimit } from "../../utils/functions/state-changing/ApproveSpendLimit";
import { VerticalGap } from "../../style";
import { Web3StatusConnect } from "../header";
import SearchCurrencyModal from "../search-currency";
import { getAmountOfOutputTokens } from "../../utils/functions/read-only/GetAmountsOut";
import { getAmountOfInputTokens } from "../../utils/functions/read-only/GetAmountsIn";
import { CRYPTOCURRENCY_LIST } from "../../constants";
import { CheckAddressAllowanceForToken } from "../address-allowance-check";
import CheckAddressPairExistence, {
  InitializePoolText,
} from "../check-address-pair-existence";
import { toast } from "react-toastify";
import promiseRetry from "promise-retry";
import { liquidityPriceFOrmatter } from "../balance";
import CheckMyBalanceTokenAAndB from "../address-liquidity-balance";
import { debounce } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { checkForWeb3 } from "../../core/store/actions/web3";

export default function AddLiquidity() {
  const [approvedTokenA, setApprovedTokenA] = useState(true);
  const [approvedTokenB, setApprovedTokenB] = useState(true);
  const [isPairExistent, setIsPairExistent] = useState(false);
  const [sufficientLiquidity, setSufficientLiquidity] = useState(true);
  const [isInputHigherThanBalance, setIsInputHigherThanBalance] =
    useState(false);

  const connected = useSelector((state) => state.user.isConnected);
  const connectedAccount = useSelector((state) => state.user.account);
  const dispatch = useDispatch()

  const onValueChangeAmountIn = async (props, e) => {
    if (!isPairExistent) {
      if (Number(e.target.value) && Number(props.values.amountOut)) {
        const CalculatePriceToDisplayForA = (amountA, settingPrice) => {
          return settingPrice / amountA;
        };
        const CalculatePriceToDisplayForB = (amountB, settingPrice) => {
          return settingPrice / amountB;
        };

        props.setFieldValue(
          "amountOfBPerAIfNoPair",
          liquidityPriceFOrmatter
            .format(
              CalculatePriceToDisplayForB(
                e.target.value,
                props.values.amountOut
              )
            )
            .substring(1)
        );

        props.setFieldValue(
          "amountOfAPerBIfNoPair",
          liquidityPriceFOrmatter
            .format(
              CalculatePriceToDisplayForA(
                props.values.amountOut,
                e.target.value
              )
            )
            .substring(1)
        );
      } else {
        props.setFieldValue("amountOfBPerAIfNoPair", 0);
        props.setFieldValue("amountOfAPerBIfNoPair", 0);
        props.setFieldValue("poolShare", 0);
      }
      return;
    }
    if (
      !Number(e.target.value) ||
      !props?.values?.addressTokenB?.address ||
      !props?.values?.addressTokenA?.address
    ) {
      props.setFieldValue("amountIn", "");
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

  const debouncedOnValueChangeAmountIn = debounce(onValueChangeAmountIn, 500);

  const onValueChangeAmountOut = async (props, e) => {
    if (Number(props.values.amountIn) && Number(e.target.value)) {
      const CalculatePriceToDisplayForA = (amountA, settingPrice) => {
        return settingPrice / amountA;
      };
      const CalculatePriceToDisplayForB = (amountB, settingPrice) => {
        return settingPrice / amountB;
      };

      props.setFieldValue(
        "amountOfAPerBIfNoPair",
        liquidityPriceFOrmatter
          .format(
            CalculatePriceToDisplayForB(e.target.value, props.values.amountIn)
          )
          .substring(1)
      );

      props.setFieldValue(
        "amountOfBPerAIfNoPair",
        liquidityPriceFOrmatter
          .format(
            CalculatePriceToDisplayForA(props.values.amountIn, e.target.value)
          )
          .substring(1)
      );
    } else {
      props.setFieldValue("amountOfAPerBIfNoPair", 0);
      props.setFieldValue("amountOfBPerAIfNoPair", 0);
      props.setFieldValue("poolShare", 0);
    }

    if (!isPairExistent) {
      return;
    }

    if (
      !Number(e.target.value) ||
      !props?.values?.addressTokenB?.address ||
      !props?.values?.addressTokenA?.address
    ) {
      props.setFieldValue("amountOut", "");
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
          poolShare: "0",
          amountOfBPerA: "-",
          amountOfAPerB: "-",
          amountOfBPerAIfNoPair: "-",
          amountOfAPerBIfNoPair: "-",
        }}
        onSubmit={async (values, actions) => {
          const addLiquidityHex = await addLiquidity({
            ...values,
            addressTokenA: values.addressTokenA.address,
            addressTokenB: values.addressTokenB.address,
            amountADesired: values.amountIn,
            amountBDesired: values.amountOut,
            amountAMin: values.amountIn - (10 / 100) * values.amountIn,
            amountBMin: values.amountOut - (10 / 100) * values.amountOut,
            account: connectedAccount
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
                  data: addLiquidityHex,
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
                      console.log(value);
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
                        render: `Liquidity added successfully!`,
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
        {(props) => (
          <Form>
            <CheckAddressAllowanceForToken
              name={"addressTokenA"}
              setAllowedToSwap={setApprovedTokenA}
            />
            <CheckAddressAllowanceForToken
              name={"addressTokenB"}
              setAllowedToSwap={setApprovedTokenB}
            />
            <CheckMyBalanceTokenAAndB
              addressTokenA={props.values.addressTokenA}
              addressTokenB={props.values.addressTokenB}
              isInputHigherThanBalance={isInputHigherThanBalance}
              setIsInputHigherThanBalance={setIsInputHigherThanBalance}
            />
            <CardBody>
              <Title>Add Liquidity</Title>
              <VerticalGap gap="18" />
              <InitializePoolText>
                Tip: When you add liquidity, you will receive pool tokens
                representing your position. These tokens automatically earn fees
                proportional to your share of the pool, and can be redeemed at
                any time.
              </InitializePoolText>
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
                  setFieldValue: (name, value) => {
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
                onClick={(e) => {
                  e.preventDefault();
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
                    props.setFieldValue("amountIn", "");
                    props.setFieldValue("amountOut", "");
                    setSufficientLiquidity(true);
                  },
                  value: props.values.addressTokenB,
                }}
                excludeAddress={props?.values?.addressTokenA?.address}
                formProps={props}
              ></SearchCurrencyModal>
              <VerticalGap gap="18" />
              <CheckAddressPairExistence
                addressTokenA={props.values.addressTokenA}
                addressTokenB={props.values.addressTokenB}
                setIsPairExistent={setIsPairExistent}
                isPairExistent={isPairExistent}
              />
              <VerticalGap gap="18" />
              {!approvedTokenA && (
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
                        const id = toast.loading("Transaction pending...");
                        try {
                          promiseRetry(function (retry, number) {
                            const transactionDetails = web3.tolar
                              .getTransaction(result.txHash)
                              .catch(retry);
                            return transactionDetails;
                          }).then(
                            function (value) {
                              setApprovedTokenA(!value.excepted);
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
                  Approve TolarSwap Protocol to use your token{" "}
                  {props?.values?.addressTokenA?.symbol}
                </ButtonPrimary>
              )}
              <VerticalGap gap={8} />
              {!approvedTokenB && approvedTokenA && (
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
                              props.values.addressTokenB.address,
                            amount: "0",
                            gas: 10000000,
                            gas_price: 1,
                            data: spendLimitHex,
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
                              setApprovedTokenB(!value.excepted);
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
                  Approve TolarSwap Protocol to use your token{" "}
                  {props?.values?.addressTokenB?.symbol}
                </ButtonPrimary>
              )}
              {connected &&
                !sufficientLiquidity &&
                approvedTokenA &&
                approvedTokenB && (
                  <GreyCard style={{ textAlign: "center", color: "white" }}>
                    This pool has been closed, can't add liquidity.
                  </GreyCard>
                )}
              {connected &&
                sufficientLiquidity &&
                approvedTokenA &&
                approvedTokenB &&
                !isInputHigherThanBalance && (
                  <ButtonPrimary
                    type="submit"
                    disabled={!approvedTokenA || !approvedTokenB}
                  >
                    {" "}
                    Add Liquidity{" "}
                  </ButtonPrimary>
                )}
              {connected &&
                sufficientLiquidity &&
                approvedTokenA &&
                approvedTokenB &&
                isInputHigherThanBalance && (
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
                  onClick={() => dispatch(checkForWeb3())}
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
