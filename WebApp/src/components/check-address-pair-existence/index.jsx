import React, { useEffect } from "react";
import { isNaN, useFormikContext } from "formik";
import { getPair } from "../../utils/functions/read-only/GetPair";
import { FactoryAddress, RouterAddress, web3 } from "../../utils/Web3Helper";
import { DarkCard } from "../card";
import styled from "styled-components";
import { VerticalGap } from "../../style";
import {
  HeaderContent,
  PoolDetails,
  PoolDetailsInnerWrapper,
  PoolDetailsInnerWrapperWrap,
} from "../liquidity/styled";
import { getAmountOfOutputTokens } from "../../utils/functions/read-only/GetAmountsOut";
import { getAmountOfInputTokens } from "../../utils/functions/read-only/GetAmountsIn";
import { long, short } from "../../utils/AddressCalculator";
import abi from "ethereumjs-abi";
import percentage from "calculate-percentages";
import { liquidityPriceFOrmatter } from "../balance";
import BigNumber from "bignumber.js";
import { quote } from "../../utils/functions/read-only/Quote";
import { debounce } from "lodash";
import { useSelector } from "react-redux";
import * as types from "../../core/store/actions/web3/types";
import store from "../../core/store/store";

export const InitializePoolText = styled.div`
  box-sizing: border-box;
  margin: 0 px;
  min-width: 0 px;
  font-weight: 400;
  font-size: 14px;
  color: rgb(80, 144, 234);
  text-align: left;
`;

function CheckAddressPairExistence(props) {
  // Grab values and submitForm from context
  const { values, setFieldValue } = useFormikContext();

  const connectedAccount = useSelector((state) => state.user.account);
  const pairAddress = useSelector((state) => state.pairInfo.pairsAddress);
  // const getAmountInReceipt = useSelector(state=>state.pairInfo.amountInReceipt)
  // const getAmountOutReceipt = useSelector(state=>state.pairInfo.getAmountOutReceipt)
  const tokOutAmount = useSelector((state) => state.pairInfo.amountOut);
  const tokInAmount = useSelector((state) => state.pairInfo.amountIn);
  const scBalanceOfTokenAA = useSelector(
    (state) => state.pairInfo.SCBalanceOfTokenA
  );
  const scBalanceOfTokenBB = useSelector(
    (state) => state.pairInfo.SCBalanceOfTokenB
  );
  const totalSupp = useSelector((state) => state.pairInfo.totalSupply);
  const addrBalance = useSelector((state) => state.pairInfo.addressBalance);

  const checkAddressPairExistence = async (addressTokenA, addressTokenB) => {
    const nonce = await web3.tolar.getNonce(connectedAccount);

    try {
      const getPairHex = await getPair(
        addressTokenA.address,
        addressTokenB.address
      );

      web3.tolar
        .tryCallTransaction(
          connectedAccount,
          FactoryAddress,
          0,
          600000,
          1,
          getPairHex,
          nonce
        )
        .then((receipt) => {
          const { 0: result } = web3.eth.abi.decodeParameters(
            ["address"],
            receipt.output
          );

          store.dispatch({ type: types.ON_GET_PAIRS_ADDRESS, payload: result });
        });

      const getSCBalanceOfTokenA = abi.simpleEncode(
        "balanceOf(address):(uint)",
        pairAddress || "0x552FA77cC030BA9F424927AE2A3D32A0F2BA4cE9"
      );

      const getSCBalanceOfTokenB = abi.simpleEncode(
        "balanceOf(address):(uint)",
        pairAddress || "0x552FA77cC030BA9F424927AE2A3D32A0F2BA4cE9"
      );

      const getSCBalanceOfTokenAHex = getSCBalanceOfTokenA.toString("hex");

      const getSCBalanceOfTokenBHex = getSCBalanceOfTokenB.toString("hex");

      const getAmountOfOutputTokensHex = await getAmountOfOutputTokens(
        1,
        addressTokenA.address,
        addressTokenB.address,
        connectedAccount
      );

      web3.tolar
        .tryCallTransaction(
          connectedAccount,
          RouterAddress,
          0,
          600000,
          1,
          getAmountOfOutputTokensHex,
          nonce
        )
        .then((result) => {
          const { 0: outputParsed } = web3.eth.abi.decodeParameters(
            ["uint256[]"],
            result.output
          );
          const newOutputParsed = (outputParsed || []).map(
            (value) => +new BigNumber(value).shiftedBy(-18).toFixed(3)
          );
          const [, tokenOutAmount] = newOutputParsed;
          store.dispatch({
            type: types.ON_CALCULATE_AMOUNTS_OUT,
            payload: tokenOutAmount,
          });
          // store.dispatch({ type: types.ON_CALCULATE_AMOUNTS_OUT_RECEIPT, payload: result });
        });

      const getAmountOfInputTokensHex = await getAmountOfInputTokens(
        1,
        addressTokenB.address,
        addressTokenA.address,
        connectedAccount
      );

      web3.tolar
        .tryCallTransaction(
          connectedAccount,
          RouterAddress,
          0,
          600000,
          1,
          getAmountOfInputTokensHex,
          nonce
        )
        .then((result) => {
          const { 0: outputAmountInResponse } = web3.eth.abi.decodeParameters(
            ["uint256[]"],
            result.output
          );

          const newOutputAmountInParsed = (outputAmountInResponse || []).map(
            (value) => +new BigNumber(value).shiftedBy(-18).toFixed(3)
          );
          const [, tokenInAmount] = newOutputAmountInParsed;
          store.dispatch({
            type: types.ON_CALCULATE_AMOUNTS_IN,
            payload: tokenInAmount,
          });
          // store.dispatch({ type: types.ON_CALCULATE_AMOUNTS_IN_RECEIPT, payload: result });
        });

      web3.tolar
        .tryCallTransaction(
          connectedAccount,
          addressTokenA.address,
          0,
          600000,
          1,
          getSCBalanceOfTokenAHex,
          nonce
        )
        .then((result) => {
          const { 0: scBalanceOfTokenA } = web3.eth.abi.decodeParameters(
            ["uint"],
            result.output
          );
          store.dispatch({
            type: types.ON_SC_BALANCE_FOR_TOKEN_A,
            payload: scBalanceOfTokenA,
          });
        });

      web3.tolar
        .tryCallTransaction(
          connectedAccount,
          addressTokenB.address,
          0,
          600000,
          1,
          getSCBalanceOfTokenBHex,
          nonce
        )
        .then((result) => {
          const { 0: scBalanceOfTokenB } = web3.eth.abi.decodeParameters(
            ["uint"],
            result.output
          );
          store.dispatch({
            type: types.ON_SC_BALANCE_FOR_TOKEN_B,
            payload: scBalanceOfTokenB,
          });
        });

      const scBalanceOfTokenAToNum = parseFloat(
        new BigNumber(scBalanceOfTokenAA).shiftedBy(-18).toFixed(0)
      );

      const scBalanceOfTokenBToNum = parseFloat(
        new BigNumber(scBalanceOfTokenBB).shiftedBy(-18).toFixed(0)
      );

      const myInputAndOutputTogether =
        parseFloat(values.amountIn) + parseFloat(values.amountOut);

      const totalSupply = abi.simpleEncode("totalSupply()");

      const totalSupplyHex = totalSupply.toString("hex");

      web3.tolar
        .tryCallTransaction(
          connectedAccount,
          long(pairAddress || "0x552FA77cC030BA9F424927AE2A3D32A0F2BA4cE9"),
          0,
          600000,
          1,
          totalSupplyHex,
          nonce
        )
        .then((result) => {
          const { 0: supplyOutput } = web3.eth.abi.decodeParameters(
            ["uint"],
            result.output
          );
          store.dispatch({
            type: types.ON_GET_TOTAL_SUPPLY,
            payload: supplyOutput,
          });
        });

      const balanceOf = abi.simpleEncode(
        "balanceOf(address):(uint)",
        short(connectedAccount)
      );
      const balanceOfHex = balanceOf.toString("hex");

      web3.tolar
        .tryCallTransaction(
          connectedAccount,
          long(pairAddress || "0x552FA77cC030BA9F424927AE2A3D32A0F2BA4cE9"),
          0,
          600000,
          1,
          balanceOfHex,
          nonce
        )
        .then((result) => {
          const { 0: balanceOutput } = web3.eth.abi.decodeParameters(
            ["uint"],
            result.output
          );
          store.dispatch({
            type: types.ON_GET_ADDRESS_BALANCE,
            payload: balanceOutput,
          });
        });

      const myBalanceToNumber = parseFloat(
        new BigNumber(addrBalance).shiftedBy(-18).toFixed(0)
      );

      if (pairAddress !== "0x0000000000000000000000000000000000000000") {
        props.setIsPairExistent(true);
        // if (getAmountOutReceipt.excepted || getAmountInReceipt.excepted) {
        //   return;
        // }
        const percent = percentage.calculate(addrBalance, totalSupp);

        setFieldValue(
          "amountOfBPerA",
          liquidityPriceFOrmatter.format(tokOutAmount).substring(1)
        );
        setFieldValue(
          "amountOfAPerB",
          liquidityPriceFOrmatter.format(tokInAmount).substring(1)
        );
        const percentageString = percent.toString();

        if (isNaN(myInputAndOutputTogether)) {
          if (percentageString.substring(1, 2) === ".") {
            setFieldValue("poolShare", percentageString.substring(0, 4));
          } else {
            setFieldValue("poolShare", percentageString.substring(0, 5));
          }
        } else {
          const quoteHex = await quote(
            values.amountIn,
            scBalanceOfTokenAToNum,
            scBalanceOfTokenBToNum
          );

          web3.tolar
            .tryCallTransaction(
              connectedAccount,
              RouterAddress,
              0,
              10000000,
              1,
              quoteHex,
              nonce
            )
            .then((result) => {
              const { 0: mintingAmount } = web3.eth.abi.decodeParameters(
                ["uint"],
                result.output
              );

              const mintingToNum = parseFloat(
                new BigNumber(mintingAmount).shiftedBy(-18).toFixed(0)
              );

              const totalSupplyToNum = parseFloat(
                new BigNumber(totalSupp).shiftedBy(-18).toFixed(0)
              );

              const totalSupplyAndMintingAmountTogether =
                mintingToNum + totalSupplyToNum;

              const myPercentage = myBalanceToNumber + mintingToNum;

              const calcul = percentage.calculate(
                myPercentage,
                totalSupplyAndMintingAmountTogether
              );

              const calculString = calcul.toString();

              if (calculString.substring(1, 2) === ".") {
                setFieldValue("poolShare", calculString.substring(0, 4));
              } else {
                setFieldValue("poolShare", calculString.substring(0, 5));
              }
            });
        }
      } else {
        props.setIsPairExistent(false);
        setFieldValue("poolShare", 0);
      }
    } catch (err) {
      console.log(err);
      props.setIsPairExistent(false);
      setFieldValue("poolShare", 0);
    }
  };

  const debouncedCheckAddressPairExistence = debounce(
    checkAddressPairExistence,
    750
  );

  useEffect(() => {
    if (!props?.addressTokenA?.address || !props?.addressTokenB?.address) {
      return;
    }

    debouncedCheckAddressPairExistence(
      props.addressTokenA,
      props.addressTokenB
    );
  }, [
    values.amountIn,
    values.amountOut,
    props.addressTokenA,
    props.addressTokenB,
    connectedAccount,
  ]);

  useEffect(() => {
    if (
      props?.addressTokenA?.address &&
      props?.addressTokenB?.address &&
      !props.isPairExistent &&
      values.amountIn > 0 &&
      values.amountOut > 0
    ) {
      setFieldValue("poolShare", 100);
    }
  }, [values]);

  if (!props?.addressTokenA?.address || !props?.addressTokenB?.address) {
    return null;
  }

  if (!props.visible) {
    return null;
  }

  return (
    <>
      {props.isPairExistent && (
        <DarkCard
          style={{
            height: "fit-content",
            border: "1px solid rgb(64, 68, 79)",
          }}
        >
          <HeaderContent> Prices and pool share</HeaderContent>
          <VerticalGap gap="12" />

          <PoolDetails>
            <PoolDetailsInnerWrapper>
              <PoolDetailsInnerWrapperWrap
                style={{ border: "1px solid rgb(64, 68, 79)" }}
              >
                <div style={{ padding: "8px" }}>
                  <div style={{ paddingLeft: "30px" }}>
                    {liquidityPriceFOrmatter
                      .format(values.amountOfBPerA)
                      .substring(1)}
                  </div>
                  <div>
                    {values.addressTokenB.symbol} per{" "}
                    {values.addressTokenA.symbol}
                  </div>
                </div>{" "}
                <div>
                  <div style={{ paddingLeft: "30px" }}>
                    {liquidityPriceFOrmatter
                      .format(values.amountOfAPerB)
                      .substring(1)}
                  </div>
                  <div>
                    {values.addressTokenA.symbol} per{" "}
                    {values.addressTokenB.symbol}
                  </div>
                </div>
                <div>
                  <div style={{ paddingLeft: "25px" }}>
                    {"   "}
                    {values.poolShare}%
                  </div>
                  <div>Share of pool</div>
                </div>
              </PoolDetailsInnerWrapperWrap>
            </PoolDetailsInnerWrapper>
          </PoolDetails>
        </DarkCard>
      )}

      {!props.isPairExistent && (
        <DarkCard
          style={{
            height: "fit-content",
            border: "1px solid rgb(64, 68, 79)",
          }}
        >
          <HeaderContent>Initial prices and pool share</HeaderContent>
          <VerticalGap gap="12" />

          <PoolDetails>
            <PoolDetailsInnerWrapper>
              <PoolDetailsInnerWrapperWrap
                style={{ border: "1px solid rgb(64, 68, 79)" }}
              >
                <div style={{ padding: "8px" }}>
                  <div style={{ position: "relative" }}>
                    {values.amountOfBPerAIfNoPair}
                  </div>
                  <div>
                    {values.addressTokenB.symbol} per{" "}
                    {values.addressTokenA.symbol}
                  </div>
                </div>{" "}
                <div>
                  <div style={{ paddingLeft: "30px" }}>
                    {values.amountOfAPerBIfNoPair}
                  </div>
                  <div>
                    {values.addressTokenA.symbol} per{" "}
                    {values.addressTokenB.symbol}
                  </div>
                </div>
                <div>
                  <div style={{ paddingLeft: "25px" }}>{values.poolShare}%</div>
                  <div>Share of pool</div>
                </div>
              </PoolDetailsInnerWrapperWrap>
            </PoolDetailsInnerWrapper>
          </PoolDetails>
        </DarkCard>
      )}
    </>
  );
}

CheckAddressPairExistence.defaultProps = {
  visible: true,
};
export default CheckAddressPairExistence;
