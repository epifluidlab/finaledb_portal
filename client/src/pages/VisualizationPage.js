// @flow

import * as React from "react";
import { Component } from "react";
import { Document, Page as PdfPage, pdfjs } from "react-pdf";


import {
  Page,
  Card,
  Grid,
  Table,
  Form,
  Button,
  Text,
} from "tabler-react";

import SiteWrapper from "./SiteWrapper";
import SamplesTable from '../components/SamplesTable';

import request from "../utils/request";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

class FormElements extends Component {


  constructor(props) {
    super(props);

    this.initialFormState = {
      genomeAssembly: 'none',
      sraId: 'none',
    }

    this.state = {
      data: null,
      form: this.initialFormState,
    };
  }

  async componentDidMount() {
    const { sraId } = this.props.match.params;
    const samples = await request(`/samples?sraId=${sraId}&`);
    this.state.form.sraId = sraId;

    this.setState({
      samples,
    });
  }

  updateFormValue = (e) => {
    this.setState({
      form: {
        ...this.state.form,
        [e.target.name]: e.target.value
      }
    }, () => this.logHg());
  }

  logHg() {
    const genomeAssembly = this.state.form;
    console.log(genomeAssembly);
  }

  onDocumentLoadSuccess(pdf) {
    console.log("success");
    console.log(pdf);
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
                              name="genomeAssembly"
                              label="hg19 (GRCh37)"
                              value="hg19"
                              checked={form.genomeAssembly['hg19']}
                              onChange={this.updateFormValue}
                            />
                            <Form.SelectGroupItem
                              name="genomeAssembly"
                              label="hg38 (GRCh38)"
                              value="hg39"
                              checked={form.genomeAssembly['hg38']}
                              onChange={this.updateFormValue}
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


          <Grid.Row>
            <Grid.Col>
                <Document
                  file="https://psc-cfdna.s3.us-east-2.amazonaws.com/SRR2129994/SRR2129994.hg19.insert_size_histogram.pdf"
                  onLoadSuccess={this.onDocumentLoadSuccess}
                  onLoadError={console.error}
                >
                  <PdfPage pageNumber={1} loading="loading..." error="error" />
                </Document>
            </Grid.Col>
          </Grid.Row>


        </Page.Content>

      </SiteWrapper>


    );
  }
}

export default FormElements;
