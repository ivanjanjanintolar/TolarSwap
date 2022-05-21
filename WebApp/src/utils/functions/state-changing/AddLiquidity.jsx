import { web3 } from "../../Web3Helper";
import { short } from "../../AddressCalculator";
import { BigNumber } from "bignumber.js";

const timeDelay = Date.now() + 20 * 60 * 1000;

export const addLiquidity = async ({
  addressTokenA,
  addressTokenB,
  amountADesired,
  amountBDesired,
  amountAMin,
  amountBMin,
  account
}) => {
  const encoded = await web3.eth.abi.encodeFunctionCall(
    {
      name: "addLiquidity",
      type: "function",
      inputs: [
        {
          internalType: "address",
          name: "tokenA",
          type: "address",
        },
        {
          internalType: "address",
          name: "tokenB",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amountADesired",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "amountBDesired",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "amountAMin",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "amountBMin",
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
      short(addressTokenA),
      short(addressTokenB),
      new BigNumber(amountADesired).shiftedBy(18).toString(),
      new BigNumber(amountBDesired).shiftedBy(18).toString(),
      new BigNumber(amountAMin).shiftedBy(18).toString(),
      new BigNumber(amountBMin).shiftedBy(18).toString(),
      short(account),
      timeDelay,
    ]
  );
  return encoded;
};