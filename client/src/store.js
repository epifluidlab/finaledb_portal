import { createStore, applyMiddleware, combineReducers } from 'redux';
// import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

// import downloadsReducer from './redux/downloads/reducer';
import epiBrowserReducer from './redux/reducers/epiBrowserReducer';
import dbSummaryReducer from './redux/reducers/dbSummaryReducer';
import queryReducer from './redux/reducers/queryReducer';
import downloadListReducer from './redux/reducers/downloadListReducer';

const initialState = {};

// const middleware = [logger, thunk];
const middleware = [thunk];

const rootReducer = combineReducers({
  // downloads: downloadsReducer,
  browser: epiBrowserReducer,
  summary: dbSummaryReducer,
  query: queryReducer,
  downloads: downloadListReducer,
});

// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  rootReducer,
  initialState,
  // applyMiddleware(...middleware)
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
