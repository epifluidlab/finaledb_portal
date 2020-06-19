import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import downloadsReducer from './redux/downloads/reducer';
import epiBrowserReducer from './redux/reducers/epiBrowserReducer';
import dbSummaryReducer from './redux/reducers/dbSummaryReducer';
import queryReducer from './redux/reducers/queryReducer';

const initialState = {};

// const middleware = [logger, thunk];
const middleware = [thunk];

const rootReducer = combineReducers({
  downloads: downloadsReducer,
  browser: epiBrowserReducer,
  summary: dbSummaryReducer,
  query: queryReducer,
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  rootReducer,
  initialState,
  composeEnhancers(applyMiddleware(...middleware))
);

// const createStoreWithInitialState = (state) =>
//   createStore(
//     rootReducer,
//     state,
//     composeWithDevTools(applyMiddleware(...middleware))
//   );

// const store = createStoreWithInitialState(initialState);

export default store;
