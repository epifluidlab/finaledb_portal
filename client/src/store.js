import { createStore, applyMiddleware, combineReducers } from 'redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import downloadsReducer from './redux/downloads/reducer';
import epiBrowserReducer from './redux/reducers/epiBrowserReducer';

const initialState = {};

const middleware = [logger, thunk];

const rootReducer = combineReducers({
  downloads: downloadsReducer,
  browser: epiBrowserReducer,
});

export const createStoreWithInitialState = (state) =>
  createStore(
    rootReducer,
    state,
    composeWithDevTools(applyMiddleware(...middleware))
  );

const store = createStoreWithInitialState(initialState);

export default store;
