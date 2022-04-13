import { useEffect } from "react";
import { useFormikContext } from "formik";
import { checkForAllowance } from "../../utils/functions/read-only/CheckForAllowance";
import { web3 } from "../../utils/Web3Helper";
import { useSelector } from "react-redux";

export const CheckAddressAllowanceForToken = (props) => {
  const { values } = useFormikContext();
  const connectedAccount = useSelector(state=>state.user.account)
  const checkAddressAllowance = async (name, value) => {
    try {
    
      const hexAllowance = await checkForAllowance(connectedAccount);

      const receipt = await web3.tolar.tryCallTransaction(
        connectedAccount,
        value.address,
        0,
        600000,
        1,
        hexAllowance,
        await web3.tolar.getNonce(connectedAccount)
      );

      const { 0: result } = web3.eth.abi.decodeParameters(
        ["uint256"],
        receipt.output
      );
      props.setAllowedToSwap(result !== "0");
    } catch {
      props.setAllowedToSwap(true);
    }
  };

  useEffect(() => {
    checkAddressAllowance(props.name, values[props.name]);
  }, [values]);
  return null;
};