import * as types from './types';
import { con } from '../apiCon';

/**
 * Get Transactions
 * @returns list of transactions
 */
export const GetTransactions = (to_address) => async (dispatch) => {
  dispatch({ type: types.GET_TRANSACTIONS_REQUEST });
  await con.get('/transactions/?to_address=' + to_address)
    .then(res => { dispatch(GetTransactionsSuccess(res.data)); })
    .catch(err => { dispatch(GetTransactionsFail(err)); })
};
export const GetTransactionsSuccess = (data) => {
  const payload = { data, succ_msg: "Successfully received transactions list." }
  return { type: types.GET_TRANSACTIONS_SUCCESS, payload: payload };
}
export const GetTransactionsFail = (err) => {
  const status = err.status ? err.status : '';
  const err_msg = { errorType: err.message, detail: err.message };
  const toast_msg = "Ups! Došlo je do problema pri dohvaćanju informacija sa Blockchaina. Pokušajte ponovno učitati stranicu.";
  const payload = { err_msg, status, toast_msg };
  return { type: types.GET_TRANSACTIONS_FAIL, payload: payload }
}
