import { combineReducers } from 'redux';
import userReducer from './user';
import pairsReducer from './pairs'


export default combineReducers({
    user: userReducer,
    pairInfo : pairsReducer
})