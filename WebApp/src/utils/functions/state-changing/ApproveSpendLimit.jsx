import {web3, RouterAddress} from '../../Web3Helper';
import {short} from '../../AddressCalculator';
import { constants } from 'ethers';

const max = constants.MaxUint256;

export const approveSpendLimit = async () => {
    const encoded = await web3.eth.abi.encodeFunctionCall(
      {
        name: "approve",
        type: "function",
        inputs: [
            {
              "internalType": "address",
              "name": "spender",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
      },
      [
          short(RouterAddress),
          max.toString(),
      ]
    );
    return encoded;
  };