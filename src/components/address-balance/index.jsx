import { useEffect, useState } from "react";
import { useFormikContext } from "formik";
import { getBalance } from "../../utils/functions/read-only/GetBalance";
import { web3 } from "../../utils/Web3Helper";
import BigNumber from "bignumber.js";
import { useSelector } from "react-redux";

export default function CheckMyBalance(props) {
  const { values } = useFormikContext();

  const connectedAccount = useSelector(state=>state.user.account)


  const checkIsMyInputHigherThanMyBalance = async (addressTokenA,account) => {
    try {

      const hexBalance = await getBalance(connectedAccount);


      const receipt = await web3.tolar.tryCallTransaction(
        connectedAccount,
        addressTokenA.address,
        0,
        600000,
        1,
        hexBalance,
        await web3.tolar.getNonce(connectedAccount)
      );

      const { 0: myBalance } = web3.eth.abi.decodeParameters(
        ["uint256"],
        receipt.output
      );

      const myBalanceToNum = new BigNumber(myBalance).shiftedBy(-18).toFixed(0);

      const amountIntToNum = parseFloat(values.amountIn)

      if (amountIntToNum > myBalanceToNum) {
        props.setIsInputHigherThanBalance(true);
      } else {
        props.setIsInputHigherThanBalance(false);
      }

      //
    } catch {
      props.setIsInputHigherThanBalance(false);
    }
  };

  useEffect(() => {
    if (!props?.addressTokenA?.address || !props?.addressTokenB?.address) {
      return;
    }

    checkIsMyInputHigherThanMyBalance(props.addressTokenA);
  }, [values]);

  return null;
}