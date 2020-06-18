import { createStore, applyMiddleware, combineReducers } from 'redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import downloadsReducer from './redux/downloads/reducer';
import epiBrowserReducer from './redux/reducers/epiBrowserReducer';
import dbSummaryReducer from './redux/reducers/dbSummaryReducer';
import queryReducer from './redux/reducers/queryReducer';

const initialState = {};

const middleware = [logger, thunk];

const rootReducer = combineReducers({
  downloads: downloadsReducer,
  browser: epiBrowserReducer,
  summary: dbSummaryReducer,
  query: queryReducer,
});

export const createStoreWithInitialState = (state) =>
  createStore(
    rootReducer,
    state,
    composeWithDevTools(applyMiddleware(...middleware))
  );

const store = createStoreWithInitialState(initialState);

export default store;
