import { short } from "../../AddressCalculator";
import { web3, RouterAddress } from "../../Web3Helper";
import { BigNumber } from "bignumber.js";

export const getAmountOfInputTokens = async (
  amount,
  inputToken,
  outputToken,
  connectedAccount
) => {
  const encoded = web3.eth.abi.encodeFunctionCall(
    {
      name: "getAmountsOut",
      type: "function",
      inputs: [
        {
          internalType: "uint256",
          name: "amountIn",
          type: "uint256",
        },
        {
          internalType: "address[]",
          name: "path",
          type: "address[]",
        },
      ],
    },
    [
      new BigNumber(amount).shiftedBy(18).toString(),
      [short(inputToken), short(outputToken)],
    ]
  );

  return encoded
};