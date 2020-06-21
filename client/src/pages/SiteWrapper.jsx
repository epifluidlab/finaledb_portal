// @flow

import * as React from 'react';
import { NavLink, withRouter, useLocation } from 'react-router-dom';
import { Site, RouterContextProvider } from 'tabler-react';

const navBarItems = [
  {
    value: 'Home',
    to: '/',
    icon: 'home',
    LinkComponent: withRouter(NavLink),
    useExact: true,
  },
  {
    value: 'Query',
    to: '/query',
    icon: 'search',
    LinkComponent: withRouter(NavLink),
  },
  {
    value: 'Download',
    icon: 'download',
    to: '/downloads',
    LinkComponent: withRouter(NavLink),
  },
  // {
  //   value: "Help",
  //   icon: "help-circle",
  //   to: "/help",
  //   LinkComponent: withRouter(NavLink),
  // },
];

const SiteWrapper = (props) => {
  const location = useLocation();
  const visBarItem = {
    value: 'Visualization',
    icon: 'eye',
    to: '/visualization',
    LinkComponent: withRouter(NavLink),
  };
  const totNavBarItems = location.pathname.includes('/visualization')
    ? [...navBarItems, visBarItem]
    : navBarItems;

  return (
    <Site.Wrapper
      headerProps={{
        href: '/',
        alt: 'cfDNA DB',
        imageURL: '/demo/brand/logo.svg',
        // navItems: [<Download />],
      }}
      navProps={{ itemsObjects: totNavBarItems }}
      routerContextComponentType={withRouter(RouterContextProvider)}
      // footerProps={{
      //   // copyright: (
      //   //   <>
      //   //     Copyright © 2019
      //   //     <a href="."> Tabler-react</a>. Theme by
      //   //     <a
      //   //       href="https://codecalm.net"
      //   //       target="_blank"
      //   //       rel="noopener noreferrer"
      //   //     >
      //   //       {' '}
      //   //       codecalm.net
      //   //     </a>{' '}
      //   //     All rights reserved.
      //   //   </>
      //   // ),
      //   nav: (
      //     <>
      //       <Grid.Col auto={true}>
      //         <List className="list-inline list-inline-dots mb-0">
      //           <List.Item className="list-inline-item">
      //             <a href="./docs/index.html">Documentation</a>
      //           </List.Item>
      //           <List.Item className="list-inline-item">
      //             <a href="./faq.html">FAQ</a>
      //           </List.Item>
      //         </List>
      //       </Grid.Col>
      //       <Grid.Col auto={true}>
      //         <Button
      //           href="https://github.com/tabler/tabler-react"
      //           size="sm"
      //           outline
      //           color="primary"
      //           RootComponent="a"
      //         >
      //           Source code
      //         </Button>
      //       </Grid.Col>
      //     </>
      //   ),
      // }}
    >
      {props.children}
    </Site.Wrapper>
  );
};

export default SiteWrapper;
