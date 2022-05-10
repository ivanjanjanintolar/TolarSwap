import { short } from "../../AddressCalculator";
import { web3, RouterAddress } from "../../Web3Helper";
import { BigNumber } from "bignumber.js";

export const getAmountOfOutputTokens = async (
  amount,
  inputToken,
  outputToken,
  connectedAccount
) => {
  const amountHex = web3.eth.abi.encodeFunctionCall(
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
      new BigNumber(amount).shiftedBy(18),
      [short(inputToken), short(outputToken)],
    ]
  );

  const receipt = await web3.tolar.tryCallTransaction(
    connectedAccount,
    RouterAddress,
    0,
    600000,
    1,
    amountHex,
    await web3.tolar.getNonce(connectedAccount)
  );

  const { 0: outputParsed } = web3.eth.abi.decodeParameters(
    ["uint256[]"],
    receipt.output
  );

  return {
    ...receipt,
    outputParsed: (outputParsed || []).map(
      (value) => +new BigNumber(value).shiftedBy(-18).toFixed(3)
    ),
  };
};