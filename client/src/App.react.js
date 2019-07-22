import * as React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Provider } from 'react-redux';
import { Error404} from "./pages";

import HomePage from "./pages/HomePage.react";
import QueryPage from "./pages/QueryPage.react";
import VisualizationPage from "./pages/VisualizationPage.react";
import StoreCardsPage from "./components/StoreCardsPage.react.js";
import store from './store';

import "tabler-react/dist/Tabler.css";

function App(props) {
  return (
    <Provider store={store}>
      <React.StrictMode>
        <Router>
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route exact path="/query" component={QueryPage} />
            <Route exact path="/visualization" component={VisualizationPage} />
            <Route exact path="/store" component={StoreCardsPage} />
            <Route component={Error404} />
          </Switch>
        </Router>
      </React.StrictMode>
    </Provider>
  );
}

export default App;
