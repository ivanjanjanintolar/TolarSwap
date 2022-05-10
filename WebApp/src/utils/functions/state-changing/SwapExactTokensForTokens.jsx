import { web3 } from "../../Web3Helper";
import { short } from "../../AddressCalculator";
import { BigNumber } from "bignumber.js";

const timeDelay = Date.now() + 20 * 60 * 1000;

export const swapExactTokensForTokens = async ({
  amountIn,
  minAmountOut,
  addressTokenA,
  addressTokenB,
  account
}) => {
  const encoded = await web3.eth.abi.encodeFunctionCall(
    {
      name: "swapExactTokensForTokens",
      type: "function",
      inputs: [
        {
          internalType: "uint256",
          name: "amountIn",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "amountOutMin",
          type: "uint256",
        },
        {
          internalType: "address[]",
          name: "path",
          type: "address[]",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "deadline",
          type: "uint256",
        },
      ],
    },
    [
      new BigNumber(amountIn).shiftedBy(18),
      new BigNumber(minAmountOut).shiftedBy(18),
      [short(addressTokenA), short(addressTokenB)],
      short(account),
      timeDelay,
    ]
  );
  return encoded;
};