import { createStore, applyMiddleware, compose } from 'redux';
import ReduxThunk from 'redux-thunk'
import reducers from './reducers';
import ApiNotificationHandler from './middleware/ApiNotificationHandler';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
    reducers,
    composeEnhancers(applyMiddleware(
        ReduxThunk,
        ApiNotificationHandler
    )));

window.store = store;

export default store;