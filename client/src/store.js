import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import downloadsReducer from './redux/downloads/reducer';

const initialState = {};

const middleware = [thunk];

const rootReducer = combineReducers({
  downloads: downloadsReducer,
});

export const createStoreWithInitialState = (state) =>
  createStore(
    rootReducer,
    state,
    composeWithDevTools(applyMiddleware(...middleware))
  );

const store = createStoreWithInitialState(initialState);

export default store;
