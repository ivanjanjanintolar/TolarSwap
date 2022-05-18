import * as types from "../../actions/web3/types";

const INITIAL_STATE = {
  web3: false,
  isConnected: false,
  account: null,
  balance: null,
  wrappedTolarBalance: null,
  usdcBalance: null,
  ethereumBalance: null,
  inputHigherThanBalance: false,
  hasLiquidity: null,
  liquidityList: [],
};

// eslint-disable-next-line import/no-anonymous-default-export
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case types.ON_WEB3_CHECK:
      return {
        ...state,
        web3: action.payload,
      };

    case types.ON_WEB3_ACCOUNT:
      return {
        ...state,
        isConnected: true,
        account: action.payload,
      };

    case types.ON_WEB3_ACCOUNT_FAIL:
    case types.ON_WEB3_BALANCE_FAIL:
      return {
        ...state,
        isConnected: false,
        account: null,
        balance: null,
        wrappedTolarBalance: null,
        usdcBalance: null,
        ethereumBalance: null,
        liquidityList: [],
      };

    case types.ON_WEB3_BALANCE:
      return {
        ...state,
        balance: action.payload,
      };
    case types.ON_WEB3_WTOL_BALANCE:
      return {
        ...state,
        wrappedTolarBalance: action.payload,
      };

    case types.ON_WEB3_USDC_BALANCE:
      return {
        ...state,
        usdcBalance: action.payload,
      };

    case types.ON_WEB3_ETH_BALANCE:
      return {
        ...state,
        ethereumBalance: action.payload,
      };

    case types.ON_INPUT_HIGHER_THAN_BALANCE:
      return {
        ...state,
        inputHigherThanBalance: action.payload,
      };

    case types.ON_ADDRESS_LIQUIDITY:
      return {
        ...state,
        liquidityList: action.payload,
      };

    default:
      return state;
  }
};
