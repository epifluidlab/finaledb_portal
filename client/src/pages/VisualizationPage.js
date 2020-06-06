// @flow

import * as React from 'react';
import { Component } from 'react';
// import { Document, Page as PdfPage, pdfjs } from "react-pdf";

import { Page, Card, Grid, Table, Form, Button, Text } from 'tabler-react';

import SiteWrapper from './SiteWrapper';
import SamplesTable from '../components/SamplesTable';
// import Browser from '../components/Browser';
import EpiBrowser from '../containers/EpiBrowser';
import Charts from '../components/Charts';

import request from '../utils/request';

// pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// function RenderPDF(props) {
//   const pdfFile = props.pdfFile;
//   const onLoadSuccess = props.onLoadSuccess;

//     return (
//       <Grid.Row>
//         <Grid.Col>
//           {
//           pdfFile ?
//             <Document
//               file={pdfFile}
//               onLoadSuccess={onLoadSuccess}
//               onLoadError={console.error}
//             >
//               <PdfPage pageNumber={1} loading="loading..." error="error" />
//             </Document>

//             :
//             <Card
//               body={`Please select a sample from the query page.
//               Chose a genome assembly here.`}
//             />
//           }
//         </Grid.Col>
//       </Grid.Row>

//     );
// }

class FormElements extends Component {
  constructor(props) {
    super(props);

    const { id } = props.match.params;
    // The page can display tracks of multiple samples by having an additional query term
    const extraIds = (
      new URLSearchParams(props.location.search).get('id') || ''
    ).split(',');
    const idList = [];
    if (id) idList.push(id);
    for (const id of extraIds) {
      if (id) idList.push(id);
    }

    const assembly =
      new URLSearchParams(props.location.search).get('assembly') || 'hg38';
    this.initialFormState = {
      genomeAssembly: assembly,
      ids: idList,
      // pdfFile: `https://psc-cfdna.s3.us-east-2.amazonaws.com/${sraId}/${sraId}.hg38.insert_size_histogram.pdf`,
      // bamFile: `https://psc-cfdna.s3.us-east-2.amazonaws.com/${sraId}/${sraId}.hg38.mdups.bam`,
    };

    this.state = {
      data: null,
      form: this.initialFormState,
    };
  }

  // Generate a list of tracks to be displayed
  getGenomeTracks(samples, assembly) {
    // Samples may contain multiple samples
    const tracks = [];

    for (const sample of samples) {
      const analysis = sample['analysis'] || [];
      const filteredAnalysis = analysis.filter(
        (item) =>
          item['assembly'] == assembly &&
          ['BAM', 'bigWig'].includes(item['type'])
      );
      // Try locate the following tracks: BAM, coverage, fragment

      const s3Prefix =
        'https://s3.us-east-2.amazonaws.com/cfdnadb.epifluidlab.cchmc.org';
      const nameMap = {
        BAM: 'BAM file',
        coverage: 'Reads coverage',
        'fragment profile': 'Fragment size profile',
      };
      for (const desc of ['BAM', 'coverage', 'fragment profile']) {
        const filteredItem = filteredAnalysis.filter(
          (item) => item['desc'] == desc
        );
        if (filteredItem && filteredItem.length > 0) {
          // Rule for sample ID: SRA > original > ID
          let sampleId = `EE${sample['id']}`;
          const sraId = (sample['altId'] || {})['SRA'];
          const originalId = (sample['altId'] || {})['original'];
          if (sraId) sampleId = sraId;
          else if (originalId) sampleId = originalId;

          tracks.push({
            name: `${nameMap[desc]} ${sampleId}`,
            type: filteredItem[0]['type'], // bam, bigWig, etc.
            url: `${s3Prefix}/${filteredItem[0]['key']}`,
          });
        }
      }
    }

    return tracks;
  }

  async componentDidMount() {
    const { id } = this.props.match.params;
    // The page can display tracks of multiple samples by having an additional query term
    const extraIds = (
      new URLSearchParams(this.props.location.search).get('id') || ''
    ).split(',');
    const idList = [];
    if (id) idList.push(id);
    for (const id of extraIds) {
      if (id) idList.push(id);
    }

    // const { sraId } = this.props.match.params;
    // const samples = [];
    // const samples = await request(`/samples?sraId=${sraId}&`);
    const samples = await request(`/samples?ID=${idList.join(',')}`);

    // DIRTY HACK
    for (const sample of samples) {
      sample.disease = [];
    }

    const tracks = this.getGenomeTracks(
      samples,
      this.state.form.genomeAssembly
    );
    console.log(tracks);

    this.setState({
      form: {
        ...this.state.form,
        tracks: tracks,
      },
      samples,
    });
  }

  updateFormValue = (e) => {
    const tracks = this.getGenomeTracks(
      this.state.samples,
      this.state.form.genomeAssembly
    );

    this.setState({
      form: {
        ...this.state.form,
        [e.target.name]: e.target.value,
        tracks: tracks,
      },
    }); //, () => this.setPdfAddress());

    this.forceUpdate();
  };

  // setPdfAddress() {
  //   const { sraId, genomeAssembly } = this.state.form;
  //   const pdfFile = `https://psc-cfdna.s3.us-east-2.amazonaws.com/${sraId}/${sraId}.${genomeAssembly}.insert_size_histogram.pdf`;
  //   const bamFile = `https://psc-cfdna.s3.us-east-2.amazonaws.com/${sraId}/${sraId}.${genomeAssembly}.mdups.bam`;

  //   this.setState({
  //     form: {
  //       ...this.state.form,
  //       pdfFile,
  //       bamFile,
  //     },
  //   });

  // }

  onDocumentLoadSuccess(pdf) {
    console.log('success');
    console.log(pdf);
  }

  render() {
    const { samples, form } = this.state;

    // Generate props for Charts
    // fragmentSize: [
    //     {
    //         name: "EE85725",
    //         entryId: "85725",
    //         dataUrl: "https://s3.us-east-2.amazonaws.com/cfdnadb.epifluidlab.cchmc.org/entries/EE85725/hg38/EE85725.hg38.insert_size_metrics.txt"
    //     }
    // ],
    const fragmentSize = [];
    const assembly = form.genomeAssembly;
    for (const sample of samples || []) {
      // Rule for sample ID: SRA > original > ID
      let sampleId = `EE${sample['id']}`;
      const sraId = (sample['altId'] || {})['SRA'];
      const originalId = (sample['altId'] || {})['original'];
      if (sraId) sampleId = sraId;
      else if (originalId) sampleId = originalId;

      const dataUrls = (sample.analysis || [])
        .filter((v) => v.desc == 'fragment size' && v.assembly == assembly)
        .map(
          (v) =>
            `https://s3.us-east-2.amazonaws.com/cfdnadb.epifluidlab.cchmc.org/${v.key}`
        );
      for (const dataUrl of dataUrls) {
        fragmentSize.push({ name: sampleId, dataUrl });
      }
    }

    const idList = form['ids'];

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
          {/* 
          <Grid.Row>
            <Grid.Col>
              <Card>
                <RenderPDF
                  pdfFile={form.pdfFile}
                  onLoadSuccess={this.onDocumentLoadSuccess}
                />
              </Card>
            </Grid.Col>
          </Grid.Row> */}

          <Grid.Row>
            <Grid.Col>
              <Card>
                <Charts fragmentSize={fragmentSize} />
              </Card>
            </Grid.Col>
          </Grid.Row>

          <Grid.Row>
            <Grid.Col>
              <Card>
                {/* <Browser
                  sraId={idList[0]}
                  tracks={form.tracks}
                  genomeAssembly={form.genomeAssembly}
                  // bamFile={form.bamFile}
                /> */}
                <EpiBrowser />
              </Card>
            </Grid.Col>
          </Grid.Row>
        </Page.Content>
      </SiteWrapper>
    );
  }
}

export default FormElements;
