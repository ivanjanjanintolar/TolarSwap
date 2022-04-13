import * as types from './types';
import { con } from '../apiCon';


/**
 * Get collection list
 * @returns list of collections
 */
 export const GetCollections = () => async (dispatch) => {
  dispatch({ type: types.GET_COLLECTIONS_REQUEST });
  await con.get('/collections/')
  //await axios.get('/json/collections.json')
    .then(res => { dispatch(GetCollectionsSuccess(res.data)); })
    .catch(err => { dispatch(GetCollectionsFail(err)); })
};
export const GetCollectionsSuccess = (data) => {
  const payload = { data, succ_msg: "Uspješno dohvaćanje liste." }
  return { type: types.GET_COLLECTIONS_SUCCESS, payload: payload };
}
export const GetCollectionsFail = (err) => {
  const status = err.status ? err.status : '';
  const err_msg = { errorType: err.message, detail: err.message };
  const toast_msg = "Ups! Došlo je do problema pri dohvaćanju informacija sa Blockchaina. Pokušajte ponovno učitati stranicu.";
  const payload = { err_msg, status, toast_msg };
  return { type: types.GET_COLLECTIONS_FAIL, payload: payload }
}

/**
 * Get collection list
 * @returns list of collections
 */
 export const GetCollectionsOfTheIssuer = (id) => async (dispatch) => {
  dispatch({ type: types.GET_COLLECTIONS_OF_THE_ISSUER_REQUEST });
  await con.get(`/collections/?issuer=${id}`)
  //await axios.get('/json/collections.json')
    .then(res => { dispatch(GetCollectionsOfTheIssuerSuccess(res.data)); })
    .catch(err => { dispatch(GetCollectionsOfTheIssuerFail(err)); })
};
export const GetCollectionsOfTheIssuerSuccess = (data) => {
  const payload = { data, succ_msg: "Uspješno dohvaćanje liste." }
  return { type: types.GET_COLLECTIONS_OF_THE_ISSUER_SUCCESS, payload: payload };
}
export const GetCollectionsOfTheIssuerFail = (err) => {
  const status = err.status ? err.status : '';
  const err_msg = { errorType: err.message, detail: err.message };
  const toast_msg = "Ups! Došlo je do problema pri dohvaćanju informacija sa Blockchaina. Pokušajte ponovno učitati stranicu.";
  const payload = { err_msg, status, toast_msg };
  return { type: types.GET_COLLECTIONS_OF_THE_ISSUER_FAIL, payload: payload }
}

/**
 * Get collection list
 * @returns list of collections
 */
 export const GetTypeCollectionsOfTheIssuer = (id,type) => async (dispatch) => {
  dispatch({ type: types.GET_COLLECTIONS_OF_THE_ISSUER_REQUEST });
  await con.get(`/collections/?issuer=${id}&type=${type}`)
  //await axios.get('/json/collections.json')
    .then(res => { dispatch(GetCollectionsOfTheIssuerSuccess(res.data)); })
    .catch(err => { dispatch(GetCollectionsOfTheIssuerFail(err)); })
};
export const GetTypeCollectionsOfTheIssuerSuccess = (data) => {
  const payload = { data, succ_msg: "Uspješno dohvaćanje liste." }
  return { type: types.GET_COLLECTIONS_OF_THE_ISSUER_SUCCESS, payload: payload };
}
export const GetTypeCollectionsOfTheIssuerFail = (err) => {
  const status = err.status ? err.status : '';
  const err_msg = { errorType: err.message, detail: err.message };
  const toast_msg = "Ups! Došlo je do problema pri dohvaćanju informacija sa Blockchaina. Pokušajte ponovno učitati stranicu.";
  const payload = { err_msg, status, toast_msg };
  return { type: types.GET_COLLECTIONS_OF_THE_ISSUER_FAIL, payload: payload }
}

/**
 * PATCH CLAIM ITEM
 * @returns 
 */
 export const ClaimItem = (pin, claim_address) => async (dispatch) => {
  dispatch({ type: types.CLAIM_ITEM_REQUEST });
  con.patch('/claim/' + pin, {claim_address}).then(response => {
    dispatch(ClaimItemSuccess(response.data));
  }).catch(err => {
    dispatch(ClaimItemFail(err.response));
  })
};
export const ClaimItemSuccess = (data) => {
  if (data.is_completed) {
    const payload = { succ_msg: "Pin točan. Preuzimanje NFT-a...", ...data }
    return { type: types.CLAIM_ITEM_SUCCESS, payload: payload };    
  } else {
    const payload = { err_msg: 'Ups! Nešto je pošlo po krivu. Ovo se može dogoditi. Molimo pokušajte ponovno.', status: ''  };
    return { type: types.CLAIM_ITEM_FAIL, payload: payload };
  }
}
export const ClaimItemFail = (err) => {
  const status = err && err.status ? err.status : '';
  const err_msg = { errorType: err.message, detail: err.message };
  const payload = { err_msg, status };
  return { type: types.CLAIM_ITEM_FAIL, payload: payload };
}