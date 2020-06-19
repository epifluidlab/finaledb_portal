// @flow

import * as React from "react";
import { NavLink, withRouter } from "react-router-dom";
import {
  Site,
  Grid,
  List,
  Button,
  RouterContextProvider,
} from "tabler-react";

import Download from '../components/Download';

const navBarItems = [
  {
    value: "Home",
    to: "/",
    icon: "home",
    LinkComponent: withRouter(NavLink),
    useExact: true,
  },
  {
    value: "Query",
    to: "/query",
    icon: "search",
    LinkComponent: withRouter(NavLink),
  },
  {
    value: "Visualization",
    icon: "box",
    to: "/visualization",
    LinkComponent: withRouter(NavLink),
  },
  {
    value: "Help",
    icon: "help-circle",
    to: "/help",
    LinkComponent: withRouter(NavLink),
  },
];


class SiteWrapper extends React.Component {
  render() {

    return (
      <Site.Wrapper
        headerProps={{
          href: "/",
          alt: "Tabler React",
          imageURL: "./demo/brand/logo.svg",
          navItems: [<Download />]
        }}
        navProps={{ itemsObjects: navBarItems }}
        routerContextComponentType={withRouter(RouterContextProvider)}
        footerProps={{

          copyright: (
            <React.Fragment>
              Copyright © 2019
              <a href="."> Tabler-react</a>. Theme by
              <a
                href="https://codecalm.net"
                target="_blank"
                rel="noopener noreferrer"
              >
                {" "}
                codecalm.net
              </a>{" "}
              All rights reserved.
            </React.Fragment>
          ),
          nav: (
            <React.Fragment>
              <Grid.Col auto={true}>
                <List className="list-inline list-inline-dots mb-0">
                  <List.Item className="list-inline-item">
                    <a href="./docs/index.html">Documentation</a>
                  </List.Item>
                  <List.Item className="list-inline-item">
                    <a href="./faq.html">FAQ</a>
                  </List.Item>
                </List>
              </Grid.Col>
              <Grid.Col auto={true}>
                <Button
                  href="https://github.com/tabler/tabler-react"
                  size="sm"
                  outline
                  color="primary"
                  RootComponent="a"
                >
                  Source code
                </Button>
              </Grid.Col>
            </React.Fragment>
          ),
        }}
      >
        {this.props.children}
      </Site.Wrapper>
    );
  }
}

export default SiteWrapper;
