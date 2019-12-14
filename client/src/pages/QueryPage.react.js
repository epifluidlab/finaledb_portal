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
import SamplesTable from '../components/SamplesTable';

import 'nouislider';
import 'nouislider/distribute/nouislider.css';
import request from "../utils/request";




function GetReadLengths(props) {
  const content = props.read_lengths.map((read_length) =>
    <Form.Checkbox
      isInline
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
  const content = props.platforms.map(({ platform }) =>
    <Form.Checkbox
      isInline
      name="example-radios"
      label={platform}
      value={platform}
      onChange={props.onChange('platform', platform)}
    />
  );
  return (
    <Table.Row>
      <Table.Col>
        <Form.Group label="Platform">
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
  const content = props.libraryLayouts.map((layout) =>
    <Form.Checkbox
      isInline
      name="example-radios"
      label={layout}
      value={layout}
      onChange={props.onChange('libraryLayout', layout)}
    />
  );
  return (
    <Table.Row>
      <Table.Col>
        <Form.Group label="Library format">
          {content}
        </Form.Group>
      </Table.Col>
    </Table.Row>
  );
}

class FormElements extends Component {

  constructor(props) {
    super(props);
    this.initialFormState = {
      genomeAssembly: {},
      repository: {},
      platform: {},
      libraryLayout: {},
      diseaseStatus: {},
      minReadLength: 10,
      maxReadLength: 100,
      minAge: 10,
      maxAge: 100,
    }

    this.state = {
      data: null,
      form: this.initialFormState,
    };
  }

  componentDidMount() {
    // Call our fetch function below once the component mounts
    this.callBackendAPI()
  }

  // Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
  callBackendAPI = async () => {
    const [data, samples, platforms, publications] = await Promise.all([
      request('/data'),
      request('/samples'),
      request('/samples/platforms'),
      request('/publications'),
    ]);

    this.setState({
      diseases: data.diseases,
      platforms,
      libraryLayouts: data.libraryLayouts,
      readLengths: data.readLengths,
      publications,
      samples,
    });
  }

  fetchSamples = async () => {
    const samples = await request('/samples' + this.formToQueryString());
    this.setState({
      samples,
    });
  }

  formToQueryString = () => {
    let qs = '?';
    const attrs = ['platform'];

    for (const attr of attrs) {
      const filterString = this.getFilterForAttr(attr);
      if (filterString.length) {
        qs += `${attr}=${filterString}&`;
      }
    }
    console.log(qs);
    return qs;
  }

  getFilterForAttr = (attr) => {
    const { form } = this.state;

    if (!form[attr]) return '';

    return Object.keys(form[attr])
      .filter((key) => form[attr][key])
      // .map((key) => `"${key}"`)
      .join(',');
  }

  updateFormMultipleValues = (name, value) => () => {
    this.setState({
      form: {
        ...this.state.form,
        [name]: {
          ...this.state.form[name],
          [value]: !this.state.form[name][value]
        }
      }
    }, () => this.fetchSamples());
  }

  updateFormValue = (e) => {
    this.setState({
      form: {
        ...this.state.form,
        [e.target.name]: e.target.value
      }
    });
  }

  resetForm = () => {
    this.setState({
      form: this.initialFormState,
    });
  }

  render() {

    const {
      diseases,
      platforms,
      libraryLayouts,
      readLengths,
      publications,
      samples,
      form
    } = this.state;

    if (!diseases || !platforms || !libraryLayouts || !readLengths || !publications || !samples) return null;

    return (
      <SiteWrapper>
        <Page.Content title="Search samples">
          <Grid.Row cards={true} justifyContent="flex-end">
            <Grid.Col>
              <Button.List>
                <Button link icon="x" onClick={this.resetForm}>
                  Clear all fields
                </Button>
              </Button.List>
            </Grid.Col>
          </Grid.Row>

          <Grid.Row cards={true}>
            <Grid.Col>
              <Card>
                <Table className="card-table table-vcenter">
                  <Table.Body>
                    <Table.Row>
                      <Table.Col>
                        <Form.Group label="Genome assembly">
                          <Form.SelectGroup canSelectMultiple>
                            <Form.SelectGroupItem
                              name="device"
                              label="hg19"
                              value="hg19"
                              checked={form.genomeAssembly['hg19']}
                              onChange={this.updateFormMultipleValues('genomeAssembly', 'hg19')}
                            />
                            <Form.SelectGroupItem
                              name="device"
                              label="hg38"
                              value="hg39"
                              checked={form.genomeAssembly['hg38']}
                              onChange={this.updateFormMultipleValues('genomeAssembly', 'hg38')}
                            />
                          </Form.SelectGroup>
                        </Form.Group>
                      </Table.Col>
                    </Table.Row>
                    <Table.Row>
                      <Table.Col>
                        <Form.Group label="Repository">
                          <Form.Checkbox
                            isInline
                            name="example-radios"
                            label="GEO"
                            value="option1"
                            checked={form.repository['GEO']}
                            onChange={this.updateFormMultipleValues('repository', 'GEO')}
                          />
                          <Form.Checkbox
                            isInline
                            name="example-radios"
                            label="dbGaP"
                            value="option2"
                            checked={form.repository['dbGaP']}
                            onChange={this.updateFormMultipleValues('repository', 'dbGaP')}
                          />
                          <Form.Checkbox
                            disabled
                            isInline
                            name="example-radios"
                            label="ENA"
                            value="option3"
                            checked={form.repository['ENA']}
                            onChange={this.updateFormMultipleValues('repository', 'ENA')}
                          />
                        </Form.Group>
                      </Table.Col>
                    </Table.Row>
                    <GetPlatforms
                      platforms={platforms}
                      onChange={this.updateFormMultipleValues}
                    />
                    <GetLibraryLayouts
                      libraryLayouts={['SINGLE', 'PAIRED']}
                      onChange={this.updateFormMultipleValues}
                    />
                    <GetDiseases diseases={diseases} />

                    <Table.Row>
                      <Table.Col>
                        <Grid.Row>
                          <Grid.Col>
                            <Form.Group label="Minimum read length">
                              <Form.Input
                                name="minReadLength"
                                placeholder={10}
                                type='number'
                                value={form.minReadLength}
                                onChange={this.updateFormValue}
                              />
                            </Form.Group>
                          </Grid.Col>
                          <Grid.Col>
                            <Form.Group label="Maximum read length">
                              <Form.Input
                                name="maxReadLength"
                                value={form.maxReadLength}
                                placeholder={100}
                                type='number'
                                onChange={this.updateFormValue}
                              />
                            </Form.Group>
                          </Grid.Col>
                        </Grid.Row>
                      </Table.Col>
                    </Table.Row>


                    <Table.Row>
                      <Table.Col>
                        <Grid.Row>
                          <Grid.Col>
                            <Form.Group label="Minimum age">
                              <Form.Input
                                name="minAge"
                                placeholder={10}
                                type='number'
                                value={form.minAge}
                                onChange={this.updateFormValue}
                              />
                            </Form.Group>
                          </Grid.Col>
                          <Grid.Col>
                            <Form.Group label="Maximum age">
                              <Form.Input
                                name="maxAge"
                                placeholder={100}
                                type='number'
                                value={form.maxAge}
                                onChange={this.updateFormValue}
                              />
                            </Form.Group>
                          </Grid.Col>
                        </Grid.Row>
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
                  <SamplesTable samples={samples} />
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
