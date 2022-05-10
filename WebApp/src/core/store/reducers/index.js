import { combineReducers } from 'redux';
import userReducer from './user';
import poolsReducer from './pools'


export default combineReducers({
    user: userReducer,
    pools: poolsReducer
})