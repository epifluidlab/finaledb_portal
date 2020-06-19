import * as React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Error404 } from './pages';

import HomePage from './pages/HomePage';
import HelpPage from './pages/HelpPage';
import QueryPage from './pages/QueryPage';
import VisualizationPage from './pages/VisualizationPage';
import store from './store';

import 'tabler-react/dist/Tabler.css';

export default function App(props) {
  return (
    <Provider store={store}>
      <React.StrictMode>
        <Router>
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route exact path="/query" component={QueryPage} />

            <Route
              exact
              path="/visualization"
              render={({ history }) => <VisualizationPage history={history} />}
            />
            {/* <Route exact path="/visualization" component={VisualizationPage} /> */}
            {/* <Route exact path="/visualization/:id" component={VisualizationPage}  /> */}
            <Route exact path="/help" component={HelpPage} />
            <Route component={Error404} />
          </Switch>
        </Router>
      </React.StrictMode>
    </Provider>
  );
}
