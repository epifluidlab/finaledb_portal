// @flow

import * as React from "react";
import { Component } from "react";

import {
  Page,
  Avatar,
  Icon,
  Grid,
  Card,
  Table,
  colors,
  StampCard,
} from "tabler-react";

import C3Chart from "react-c3js";

import SiteWrapper from "./SiteWrapper.react";


const diseases =  [[1, 2], [3, 4], [5]];




class Home extends Component {
  state = {
      data: null
    };
    componentDidMount() {
      // Call our fetch function below once the component mounts
    this.callBackendAPI()
      .then(res => this.setState({ data: res.nice }))
      .catch(err => console.log(err));
  }
    // Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
    callBackendAPI = async () => {
      const response = await fetch('/users');
      const body = await response.json();
  
      if (response.status !== 200) {
        throw Error(body.message) 
      }
      return body;
    };


  render() {
    const {data} = this.state;
    function ListItem(props) {
      // Correct! There is no need to specify the key here:
      return <li>{props.value}</li>;
    }
    
    function DiseaseList(props) {
      const diseases = props.diseases;
      const listItems = diseases.map((disease) =>
        // Correct! Key should be specified inside the array.
        <ListItem key={disease.toString()}
                  value={disease} />
      );
      return (
        <ul>
          {listItems}
        </ul>
      );
    }

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
                <div>{data}</div>
                <DiseaseList diseases={diseases} />
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
                  <Card.Title>Samples per publication</Card.Title>
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
                    type: "bar", // default type of chart
                    groups: [["data1", "data2", "data3"]],
                    colors: {
                      data1: colors["blue"],
                    },
                    names: {
                      // name of each serie
                      data1: "Samples",
                    },
                  }}
                  axis={{
                    y: {
                      padding: {
                        bottom: 0,
                      },
                      show: true,
                      tick: {
                        outer: true,
                      },
                    },
                    x: {
                      type: "category",
                      categories: ["Snyder 2016", "Snyder 2016", "Snyder 2016", "Snyder 2016", "Snyder 2016", "Snyder 2016"],
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
                    show: true,
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
                        columns: 
                        <DiseaseList diseases={this.state.data} />,
                        
                        //[
                          // each columns data
                         // ["data1", 63],
                         // ["data2", 37],
                        //],
                        type: "donut", // default type of chart
                        //colors: {
                        //  data1: colors["red-light"],
                        //  data2: colors["red"],
                        //},
                        //names: {
                        //  // name of each serie
                        //  data1: "Maximum",
                        //  data2: "Minimum",
                        //},
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
                      <Table.ColHeader>Samples</Table.ColHeader>
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
          
          
          
          
        </Page.Content>
      </SiteWrapper>
    );
  }
}

export default Home;
