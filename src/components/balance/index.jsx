import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useFormikContext } from "formik";
import axios from "axios";
import { ethers } from "ethers";
import { BigNumber } from "bignumber.js";
import { getAmountOfOutputTokens } from "../../utils/functions/read-only/GetAmountsOut";
import { useSelector } from "react-redux";
import { HorizontalGap } from "../../style";
import { round } from "../../utils/common";

const StyledBalanceMax = styled.button`
  background-color: transparent;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  color: ${({ theme }) => theme.primaryText1};
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  pointer-events: ${({ disabled }) => (!disabled ? "initial" : "none")};
  margin-left: 0.25rem;

  :focus {
    outline: none;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 0.5rem;
  `};
`;

export const balanceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",

  // These options are needed to round to whole numbers if that's what you want.
  minimumFractionDigits: 3, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

export const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

export const liquidityPriceFOrmatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",

  // These options are needed to round to whole numbers if that's what you want.
  minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

export default function Balance(props) {
  const tolarBalance = useSelector((state) => state.user.balance);
  const wrappedTolarBalance = useSelector((state) => state.user.wrappedTolarBalance);
  const usdcBalance = useSelector((state) => state.user.usdcBalance);
  const ethereumBalance = useSelector((state) => state.user.ethereumBalance);
  const [priceOfCoin, setPriceOfCoin] = useState("");
  const { values } = useFormikContext();
  const connectedAccount = useSelector((state) => state.user.account);
  const [balanceState, setBalanceState] = useState(tolarBalance);

  const setCurrency = () => {
    const currentCurrency = props.values[props.addressFieldName].name;
    if (currentCurrency === "Tolar")setBalanceState(tolarBalance);
    if (currentCurrency === "Wrapped Tolar") setBalanceState(wrappedTolarBalance);
    if (currentCurrency === "USD Coin") setBalanceState(usdcBalance);
    if (currentCurrency === "Ethereum") setBalanceState(ethereumBalance);
    console.log(currentCurrency)
  };

  const getPrice = () => {
    const id = props.values[props.addressFieldName].id;
    axios
      .get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=USD`
      )
      .then(function (response) {
        // handle success
        setPriceOfCoin(response.data[id].usd);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  };

  useEffect(() => {
    getPrice();
    setCurrency();
  }, [values]);

  return (
    <>
      {tolarBalance && (
        <div
          className="container"
          style={{
            display: "flex",
            flexDirection: "row",
            color: "white",
            paddingTop: "5px",
            height: "5px",
          }}
        >
          <p>
            Balance : {round((balanceState ||tolarBalance)/ 1000000000000000000, 2).toFixed(2)}
          </p>
          <HorizontalGap gap={10} />
          <StyledBalanceMax
            onClick={async (e) => {
              e.preventDefault();
              props.setFieldValue(
                props.currencyFieldName,
                new BigNumber(usdcBalance).shiftedBy(-18).toFixed(3)
              );

              const receipt = await getAmountOfOutputTokens(
                !Number.parseInt(e.target.value),
                props.values.addressTokenA.address,
                props.values.addressTokenB.address,
                connectedAccount
              );

              if (receipt.excepted === true) {
                return;
              }

              const [tokenInAmount, tokenOutAmount] = receipt.outputParsed;
              if (e.target.value === tokenInAmount) {
                props.setFieldValue("amountOut", tokenOutAmount);
              }
            }}
          >
            <p>(Max)</p>
          </StyledBalanceMax>
          <HorizontalGap gap={10} />
          ~${" "}
          {priceFormatter
            .format(priceOfCoin * props.values[props.currencyFieldName])
            .substring(1)}
        </div>
      )}
    </>
  );
}
