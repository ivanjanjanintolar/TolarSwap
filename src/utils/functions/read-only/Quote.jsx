import { web3 } from "../../Web3Helper";
import BigNumber from "bignumber.js";

export const quote = async (amountIn, reserveTokenA, reserveTokenB) => {
  const encoded = web3.eth.abi.encodeFunctionCall(
    {
      inputs: [
        {
          internalType: "uint256",
          name: "amountA",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "reserveA",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "reserveB",
          type: "uint256",
        },
      ],
      name: "quote",
      outputs: [
        {
          internalType: "uint256",
          name: "amountB",
          type: "uint256",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
    [new BigNumber(amountIn).shiftedBy(18), reserveTokenA, reserveTokenB]
  );

  return encoded;
};