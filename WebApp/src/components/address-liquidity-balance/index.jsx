import { useEffect, useState } from "react";
import { useFormikContext } from "formik";
import { getBalance } from "../../utils/functions/read-only/GetBalance";
import { web3 } from "../../utils/Web3Helper";
import BigNumber from "bignumber.js";
import { useSelector } from "react-redux";

export default function CheckMyBalanceTokenAAndB(props) {
  const { values } = useFormikContext();

  const connectedAccount = useSelector((state) => state.user.account);

  const checkIsMyInputHigherThanMyBalance = async (
    addressTokenA,
    addressTokenB
  ) => {
    try {
      const nonce = await web3.tolar.getNonce(connectedAccount);
      const hexBalance = await getBalance(connectedAccount);

      const hexBalanceB = await getBalance(connectedAccount);

      web3.tolar
        .tryCallTransaction(
          connectedAccount,
          addressTokenB.address,
          0,
          600000,
          1,
          hexBalanceB,
          nonce
        )
        .then((result) => {
          const { 0: myBalanceTokenB } = web3.eth.abi.decodeParameters(
            ["uint256"],
            result.output
          );
          const myBalanceTokenBToNum = new BigNumber(myBalanceTokenB)
            .shiftedBy(-18)
            .toFixed(0);

          const amountIntTokenBToNum = parseFloat(values.amountOut);
          web3.tolar
            .tryCallTransaction(
              connectedAccount,
              addressTokenA.address,
              0,
              600000,
              1,
              hexBalance,
              nonce
            )
            .then((result) => {
              const { 0: myBalanceTokenA } = web3.eth.abi.decodeParameters(
                ["uint256"],
                result.output
              );
              const myBalanceToNum = new BigNumber(myBalanceTokenA)
                .shiftedBy(-18)
                .toFixed(0);
              const amountIntToNum = parseFloat(values.amountIn);

              if (
                amountIntToNum > myBalanceToNum ||
                amountIntTokenBToNum > myBalanceTokenBToNum
              ) {
                props.setIsInputHigherThanBalance(true);
              } else {
                props.setIsInputHigherThanBalance(false);
              }
            });
        });
    } catch {
      props.setIsInputHigherThanBalance(false);
    }
  };

  useEffect(() => {
    if (!props?.addressTokenA?.address || !props?.addressTokenB?.address) {
      return;
    }

    checkIsMyInputHigherThanMyBalance(props.addressTokenA, props.addressTokenB);
  }, [values]);

  return null;
}
