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

import SiteWrapper from "./SiteWrapper";
import request from "../utils/request";
import SamplesTable from "../components/SamplesTable";


function PublicationTable(props) {
  const header = (
    <Table.Header>
      <Table.Row>
        <Table.ColHeader>Publication Name</Table.ColHeader>
        <Table.ColHeader>Author</Table.ColHeader>
        <Table.ColHeader>Date</Table.ColHeader>
        <Table.ColHeader>Journal</Table.ColHeader>
        <Table.ColHeader>PMID</Table.ColHeader>
        <Table.ColHeader>DOI</Table.ColHeader>
      </Table.Row>
    </Table.Header>
  );
  const content = props.pubs.map((pub) =>
    <Table.Row>
      <Table.Col>
        <a href={pub.link}>
          {pub.title}
        </a>
      </Table.Col>
      <Table.Col>{pub.author}</Table.Col>
      <Table.Col>{pub.date}</Table.Col>
      <Table.Col>{pub.journal}</Table.Col>
      <Table.Col>{pub.pmid}</Table.Col>
      <Table.Col>
        {pub.doi}
      </Table.Col>
    </Table.Row>
  );
  return (
    <div>
      {header}
      <Table.Body>
        {content}
      </Table.Body>
    </div>
  );
}




class Home extends Component {
  constructor(props) {
    super(props);
    this.state = { data: null };
  }

  componentDidMount() {
    // Call our fetch function below once the component mounts
    this.callBackendAPI()
  }

  // Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
  callBackendAPI = async () => {
    const [data, publications, samples] = await Promise.all([
      request('/data'),
      request('/publications'),
      request('/samples'),
    ]);

    this.setState({
      diseases: data.diseases,
      platforms: data.platforms,
      libraryFormats: data.libraryFormats,
      assayTypes: data.assayTypes,
      readLengths: data.readLengths,
      tissues: data.tissues,
      publications,
      samples,
    });
  };


  render() {
    const { 
      diseases, 
      platforms, 
      libraryFormats, 
      assayTypes,
      readLengths, 
      tissues,
      publications,
      samples 
    } = this.state;

    if (!diseases || !platforms || !libraryFormats || !assayTypes || !readLengths || !tissues || !publications || !samples) return null;

    console.log(Array.from(diseases))
    return (
      <SiteWrapper>
        <Page.Content>
          <Grid.Row cards={true} gutters={"lg"}>
            <Grid.Col lg={9}>
              <Card>
                <Card.Header>
                  <Card.Title>About cfDB</Card.Title>
                </Card.Header>
                <Card.Body>
                  With the recent surge in cfDNA studies and datasets, a platform to collect and uniformly process published data is needed. 
                  Through a publicly accessible database that makes all datasets from current published and preprint studies reusable and comparable, 
                  researchers will be able to further understand the genetics and epigenetics behind cfDNA and its diagnostic implications. 
                  Here, we developed a comprehensive cfDNA database, cfDB, dedicated to integrating, analyzing, and visualizing cfDNA data for the benefit of the cfDNA research community. 
                  Beginning with a large collection of raw sequence data from available studies and uniformly processing this raw data for effective presentation and interpretation, 
                  cfDNA database provides a user-friendly web interface with powerful browse and search capacities, as well as data visualization and downloading functions.
                </Card.Body>
              </Card>


              <Card>
                <Card.Header>
                  <Card.Title>Sample Number per Disease</Card.Title>
                </Card.Header>
                <C3Chart
                  data={{
                    columns: diseases,
                    type: "bar",
                  }}

                  legend={{
                    show: true,
                    position: "bottom",
                    padding: 0,
                  }}
                  tooltip={{
                    format: {
                      title: function (x) {
                        return "";
                      },
                    },
                  }}
                  axis={{
                    x: {
                      show:true
                    }
                    ,
                    y: {
                      show: true
                    }
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
                  <PublicationTable pubs={publications} />
                </Table>
              </Card>

            </Grid.Col>

            <Grid.Col sm={3}>
              <Grid.Row>
                <StampCard
                  color="blue-light"
                  icon="activity"
                  header={
                    <a href="#">
                      {samples.length} <small>Samples</small>
                    </a>
                  }
                />

                <StampCard
                  color="green-light"
                  icon="book-open"
                  header={
                    <a href="#">
                      {publications.length} <small>Publications</small>
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
                        type: "donut", // default type of chart
                      }}
                      donut={{
                        label: {
                          format: function (value, ratio, id) {
                            return value;
                          }
                        }
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
                    <Card.Title>Assay Types</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <C3Chart
                      style={{ height: "12rem" }}
                      data={{
                        columns: assayTypes,
                        type: "donut", // default type of chart
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
                    <Card.Title>Tissues</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <C3Chart
                      style={{ height: "12rem" }}
                      data={{
                        columns: tissues,
                        type: "donut", // default type of chart
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

        </Page.Content>
      </SiteWrapper>
    );
  }
}

export default Home;
