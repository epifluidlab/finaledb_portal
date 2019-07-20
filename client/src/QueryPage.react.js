// @flow

import * as React from "react";
import { Component } from "react";


import {
  Page,
  Card,
  Grid,
  Table,
  Form,
  Button,
  Text,
} from "tabler-react";

import SiteWrapper from "./SiteWrapper.react";

function GetReadLengths(props) {
  console.log(props.read_lengths);
  const content = props.read_lengths.map((read_length) =>
        <Form.Checkbox
          name="example-radios"
          label={read_length}
          value="option1"
        />
  );
  return (
    <div>
      <Table.Col>
        <Form.Group label="Read length">
          {content}
        </Form.Group>
      </Table.Col>
    </div>
  );
}




class FormElements extends Component {

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

    console.log(publications);
    console.log(readLengths);

    if (!diseases || !platforms || !libraryLayouts || !readLengths || !publications) return null;
    return (
      <SiteWrapper>
        <Page.Content title="Search samples">
          <Grid.Row cards={true} justifyContent="flex-end">
            <Grid.Col>
              <Button.List>
                <Button link icon="x">
                  Clear all fields
                </Button>
              </Button.List>
            </Grid.Col>
          </Grid.Row>

          <Grid.Row cards={true}>
            <Grid.Col md={2}>
              <Card>
                <Table className="card-table table-vcenter">
                  <Table.Body>
                    <Table.Row>
                      <Table.Col>
                        <Form.Group label="Genome assembly">
                          <Form.SelectGroup>
                            <Form.SelectGroupItem
                              name="device"
                              label="hg19"
                              value="hg19"
                            />
                            <Form.SelectGroupItem
                              name="device"
                              label="hg38"
                              value="hg39"
                            />
                          </Form.SelectGroup>
                        </Form.Group>
                      </Table.Col>
                    </Table.Row>
                    <Table.Row>
                      <Table.Col>
                        <Form.Group label="Repository">
                          <Form.Checkbox
                            name="example-radios"
                            label="NCBI"
                            value="option1"
                          />
                          <Form.Checkbox
                            name="example-radios"
                            label="dbGaP"
                            value="option2"
                          />
                          <Form.Checkbox
                            disabled
                            name="example-radios"
                            label="ENA"
                            value="option3"
                          />
                        </Form.Group>
                      </Table.Col>
                    </Table.Row>
                    <Table.Row>
                      <Table.Col>
                        <Form.Group label="Platform">
                          <Form.Checkbox
                            name="example-radios"
                            label="Ilumina HiSeq 2000"
                            value="option1"
                          />
                          <Form.Checkbox
                            name="example-radios"
                            label="Ilumina HiSeq 2500"
                            value="option2"
                          />
                          <Form.Checkbox
                            name="example-radios"
                            label="Ilumina HiSeq 4000"
                            value="option3"
                          />
                        </Form.Group>
                      </Table.Col>
                    </Table.Row>
                    <Table.Row>
                      <Table.Col>
                        <Form.Group label="Run type">
                          <Form.Checkbox
                            name="example-radios"
                            label="single-ended"
                            value="option1"
                          />
                          <Form.Checkbox
                            name="example-radios"
                            label="paird-ended"
                            value="option2"
                          />
                        </Form.Group>
                      </Table.Col>
                    </Table.Row>
                    <Table.Row>
                      <GetReadLengths read_lengths={readLengths}/>
                    </Table.Row>
                    <Table.Row>
                      <Table.Col>
                        <Form.Group label="Age">
                          <Form.Checkbox
                            isInline
                            name="0-10"
                            label="0-10"
                            value="option1"
                          />
                          <Form.Checkbox
                            isInline
                            name="example-radios"
                            label="11-20"
                            value="option2"
                          />
                          <Form.Checkbox
                            isInline
                            name="example-radios"
                            label="21-30"
                            value="option2"
                          />
                          <Form.Checkbox
                            isInline
                            name="example-radios"
                            label="31-40"
                            value="option2"
                          />
                          <Form.Checkbox
                            isInline
                            name="example-radios"
                            label="41-50"
                            value="option2"
                          />
                          <Form.Checkbox
                            isInline
                            name="example-radios"
                            label="51-60"
                            value="option2"
                          />
                          <Form.Checkbox
                            isInline
                            name="example-radios"
                            label="61-70"
                            value="option2"
                          />
                          <Form.Checkbox
                            isInline
                            name="example-radios"
                            label="71-80"
                            value="option2"
                          />
                          <Form.Checkbox
                            isInline
                            name="example-radios"
                            label="81-90"
                            value="option2"
                          />
                        </Form.Group>
                      </Table.Col>
                    </Table.Row>
                    <Table.Row>
                      <Table.Col>
                        <Form.Group label="Disease status">
                          <Form.Checkbox
                            name="example-radios"
                            label="healthy"
                            value="option1"
                          />
                          <Form.Checkbox
                            name="example-radios"
                            label="lung cancer"
                            value="option2"
                          />
                          <Form.Checkbox
                            name="example-radios"
                            label="athersclerosis"
                            value="option3"
                          />
                          <Form.Checkbox
                            name="example-radios"
                            label="athersclerosis"
                            value="option3"
                          />
                          <Form.Checkbox
                            name="example-radios"
                            label="athersclerosis"
                            value="option3"
                          />
                        </Form.Group>
                      </Table.Col>
                    </Table.Row>
                  </Table.Body>
                </Table>
              </Card>
            </Grid.Col>

            <Grid.Col>

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
                      <Table.ColHeader>Sample Name</Table.ColHeader>
                      <Table.ColHeader>Disease status</Table.ColHeader>
                      <Table.ColHeader>Sex</Table.ColHeader>
                      <Table.ColHeader>Age</Table.ColHeader>
                      <Table.ColHeader>Run type</Table.ColHeader>
                      <Table.ColHeader>len.</Table.ColHeader>
                      <Table.ColHeader>Datatype</Table.ColHeader>
                      <Table.ColHeader>PMID</Table.ColHeader>
                      <Table.ColHeader alignContent="center">
                        <i className="icon-settings" />
                      </Table.ColHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    <Table.Row>
                      <Table.Col>
                        <div>Sample Name</div>
                        <Text size="sm" muted>
                          SRA ID
                        </Text>
                      </Table.Col>
                      <Table.Col>
                        <div>Lung cancer</div>
                      </Table.Col>
                      <Table.Col>
                        <div>Female</div>
                      </Table.Col>
                      <Table.Col>
                        <div>39</div>
                      </Table.Col>
                      <Table.Col>
                        <div>PAIRED</div>
                      </Table.Col>
                      <Table.Col>
                        <div>39</div>
                      </Table.Col>
                      <Table.Col>
                        <div>WGS</div>
                      </Table.Col>
                      <Table.Col>
                        <Button link size="sm">
                          26771485
                        </Button>
                      </Table.Col>
                      <Table.Col alignContent="center">
                        <Button.List>
                          <Button icon="download" size="sm" />
                          <Button icon="check" size="sm" />
                        </Button.List>
                      </Table.Col>
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

export default FormElements;
