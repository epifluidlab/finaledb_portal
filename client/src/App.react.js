import * as React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Error404} from "./pages";

import HomePage from "./HomePage.react";
import QueryPage from "./QueryPage.react";
import VisualizationPage from "./VisualizationPage.react";
import StoreCardsPage from "./components/StoreCardsPage.react.js";
import IconPage from "./components/IconPage.react.js";

import "tabler-react/dist/Tabler.css";

type Props = {||};

function App(props: Props): React.Node {
  return (
    <React.StrictMode>
      <Router>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/query" component={QueryPage} />
          <Route exact path="/visualization" component={VisualizationPage} />
          <Route exact path="/icons" component={IconPage} />
          <Route exact path="/store" component={StoreCardsPage} />
          <Route component={Error404} />
        </Switch>
      </Router>
    </React.StrictMode>
  );
}

export default App;
