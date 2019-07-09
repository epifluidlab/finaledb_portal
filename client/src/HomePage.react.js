// @flow

import * as React from "react";

import {
  Page,
  Avatar,
  Icon,
  Grid,
  Card,
  Text,
  Table,
  Alert,
  Progress,
  colors,
  Dropdown,
  Button,
  StampCard,
  StatsCard,
  ProgressCard,
  Badge,
} from "tabler-react";

import C3Chart from "react-c3js";

import SiteWrapper from "./SiteWrapper.react";

function Home() {
  return (
    <SiteWrapper>
      <Page.Content>
        <Grid.Row cards={true} gutters={"lg"}>
          <Grid.Col lg={9}>
            <Card>
              <Card.Header>
                <Card.Title>About</Card.Title>
              </Card.Header>
              <Card.Body>
                React, JSX, ES6, TypeScript and Flow syntax support. Language
                extras beyond ES6 like the object spread operator. Autoprefixed
                CSS, so you don’t need -webkit- or other prefixes. A fast
                interactive unit test runner with built-in support for coverage
                reporting. A live development server that warns about common
                mistakes. A build script to bundle JS, CSS, and images for
                production, with hashes and sourcemaps. An offline-first service
                worker and a web app manifest, meeting all the Progressive Web
                App criteria. (Note: Using the service worker is opt-in as of
                react-scripts@2.0.0 and higher) Hassle-free updates for the
                above tools with a single dependency.
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>Updates</Card.Title>
              </Card.Header>
              <Table
                cards={true}
                striped={true}
                responsive={true}
                className="table-vcenter"
              >
                <Table.Header>
                  <Table.Row>
                    <Table.ColHeader colSpan={2}>User</Table.ColHeader>
                    <Table.ColHeader>Commit</Table.ColHeader>
                    <Table.ColHeader>Date</Table.ColHeader>
                    <Table.ColHeader />
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  <Table.Row>
                    <Table.Col className="w-1">
                      <Avatar imageURL="./demo/faces/male/9.jpg" />
                    </Table.Col>
                    <Table.Col>Ronald Bradley</Table.Col>
                    <Table.Col>Initial commit</Table.Col>
                    <Table.Col className="text-nowrap">May 6, 2018</Table.Col>
                    <Table.Col className="w-1">
                      <Icon link={true} name="trash" />
                    </Table.Col>
                  </Table.Row>
                  <Table.Row>
                    <Table.Col>
                      <Avatar>BM</Avatar>
                    </Table.Col>
                    <Table.Col>Russell Gibson</Table.Col>
                    <Table.Col>Main structure</Table.Col>
                    <Table.Col className="text-nowrap">
                      April 22, 2018
                    </Table.Col>
                    <Table.Col>
                      <Icon link={true} name="trash" />
                    </Table.Col>
                  </Table.Row>
                  <Table.Row>
                    <Table.Col>
                      <Avatar imageURL="./demo/faces/female/1.jpg" />
                    </Table.Col>
                    <Table.Col>Beverly Armstrong</Table.Col>
                    <Table.Col>Left sidebar adjustments</Table.Col>
                    <Table.Col className="text-nowrap">
                      April 15, 2018
                    </Table.Col>
                    <Table.Col>
                      <Icon link={true} name="trash" />
                    </Table.Col>
                  </Table.Row>
                  <Table.Row>
                    <Table.Col>
                      <Avatar imageURL="./demo/faces/male/4.jpg" />
                    </Table.Col>
                    <Table.Col>Bobby Knight</Table.Col>
                    <Table.Col>Topbar dropdown style</Table.Col>
                    <Table.Col className="text-nowrap">April 8, 2018</Table.Col>
                    <Table.Col>
                      <Icon link={true} name="trash" />
                    </Table.Col>
                  </Table.Row>
                  <Table.Row>
                    <Table.Col>
                      <Avatar imageURL="./demo/faces/female/11.jpg" />
                    </Table.Col>
                    <Table.Col>Sharon Wells</Table.Col>
                    <Table.Col>Fixes #625</Table.Col>
                    <Table.Col className="text-nowrap">April 9, 2018</Table.Col>
                    <Table.Col>
                      <Icon link={true} name="trash" />
                    </Table.Col>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>Cumulative Number of Samples</Card.Title>
              </Card.Header>
              <C3Chart
                style={{ height: "10rem" }}
                data={{
                  columns: [
                    // each columns data
                    [
                      "data1",
                      0,
                      5,
                      1,
                      2,
                      7,
                      5,
                      6,
                      8,
                      24,
                      7,
                      12,
                      5,
                      6,
                      3,
                      2,
                      2,
                      6,
                      30,
                      10,
                      10,
                      15,
                      14,
                      47,
                      65,
                      55,
                    ],
                  ],
                  type: "area", // default type of chart
                  groups: [["data1", "data2", "data3"]],
                  colors: {
                    data1: colors["blue"],
                  },
                  names: {
                    // name of each serie
                    data1: "Commits",
                  },
                }}
                axis={{
                  y: {
                    padding: {
                      bottom: 0,
                    },
                    show: false,
                    tick: {
                      outer: false,
                    },
                  },
                  x: {
                    padding: {
                      left: 0,
                      right: 0,
                    },
                    show: false,
                  },
                }}
                legend={{
                  show: false,
                  position: "inset",
                  padding: 0,
                  inset: {
                    anchor: "top-left",
                    x: 20,
                    y: 8,
                    step: 10,
                  },
                }}
                tooltip={{
                  format: {
                    title: function(x) {
                      return "";
                    },
                  },
                }}
                padding={{
                  bottom: 0,
                  left: -1,
                  right: -1,
                }}
                point={{
                  show: false,
                }}
              />
            </Card>
          </Grid.Col>

          <Grid.Col sm={3}>
            <Grid.Row>
              <StampCard
                color="blue-light"
                icon="activity"
                header={
                  <a href="#">
                    1,284 <small>Samples</small>
                  </a>
                }
              />

              <StampCard
                color="green-light"
                icon="book-open"
                header={
                  <a href="#">
                    27 <small>Publications</small>
                  </a>
                }
              />

              <Card>
                <Card.Header>
                  <Card.Title>Disease Status</Card.Title>
                </Card.Header>
                <Card.Body>
                  <C3Chart
                    style={{ height: "12rem" }}
                    data={{
                      columns: [
                        // each columns data
                        ["data1", 63],
                        ["data2", 37],
                      ],
                      type: "donut", // default type of chart
                      colors: {
                        data1: colors["red-light"],
                        data2: colors["red"],
                      },
                      names: {
                        // name of each serie
                        data1: "Maximum",
                        data2: "Minimum",
                      },
                    }}
                    legend={{
                      show: true, //hide legend
                    }}
                    padding={{
                      bottom: 0,
                      top: 0,
                    }}
                  />
                </Card.Body>
              </Card>
            </Grid.Row>

            <Grid.Row>
              <Card>
                <Card.Header>
                  <Card.Title>Platform</Card.Title>
                </Card.Header>
                <Card.Body>
                  <C3Chart
                    style={{ height: "12rem" }}
                    data={{
                      columns: [
                        // each columns data
                        ["data1", 63],
                        ["data2", 44],
                        ["data3", 12],
                        ["data4", 14],
                      ],
                      type: "pie", // default type of chart
                      colors: {
                        data1: colors["yellow-lighter"],
                        data2: colors["yellow-light"],
                        data3: colors["yellow"],
                        data4: colors["yellow-dark"],
                      },
                      names: {
                        // name of each serie
                        data1: "A",
                        data2: "B",
                        data3: "C",
                        data4: "D",
                      },
                    }}
                    legend={{
                      show: true, //hide legend
                    }}
                    padding={{
                      bottom: 0,
                      top: 0,
                    }}
                  />
                </Card.Body>
              </Card>
            </Grid.Row>
          </Grid.Col>
        </Grid.Row>

        <Grid.Row cards={true}>
          <Grid.Col width={12}>
            <Card>
              <Card.Header>
                <Card.Title>Publications</Card.Title>
              </Card.Header>
              <Table
                responsive
                highlightRowOnHover
                hasOutline
                verticalAlign="center"
                cards
                className="text-nowrap"
              >
                <Table.Header>
                  <Table.Row>
                    <Table.ColHeader>Publication Name</Table.ColHeader>
                    <Table.ColHeader>PMID</Table.ColHeader>
                    <Table.ColHeader>First Author</Table.ColHeader>
                    <Table.ColHeader>Date Published</Table.ColHeader>
                    <Table.ColHeader>Journal</Table.ColHeader>
                    <Table.ColHeader>Number samples</Table.ColHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  <Table.Row>
                    <Table.Col>
                      Cell-free DNA Comprises an In Vivo Nucleosome Footprint
                      that Informs Its Tissues-Of-Origin.
                    </Table.Col>
                    <Table.Col>26771485</Table.Col>
                    <Table.Col>Snyder</Table.Col>
                    <Table.Col>2016 Jan 14</Table.Col>
                    <Table.Col>Cell</Table.Col>
                    <Table.Col>60</Table.Col>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Card>
          </Grid.Col>
        </Grid.Row>

        <Grid.Row cards deck>
          <Grid.Col width={12}>
            <Card>
              <Table
                responsive
                highlightRowOnHover
                hasOutline
                verticalAlign="center"
                cards
                className="text-nowrap"
              >
                <Table.Header>
                  <Table.Row>
                    <Table.ColHeader alignContent="center" className="w-1">
                      <i className="icon-people" />
                    </Table.ColHeader>
                    <Table.ColHeader>User</Table.ColHeader>
                    <Table.ColHeader>Usage</Table.ColHeader>
                    <Table.ColHeader alignContent="center">
                      Payment
                    </Table.ColHeader>
                    <Table.ColHeader>Activity</Table.ColHeader>
                    <Table.ColHeader alignContent="center">
                      Satisfaction
                    </Table.ColHeader>
                    <Table.ColHeader alignContent="center">
                      <i className="icon-settings" />
                    </Table.ColHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  <Table.Row>
                    <Table.Col alignContent="center">
                      <Avatar
                        imageURL="demo/faces/female/26.jpg"
                        className="d-block"
                        status="green"
                      />
                    </Table.Col>
                    <Table.Col>
                      <div>Elizabeth Martin</div>
                      <Text size="sm" muted>
                        Registered: Mar 19, 2018
                      </Text>
                    </Table.Col>
                    <Table.Col>
                      <div className="clearfix">
                        <div className="float-left">
                          <strong>42%</strong>
                        </div>
                        <div className="float-right">
                          <Text.Small muted>
                            Jun 11, 2015 - Jul 10, 2015
                          </Text.Small>
                        </div>
                      </div>
                      <Progress size="xs">
                        <Progress.Bar color="yellow" width={42} />
                      </Progress>
                    </Table.Col>
                    <Table.Col alignContent="center">
                      <Icon payment name="visa" />
                    </Table.Col>
                    <Table.Col>
                      <Text size="sm" muted>
                        Last login
                      </Text>
                      <div>4 minutes ago</div>
                    </Table.Col>
                    <Table.Col alignContent="center">42%</Table.Col>
                    <Table.Col alignContent="center">
                      <Dropdown
                        trigger={
                          <Dropdown.Trigger
                            icon="more-vertical"
                            toggle={false}
                          />
                        }
                        position="right"
                        items={
                          <React.Fragment>
                            <Dropdown.Item icon="tag">Action </Dropdown.Item>
                            <Dropdown.Item icon="edit-2">
                              Another action{" "}
                            </Dropdown.Item>
                            <Dropdown.Item icon="message-square">
                              Something else here
                            </Dropdown.Item>
                            <Dropdown.ItemDivider />
                            <Dropdown.Item icon="link">
                              {" "}
                              Separated link
                            </Dropdown.Item>
                          </React.Fragment>
                        }
                      />
                    </Table.Col>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Card>
          </Grid.Col>
        </Grid.Row>
        <Grid.Row>
          <Grid.Col sm={6} lg={4}>
            <Card title="Browser Stats">
              <Table className="card-table">
                <Table.Row>
                  <Table.Col>
                    <Icon prefix="fa" name="chrome" className="text-muted" />
                  </Table.Col>
                  <Table.Col>Google Chrome</Table.Col>
                  <Table.Col className="text-right">
                    <Text RootComponent="span" muted>
                      23%
                    </Text>
                  </Table.Col>
                </Table.Row>
              </Table>
            </Card>
          </Grid.Col>
          <Grid.Col sm={6} lg={4}>
            <Card title="Projects">
              <Table cards>
                <Table.Row>
                  <Table.Col>Admin Template</Table.Col>
                  <Table.Col alignContent="right">
                    <Badge color="default">65%</Badge>
                  </Table.Col>
                </Table.Row>
              </Table>
            </Card>
          </Grid.Col>
          <Grid.Col md={6} lg={4}>
            <Card title="Members">
              <Card.Body>
                <ul className="list-unstyled list-separated">
                  <li className="list-separated-item">
                    <Grid.Row className="align-items-center">
                      <Grid.Col auto>
                        <Avatar
                          size="md"
                          className="d-block"
                          imageURL="demo/faces/female/12.jpg"
                        />
                      </Grid.Col>
                      <Grid.Col>
                        <div>
                          <a className="text-inherit" href="#">
                            Amanda Hunt
                          </a>
                        </div>
                        <Text.Small muted className="d-block item-except h-1x">
                          amanda_hunt@example.com
                        </Text.Small>
                      </Grid.Col>
                      <Grid.Col auto>
                        <Dropdown
                          trigger={
                            <Dropdown.Trigger
                              icon="more-vertical"
                              toggle={false}
                            />
                          }
                          position="right"
                          items={
                            <React.Fragment>
                              <Dropdown.Item icon="tag">Action </Dropdown.Item>
                              <Dropdown.Item icon="edit-2">
                                {" "}
                                Another action{" "}
                              </Dropdown.Item>
                              <Dropdown.Item icon="message-square">
                                {" "}
                                Something else here
                              </Dropdown.Item>
                              <Dropdown.ItemDivider />
                              <Dropdown.Item icon="link">
                                {" "}
                                Separated link
                              </Dropdown.Item>
                            </React.Fragment>
                          }
                        />
                      </Grid.Col>
                    </Grid.Row>
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </Grid.Col>
          <Grid.Col md={6} lg={12}>
            <Grid.Row>
              <Grid.Col sm={6} lg={3}>
                <StatsCard
                  layout={2}
                  movement={5}
                  total="423"
                  label="Users online"
                  chart={
                    <C3Chart
                      style={{ height: "100%" }}
                      padding={{
                        bottom: -10,
                        left: -1,
                        right: -1,
                      }}
                      data={{
                        names: {
                          data1: "Users online",
                        },
                        columns: [["data1", 30, 40, 10, 40, 12, 22, 40]],
                        type: "area",
                      }}
                      legend={{
                        show: false,
                      }}
                      transition={{
                        duration: 0,
                      }}
                      point={{
                        show: false,
                      }}
                      tooltip={{
                        format: {
                          title: function(x) {
                            return "";
                          },
                        },
                      }}
                      axis={{
                        y: {
                          padding: {
                            bottom: 0,
                          },
                          show: false,
                          tick: {
                            outer: false,
                          },
                        },
                        x: {
                          padding: {
                            left: 0,
                            right: 0,
                          },
                          show: false,
                        },
                      }}
                      color={{
                        pattern: ["#467fcf"],
                      }}
                    />
                  }
                />
              </Grid.Col>
              <Grid.Col sm={6} lg={3}>
                <StatsCard
                  layout={2}
                  movement={-3}
                  total="423"
                  label="Users online"
                  chart={
                    <C3Chart
                      style={{ height: "100%" }}
                      padding={{
                        bottom: -10,
                        left: -1,
                        right: -1,
                      }}
                      data={{
                        names: {
                          data1: "Users online",
                        },
                        columns: [["data1", 30, 40, 10, 40, 12, 22, 40]],
                        type: "area",
                      }}
                      legend={{
                        show: false,
                      }}
                      transition={{
                        duration: 0,
                      }}
                      point={{
                        show: false,
                      }}
                      tooltip={{
                        format: {
                          title: function(x) {
                            return "";
                          },
                        },
                      }}
                      axis={{
                        y: {
                          padding: {
                            bottom: 0,
                          },
                          show: false,
                          tick: {
                            outer: false,
                          },
                        },
                        x: {
                          padding: {
                            left: 0,
                            right: 0,
                          },
                          show: false,
                        },
                      }}
                      color={{
                        pattern: ["#e74c3c"],
                      }}
                    />
                  }
                />
              </Grid.Col>
              <Grid.Col sm={6} lg={3}>
                <StatsCard
                  layout={2}
                  movement={-3}
                  total="423"
                  label="Users online"
                  chart={
                    <C3Chart
                      style={{ height: "100%" }}
                      padding={{
                        bottom: -10,
                        left: -1,
                        right: -1,
                      }}
                      data={{
                        names: {
                          data1: "Users online",
                        },
                        columns: [["data1", 30, 40, 10, 40, 12, 22, 40]],
                        type: "area",
                      }}
                      legend={{
                        show: false,
                      }}
                      transition={{
                        duration: 0,
                      }}
                      point={{
                        show: false,
                      }}
                      tooltip={{
                        format: {
                          title: function(x) {
                            return "";
                          },
                        },
                      }}
                      axis={{
                        y: {
                          padding: {
                            bottom: 0,
                          },
                          show: false,
                          tick: {
                            outer: false,
                          },
                        },
                        x: {
                          padding: {
                            left: 0,
                            right: 0,
                          },
                          show: false,
                        },
                      }}
                      color={{
                        pattern: ["#5eba00"],
                      }}
                    />
                  }
                />
              </Grid.Col>
              <Grid.Col sm={6} lg={3}>
                <StatsCard
                  layout={2}
                  movement={9}
                  total="423"
                  label="Users online"
                  chart={
                    <C3Chart
                      style={{ height: "100%" }}
                      padding={{
                        bottom: -10,
                        left: -1,
                        right: -1,
                      }}
                      data={{
                        names: {
                          data1: "Users online",
                        },
                        columns: [["data1", 30, 40, 10, 40, 12, 22, 40]],
                        type: "area",
                      }}
                      legend={{
                        show: false,
                      }}
                      transition={{
                        duration: 0,
                      }}
                      point={{
                        show: false,
                      }}
                      tooltip={{
                        format: {
                          title: function(x) {
                            return "";
                          },
                        },
                      }}
                      axis={{
                        y: {
                          padding: {
                            bottom: 0,
                          },
                          show: false,
                          tick: {
                            outer: false,
                          },
                        },
                        x: {
                          padding: {
                            left: 0,
                            right: 0,
                          },
                          show: false,
                        },
                      }}
                      color={{
                        pattern: ["#f1c40f"],
                      }}
                    />
                  }
                />
              </Grid.Col>
            </Grid.Row>
          </Grid.Col>
          <Grid.Col width={12}>
            <Card title="Invoices">
              <Table
                responsive
                className="card-table table-vcenter text-nowrap"
                headerItems={[
                  { content: "No.", className: "w-1" },
                  { content: "Invoice Subject" },
                  { content: "Client" },
                  { content: "VAT No." },
                  { content: "Created" },
                  { content: "Status" },
                  { content: "Price" },
                  { content: null },
                  { content: null },
                ]}
                bodyItems={[
                  {
                    key: "1",
                    item: [
                      {
                        content: (
                          <Text RootComponent="span" muted>
                            001401
                          </Text>
                        ),
                      },
                      {
                        content: (
                          <a href="invoice.html" className="text-inherit">
                            Design Works
                          </a>
                        ),
                      },
                      { content: "Carlson Limited" },
                      { content: "87956621" },
                      { content: "15 Dec 2017" },
                      {
                        content: (
                          <React.Fragment>
                            <span className="status-icon bg-success" /> Paid
                          </React.Fragment>
                        ),
                      },
                      { content: "$887" },
                      {
                        alignContent: "right",
                        content: (
                          <React.Fragment>
                            <Button size="sm" color="secondary">
                              Manage
                            </Button>
                            <div className="dropdown">
                              <Button
                                color="secondary"
                                size="sm"
                                isDropdownToggle
                              >
                                Actions
                              </Button>
                            </div>
                          </React.Fragment>
                        ),
                      },
                      { content: <Icon link name="edit" /> },
                    ],
                  },
                ]}
              />
            </Card>
          </Grid.Col>
        </Grid.Row>
      </Page.Content>
    </SiteWrapper>
  );
}

export default Home;
