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
  StampCard,
} from "tabler-react";

import C3Chart from "react-c3js";

import SiteWrapper from "./SiteWrapper.react";


function ListItem(props) {
  // Correct! There is no need to specify the key here:
  return <li>{props.value}</li>;
}

function DiseaseList(props) {
  console.log(props);
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

function Blog(props) {
  const sidebar = (
    <Table.Header>
    <Table.Row>
      <Table.ColHeader>Publication Name</Table.ColHeader>
      <Table.ColHeader>PMID</Table.ColHeader>
      <Table.ColHeader>Author</Table.ColHeader>
      <Table.ColHeader>Year</Table.ColHeader>
      <Table.ColHeader>Journal</Table.ColHeader>
      <Table.ColHeader>Samples</Table.ColHeader>
      <Table.ColHeader>DOI</Table.ColHeader>

    </Table.Row>
  </Table.Header>
  //<Table.Body>
  );
  const content = props.pubs.map((pub) =>
  <Table.Row>
  <Table.Col>
    Cell-free DNA Comprises an In Vivo Nucleosome Footprint
    that Informs Its Tissues-Of-Origin.
  </Table.Col>
  <Table.Col>{pub.pmid}</Table.Col>
  <Table.Col>{pub.author}</Table.Col>
  <Table.Col>{pub.year}</Table.Col>
  <Table.Col>{pub.journal}</Table.Col>
  <Table.Col>60</Table.Col>
  <Table.Col>{pub.doi}</Table.Col>

</Table.Row>
  );
  return (
    <div>
      {sidebar}
      <Table.Body>
      {content} </Table.Body>
    </div>
  );
}




class Home extends Component {

    constructor(props) {
      super(props);
      this.state={data: null};
    }
    componentDidMount() {
      // Call our fetch function below once the component mounts
      this.callBackendAPI()
    }
    // Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
    callBackendAPI = async () => {
      var [response_data, response_pub] = await Promise.all ([ 
        fetch('/data'),
        fetch('/publications'),
      ]);
      const body_data = await response_data.json();
      const body_pub = await response_pub.json();

      if (response_data.status !== 200 || response_pub.status !== 200) {
        throw Error(body_data.message) 
      }

      console.log(body_data);
      console.log(body_pub);
      this.setState({ 
        diseases: body_data.diseases,
        platforms: body_data.platforms,
        libraryLayouts: body_data.libraryLayouts,
        readLengths: body_data.readLengths,
        publications: body_pub.publications,
       });
    };


  render() {

    const {diseases} = this.state;
    const {platforms} = this.state;
    const {libraryLayouts} = this.state;
    const {readLengths} = this.state;
    const {publications} = this.state;

    if (!diseases || !platforms || !libraryLayouts || !readLengths || !publications) return null;

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
                  <Blog pubs={publications}/>
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
                    // groups: [["data1", "data2", "data3"]],
                    // colors: {
                    //   data1: colors["blue"],
                    // },
                    // names: {
                    //   //name of each serie
                    //  data1: "Samples",
                    //  data2: " hello"
                    // },
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
                        columns: diseases,                        
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
                        show: false, //hide legend
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
                    <Card.Title>Platforms</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <C3Chart
                      style={{ height: "12rem" }}
                      data={{
                        columns: platforms,
                        type: "donut", // default type of chart
                        // colors: {
                        //   data1: colors["yellow-lighter"],
                        //   data2: colors["yellow-light"],
                        //   data3: colors["yellow"],
                        //   data4: colors["yellow-dark"],
                        // },
                        // names: {
                        //   // name of each serie
                        //   data1: "A",
                        //   data2: "B",
                        //   data3: "C",
                        //   data4: "D",
                        // },
                      }}
                      legend={{
                        show: false, //hide legend
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
                    <Card.Title>Library Layouts</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <C3Chart
                      style={{ height: "12rem" }}
                      data={{
                        columns: libraryLayouts,
                        type: "donut", // default type of chart
                        // colors: {
                        //   data1: colors["yellow-lighter"],
                        //   data2: colors["yellow-light"],
                        //   data3: colors["yellow"],
                        //   data4: colors["yellow-dark"],
                        // },
                        // names: {
                        //   // name of each serie
                        //   data1: "A",
                        //   data2: "B",
                        //   data3: "C",
                        //   data4: "D",
                        // },
                      }}
                      legend={{
                        show: false, //hide legend
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
                    <Card.Title>Read lengths</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <C3Chart
                      style={{ height: "12rem" }}
                      data={{
                        columns: readLengths,
                        type: "donut", // default type of chart
                        // colors: {
                        //   data1: colors["yellow-lighter"],
                        //   data2: colors["yellow-light"],
                        //   data3: colors["yellow"],
                        //   data4: colors["yellow-dark"],
                        // },
                        // names: {
                        //   // name of each serie
                        //   data1: "A",
                        //   data2: "B",
                        //   data3: "C",
                        //   data4: "D",
                        // },
                      }}
                      legend={{
                        show: false, //hide legend
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

                  <Blog pubs={publications}/>
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
