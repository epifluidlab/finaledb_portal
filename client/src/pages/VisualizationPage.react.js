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
import SamplesTable from '../components/SamplesTable';

import request from "../utils/request";

class FormElements extends Component {

  constructor(props) {
    super(props);

    this.initialFormState = {
      genomeAssembly: {},
      sraId: null,
    }

    this.state = {
      data: null,
      form: this.initialFormState,
    };
  }

  componentDidMount() {
    // Call our fetch function below once the component mounts
    this.callBackendAPI()

    const { handle } = this.props.match.params 

    fetch(`http://localhost:3000/visualization/${handle}`)
      .then((sraId) => {
        this.setState(() => ({ sraId }))
      })
  }


  // Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
  callBackendAPI = async () => {
    const [samples] = await Promise.all([
      request('/samples'),
    ]);

    // this.setState({
    //   samples,
    // });

    this.fetchSample()
  }


  fetchSample = async () => {
    const samples = await request('/samples' + this.formToQueryString());
    this.setState({
      samples,
    });
  }

  formToQueryString = () => {
    const { sraId } = this.props.match.params;
    // console.log(sraId)

    let qs = '?';
    qs += 'sraId=' + sraId + '&';

    // console.log(qs);
    return qs;
  }

  updateFormMultipleValues = (name, value) => () => {
    console.log(this.state.form);

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


  render() {

    const {
      samples,
      form
    } = this.state;
  
    if (!samples) return null;

    return (
      <SiteWrapper>
        <Page.Content>
          <Grid.Row cards={true}>
            <Grid.Col>
              <Card>
                <Card.Body>
                  <Form.Group label="Region search">
                    <Form.InputGroup>
                      <Form.Input placeholder="Search for chromosome coordinate, rsID, gene name..." />
                      <Form.InputGroupAppend>
                        <Button
                          color="primary"
                          outline
                          icon="search"
                          href="http://www.google.com"
                        />
                      </Form.InputGroupAppend>
                    </Form.InputGroup>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Grid.Col>
          </Grid.Row>

          <Grid.Row cards={true}>
            <Grid.Col>
              <Card>
                <Table className="card-table table-vcenter">
                  <Table.Body>
                    <Table.Row>
                      <Table.Col>
                        <Form.Group label="Human Reference Genome">
                          <Form.SelectGroup canSelectMultiple>
                            <Form.SelectGroupItem
                              name="device"
                              label="hg19 (GRCh37)"
                              value="hg19"
                              checked={form.genomeAssembly['hg19']}
                              onChange={this.updateFormMultipleValues('genomeAssembly', 'hg19')}
                            />
                            <Form.SelectGroupItem
                              name="device"
                              label="hg38 (GRCh38)"
                              value="hg39"
                              checked={form.genomeAssembly['hg38']}
                              onChange={this.updateFormMultipleValues('genomeAssembly', 'hg38')}
                            />
                          </Form.SelectGroup>
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
