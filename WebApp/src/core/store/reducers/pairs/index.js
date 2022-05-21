import * as types from "../../actions/web3/types";

const INITIAL_STATE = {
  pairsAddress: null,
  outputAmountForOneInput: null,
  inputAmountForOneOutput: null,
  SCBalanceOfTokenA: null,
  getSCBalanceOfTokenAReceipt: {},
  SCBalanceOfTokenB: null,
  getSCBalanceOfTokenBReceipt: {},
  totalSupply: null,
  addressBalance: null,
  mintAmount: null,
  amountIn: 0,
  amountOut: 0,
};

// eslint-disable-next-line import/no-anonymous-default-export
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case types.ON_GET_PAIRS_ADDRESS:
      return {
        ...state,
        pairsAddress: action.payload,
      };

    case types.ON_CALCULATE_OUTPUT_AMOUNT:
      return {
        ...state,
        outputAmountForOneInput: action.payload,
      };

    case types.ON_CALCULATE_INPUT_AMOUNT:
      return {
        ...state,
        inputAmountForOneOutput: action.payload,
      };

    case types.ON_SC_BALANCE_FOR_TOKEN_A:
      return {
        ...state,
        SCBalanceOfTokenA: action.payload,
      };
    case types.ON_SC_BALANCE_FOR_TOKEN_A_RECEIPT:
      return {
        ...state,
        getSCBalanceOfTokenAReceipt: action.payload,
      };

    case types.ON_SC_BALANCE_FOR_TOKEN_B:
      return {
        ...state,
        SCBalanceOfTokenB: action.payload,
      };

    case types.ON_SC_BALANCE_FOR_TOKEN_B_RECEIPT:
      return {
        ...state,
        getSCBalanceOfTokenBReceipt: action.payload,
      };

    case types.ON_GET_TOTAL_SUPPLY:
      return {
        ...state,
        totalSupply: action.payload,
      };

    case types.ON_GET_ADDRESS_BALANCE:
      return {
        ...state,
        addressBalance: action.payload,
      };

    case types.ON_GET_MINTING_AMOUNT:
      return {
        ...state,
        mintAmount: action.payload,
      };

    case types.ON_CALCULATE_AMOUNTS_IN:
      return {
        ...state,
        amountIn: action.payload,
      };

    case types.ON_CALCULATE_AMOUNTS_OUT:
      return {
        ...state,
        amountOut: action.payload,
      };
    default:
      return state;
  }
};
