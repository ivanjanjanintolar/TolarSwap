import { web3 } from "../../Web3Helper";
import { short } from "../../AddressCalculator";
import { BigNumber } from "bignumber.js";

const timeDelay = Date.now() + 20 * 60 * 1000;

export const addLiquidityTOL = async ({
  addressToken,
  amountTokenDesired,
  amountTokenMin,
  amountTOLMin,
  account
}) => {
  const encoded = await web3.eth.abi.encodeFunctionCall(
    {
      name: "addLiquidityETH",
      type: "function",
      inputs: [
        {
          internalType: "address",
          name: "token",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amountTokenDesired",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "amountTokenMin",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "amountETHMin",
          type: "uint256",
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
      short(addressToken),
      new BigNumber(amountTokenDesired).shiftedBy(18),
      new BigNumber(amountTokenMin).shiftedBy(18),
      new BigNumber(amountTOLMin).shiftedBy(18),
      short(account),
      timeDelay,
    ]
  );
  return encoded;
};