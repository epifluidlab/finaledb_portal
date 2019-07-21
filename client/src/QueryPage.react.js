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


function SamplesTable(props) {
  const header = (
    <Table.Header>
    <Table.Row>
      <Table.ColHeader>Sample Name</Table.ColHeader>
      <Table.ColHeader>Disease status</Table.ColHeader>
      <Table.ColHeader>Run type</Table.ColHeader>
      <Table.ColHeader>len.</Table.ColHeader>
      <Table.ColHeader>Datatype</Table.ColHeader>
      <Table.ColHeader>Publication</Table.ColHeader>
      <Table.ColHeader alignContent="center">
        <i className="icon-settings" />
      </Table.ColHeader>
    </Table.Row>
  </Table.Header>
  );
  const content = props.samples.map((sample) =>
    <Table.Row>
      <Table.Col>
        <div>{sample.sample_name}</div>
        <Text size="sm" muted>
          {sample.sra_id}
        </Text>
      </Table.Col>
      <Table.Col> 
        {sample.disease}
        <Text size="sm" muted>
          {sample.sex}     {sample.age}
        </Text>
      </Table.Col>
      <Table.Col> {sample.se_pe} </Table.Col>
      <Table.Col> {sample.read_length} </Table.Col>
      <Table.Col> {sample.datatype} </Table.Col>
      <Table.Col>
        <Button link size="sm" RootComponent="a" href={sample.link} target="_blank">
          {sample.doi}
        </Button>
      </Table.Col>
      <Table.Col alignContent="center">
        <Button.List>
          <Button icon="download" size="sm" />
          <Button icon="plus" size="sm" />
        </Button.List>
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



function GetReadLengths(props) {
  const content = props.read_lengths.map((read_length) =>
        <Form.Checkbox
          name="example-radios"
          label={read_length[0]}
          value={read_length[0]}
        />
  );
  return (
    <Table.Row>
      <Table.Col>
        <Form.Group label="Read length">
          {content}
        </Form.Group>
      </Table.Col>
    </Table.Row>
  );
}

function GetPlatforms(props) {
  const content = props.platforms.map((platform) =>
        <Form.Checkbox
          isInline
          name="example-radios"
          label={platform[0]}
          value={platform[0]}
        />
  );
  return (
    <Table.Row>
      <Table.Col>
        <Form.Group label="Instrument">
          {content}
        </Form.Group>
      </Table.Col>
    </Table.Row>
  );
}

function GetDiseases(props) {
  const content = props.diseases.map((disease) =>
        <Form.Checkbox
          isInline
          name="example-radios"
          label={disease[0]}
          value={disease[0]}
        />
  );
  return (
    <Table.Row>
      <Table.Col>
        <Form.Group label="Disease status">
          {content}
        </Form.Group>
      </Table.Col>
    </Table.Row>
  );
}


function GetLibraryLayouts(props) {
  const content = props.library_layouts.map((library_layout) =>
        <Form.Checkbox
          isInline
          name="example-radios"
          label={library_layout[0]}
          value={library_layout[0]}
        />
  );
  return (
    <Table.Row>
      <Table.Col>
        <Form.Group label="Library layout">
          {content}
        </Form.Group>
      </Table.Col>
    </Table.Row>
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
      samples: body_data.samples,
     });

  };

  render() {

    const {diseases} = this.state;
    const {platforms} = this.state;
    const {libraryLayouts} = this.state;
    const {readLengths} = this.state;
    const {publications} = this.state;
    const {samples} = this.state;

    console.log(publications);
    console.log(readLengths);

    if (!diseases || !platforms || !libraryLayouts || !readLengths || !publications || !samples) return null;
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
            <Grid.Col >
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
                      <GetPlatforms platforms={platforms}/>
                      <GetLibraryLayouts library_layouts={libraryLayouts}/>
                      <GetReadLengths read_lengths={readLengths}/>
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
                    <GetDiseases diseases={diseases}/>
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
                  <SamplesTable samples={samples}/>
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
