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
import Browser from '../components/Browser';

import request from "../utils/request";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function RenderPDF(props) {
  const pdfFile = props.pdfFile;
  const onLoadSuccess = props.onLoadSuccess;

    return (
      <Grid.Row>
        <Grid.Col>
          { 
          pdfFile ? 
            <Document
              file={pdfFile}
              onLoadSuccess={onLoadSuccess}
              onLoadError={console.error}
            >
              <PdfPage pageNumber={1} loading="loading..." error="error" />
            </Document>

            :
            <Card
              body={`Please select a sample from the query page.
              Chose a genome assembly here.`}
            />
          }
        </Grid.Col>
      </Grid.Row>
  
    );
}


class FormElements extends Component {


  constructor(props) {
    super(props);

    const { sraId } = props.match.params;

    this.initialFormState = {
      genomeAssembly: 'hg38',
      sraId,
      pdfFile: `https://psc-cfdna.s3.us-east-2.amazonaws.com/${sraId}/${sraId}.hg38.insert_size_histogram.pdf`,
      bamFile: `https://psc-cfdna.s3.us-east-2.amazonaws.com/${sraId}/${sraId}.hg38.mdups.bam`,
    }

    this.state = {
      data: null,
      form: this.initialFormState,
    };
  }

  async componentDidMount() {
    const { sraId } = this.props.match.params;
    const samples = await request(`/samples?sraId=${sraId}&`);

    this.setState({
      form: {
        ...this.state.form,
        sraId,
      },
      samples,
    });
  }

  updateFormValue = (e) => {
    this.setState({
      form: {
        ...this.state.form,
        [e.target.name]: e.target.value
      }
    }, () => this.setPdfAddress());
  }

  setPdfAddress() {
    const { sraId, genomeAssembly } = this.state.form;
    const pdfFile = `https://psc-cfdna.s3.us-east-2.amazonaws.com/${sraId}/${sraId}.${genomeAssembly}.insert_size_histogram.pdf`;
    const bamFile = `https://psc-cfdna.s3.us-east-2.amazonaws.com/${sraId}/${sraId}.${genomeAssembly}.mdups.bam`;


    this.setState({
      form: {
        ...this.state.form,
        pdfFile,
        bamFile,
      },
    });

  }

  onDocumentLoadSuccess(pdf) {
    console.log("success");
    console.log(pdf);
  }

  render() {
    const {
      samples,
      form,
    } = this.state;

    const { sraId } = this.props.match.params;

    if (!samples) return null;

    return (
      <SiteWrapper>
        <Page.Content>


          <Grid.Row cards={true}>
            <Grid.Col>
              <Card>
                <Table className="card-table table-vcenter">
                  <Table.Body>
                    <Table.Row>
                      <Table.Col>
                        <Form.Group label="Human Reference Genome (choose one)">
                          <Form.SelectGroup>
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
                              value="hg38"
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
              <Card>
                <RenderPDF
                  pdfFile={form.pdfFile}
                  onLoadSuccess={this.onDocumentLoadSuccess}
                />
              </Card>
            </Grid.Col>
          </Grid.Row>

          <Grid.Row>
            <Grid.Col>
              <Card>
                <Browser
                  sraId={sraId}
                  genomeAssembly={form.genomeAssembly}
                  bamFile={form.bamFile}
                />
              </Card>
            </Grid.Col>
          </Grid.Row>





        </Page.Content>

      </SiteWrapper>


    );
  }
}

export default FormElements;
