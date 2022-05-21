import { web3 } from "../../Web3Helper";
import { short } from "../../AddressCalculator";
import { BigNumber } from "bignumber.js";

const timeDelay = Date.now() + 20 * 60 * 1000;

export const removeLiquidity = async (
  addressTokenA,
  addressTokenB,
  liquidity,
  connectedAccount
) => {
  const encoded = await web3.eth.abi.encodeFunctionCall(
    {
      name: "removeLiquidity",
      type: "function",
      inputs: [
        {
          "internalType": "address",
          "name": "tokenA",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "tokenB",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "liquidity",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountAMin",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountBMin",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
    },
    [
      addressTokenA.toLowerCase(),
      addressTokenB.toLowerCase(),
      liquidity,
      new BigNumber(1).shiftedBy(18).toString(),
      new BigNumber(1).shiftedBy(18).toString(),
      short(connectedAccount),
      timeDelay,
    ]
  );
  return encoded;
};