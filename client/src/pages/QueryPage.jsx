import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Component } from 'react';
import { Page, Card, Grid, Table, Form, Button, Text } from 'tabler-react';
import SiteWrapper from './SiteWrapper';
import SamplesTable from '../components/SamplesTable';

import 'nouislider';
import 'nouislider/distribute/nouislider.css';
import request from '../utils/request';

import getDbSummary from '../redux/actions/dbSummaryActions';
import { setQueryTerms, querySeqrun } from '../redux/actions/queryActions';

// function GetPlatforms(props) {
//   const content = props.platforms.map((
//     { platform } // [{ platform: 'something', count: 12 }]
//   ) => (
//     <Form.Checkbox
//       isInline
//       name="example-radios"
//       label={platform}
//       value={platform}
//       checked={props.checked[platform] || false}
//       onChange={props.onChange('platform', platform)}
//     />
//   ));
//   return (
//     <Table.Row>
//       <Table.Col>
//         <Form.Group label="Platform">{content}</Form.Group>
//       </Table.Col>
//     </Table.Row>
//   );
// }

// function GetLibraryFormats(props) {
//   const content = props.libraryFormats.map((layout) => (
//     <Form.Checkbox
//       isInline
//       name="example-radios"
//       label={layout}
//       value={layout}
//       checked={props.checked[layout] || false}
//       onChange={props.onChange('libraryFormat', layout)}
//     />
//   ));
//   return (
//     <Table.Row>
//       <Table.Col>
//         <Form.Group label="Library Format">{content}</Form.Group>
//       </Table.Col>
//     </Table.Row>
//   );
// }

function GetDiseases(props) {
  const { diseaseSummary } = props;
  const { checkedDisease } = props;
  const { onChange } = props;

  const content = Object.keys(diseaseSummary || {}).map((disease) => (
    <Form.Checkbox
      isInline
      key={disease}
      label={disease}
      value={disease}
      checked={(checkedDisease || []).includes(disease)}
      onChange={(e) => {
        const {
          target: { value, checked },
        } = e;
        onChange('disease', value, checked);
      }}
    />
  ));
  return (
    <Table.Row>
      <Table.Col>
        <Form.Group label="Disease Status">{content}</Form.Group>
      </Table.Col>
    </Table.Row>
  );
}
GetDiseases.propTypes = {
  diseaseSummary: PropTypes.shape().isRequired,
  checkedDisease: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

function GetTissues(props) {
  const { tissueSummary } = props;
  const { checkedTissues } = props;
  const { onChange } = props;

  const content = Object.keys(tissueSummary || {}).map((tissue) => (
    <Form.Checkbox
      isInline
      key={tissue}
      label={tissue}
      value={tissue}
      checked={(checkedTissues || []).includes(tissue)}
      onChange={(e) => {
        const {
          target: { value, checked },
        } = e;
        onChange('tissue', value, checked);
      }}
    />
  ));
  return (
    <Table.Row>
      <Table.Col>
        <Form.Group label="Tissue">{content}</Form.Group>
      </Table.Col>
    </Table.Row>
  );
}
GetTissues.propTypes = {
  tissueSummary: PropTypes.shape().isRequired,
  checkedTissues: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

function GetAssayTypes(props) {
  const { assaySummary } = props;
  const { checkedAssays } = props;
  const { onChange } = props;

  const content = Object.keys(assaySummary || {}).map((assay) => (
    <Form.Checkbox
      isInline
      key={assay}
      label={assay}
      value={assay}
      checked={(checkedAssays || []).includes(assay)}
      onChange={(e) => {
        const {
          target: { value, checked },
        } = e;
        onChange('assay', value, checked);
      }}
    />
  ));
  return (
    <Table.Row>
      <Table.Col>
        <Form.Group label="Assay Type">{content}</Form.Group>
      </Table.Col>
    </Table.Row>
  );
}
GetAssayTypes.propTypes = {
  assaySummary: PropTypes.shape().isRequired,
  checkedAssays: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

class FormElements extends Component {
  constructor(props) {
    super(props);
    this.initialFormState = {
      disease: {},
      genomeAssembly: {},
      platform: {},
      libraryFormat: {},
      tissue: {},
      assayType: {},
      diseaseStatus: {},
      minReadLength: 10,
      maxReadLength: 100,
      minMBases: 10,
      maxMBases: 100000,
      age: {},
      doi: '',
    };

    this.state = {
      data: null,
      form: this.initialFormState,
    };
  }

  componentDidMount() {
    // Try retrieving DB summary if it's absent
    const { summary } = this.props;
    if (Object.keys(summary || {}).length === 0)
      this.props.dispatchGetDbSummary();
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
      tissues: data.tissues,
      assayTypes: data.assayTypes,
      libraryFormats: data.libraryFormats,
      readLengths: data.readLengths,
      dois: data.dois,
      mbases: data.mbases,
      publications,
      samples,
    });
  };

  fetchSamples = async () => {
    const samples = await request('/samples' + this.formToQueryString());
    this.setState({
      samples,
    });
  };

  formToQueryString = () => {
    const {
      minReadLength,
      maxReadLength,
      doi,
      minMBases,
      maxMBases,
    } = this.state.form;
    let qs = '?';
    const attrs = [
      'platform',
      'disease',
      'tissue',
      'libraryFormat',
      'assayType',
    ];

    for (const attr of attrs) {
      const filterString = this.getFilterForAttr(attr);
      if (filterString.length) {
        qs += `${attr}=${filterString}&`;
      }
    }

    qs += 'doi=' + doi + '&';
    qs += 'mbases=' + minMBases + ',' + maxMBases + '&';
    qs += 'readLength=' + minReadLength + ',' + maxReadLength + '&';

    console.log(qs);
    return qs;
  };

  getFilterForAttr = (attr) => {
    const { form } = this.state;

    if (!form[attr]) return '';

    return Object.keys(form[attr])
      .filter((key) => form[attr][key])
      .join(',');
  };

  updateFormMultipleValues = (name, value) => () => {
    console.log(this.state.form);
    this.setState(
      {
        form: {
          ...this.state.form,
          [name]: {
            ...this.state.form[name],
            [value]: !this.state.form[name][value],
          },
        },
      },
      () => this.fetchSamples()
    );
  };

  updateCheckboxValues = (type, value, checked) => {
    const {
      query: { terms: queryTerms },
      dispatchSetQueryTerms,
      dispatchQuerySeqrun,
    } = this.props;

    if (['assay', 'disease', 'tissue'].includes(type)) {
      let newChecklist;
      const oldChecklist = queryTerms[type];
      if (checked) {
        newChecklist = oldChecklist
          .concat([value])
          .filter((v, idx, self) => self.indexOf(v) === idx);
      } else {
        newChecklist = oldChecklist.filter((v) => v !== value);
      }
      const newQueryTerms = { ...queryTerms, ...{ [type]: newChecklist } };
      dispatchSetQueryTerms(newQueryTerms);
      dispatchQuerySeqrun(newQueryTerms);
    }
  };

  updateFormValue = (e) => {
    const {
      query: { terms: queryTerms },
    } = this.props;
    const newTerms = {
      ...queryTerms,
      [e.target.name]: e.target.value,
    };
    console.log('query terms (prev/new)');
    console.log(queryTerms);
    console.log(newTerms);

    const { dispatchSetQueryTerms } = this.props;
    dispatchSetQueryTerms(newTerms);

    // const newQueryTerms = this.props.query.this.setState(
    //   {
    //     form: {
    //       ...this.state.form,
    //       [e.target.name]: e.target.value,
    //     },
    //   },
    //   () => this.fetchSamples()
    // );
  };

  resetForm = () => {
    this.setState({
      form: this.initialFormState,
    });
  };

  render() {
    // const {
    //   diseases,
    //   platforms,
    //   tissues,
    //   assayTypes,
    //   libraryFormats,
    //   readLengths,
    //   publications,
    //   samples,
    //   dois,
    //   mbases,
    //   form,
    // } = this.state;

    console.log('render query page');

    const { summary } = this.props;

    const {
      summary: { seqRunCnt, sampleCnt, disease, publication, tissue, assay },
    } = this.props;

    if (
      !seqRunCnt ||
      !sampleCnt ||
      !disease ||
      !publication ||
      !tissue ||
      !assay
    )
      return null;

    const {
      query: { terms: queryTerms },
    } = this.props;

    return (
      <SiteWrapper>
        <Page.Content title="Search Samples">
          <Grid.Row cards justifyContent="flex-end">
            <Grid.Col>
              <Button.List>
                <Button link icon="x" onClick={this.resetForm}>
                  Clear all fields
                </Button>
              </Button.List>
            </Grid.Col>
          </Grid.Row>

          <Grid.Row cards>
            <Grid.Col>
              <Card>
                <Table className="card-table table-vcenter">
                  <Table.Body>
                    {/* <Table.Row>
                      <Table.Col>
                        <Form.Group label="Human Reference Genome">
                          <Form.SelectGroup>
                            <Form.SelectGroupItem
                              name="device"
                              label="hg19 (GRCh37)"
                              value="hg19"
                              checked={form.genomeAssembly['hg19']}
                              onChange={this.updateFormMultipleValues(
                                'genomeAssembly',
                                'hg19'
                              )}
                            />
                            <Form.SelectGroupItem
                              name="device"
                              label="hg38 (GRCh38)"
                              value="hg39"
                              checked={form.genomeAssembly['hg38']}
                              onChange={this.updateFormMultipleValues(
                                'genomeAssembly',
                                'hg38'
                              )}
                            />
                          </Form.SelectGroup>
                        </Form.Group>
                      </Table.Col>
                    </Table.Row>
                    <GetPlatforms
                      platforms={platforms}
                      checked={form.platform}
                      onChange={this.updateFormMultipleValues}
                    />
                    <GetLibraryFormats
                      libraryFormats={['SINGLE', 'PAIRED']}
                      checked={form.libraryFormat}
                      onChange={this.updateFormMultipleValues}
                    /> */}
                    <GetAssayTypes
                      assaySummary={summary.assay}
                      checkedAssays={queryTerms.assay}
                      // assayTypes={Object.keys(summary.assay)}
                      // checked={queryTerms.assay}
                      onChange={this.updateCheckboxValues}
                    />
                    <Table.Row>
                      <Table.Col>
                        <Grid.Row>
                          <Grid.Col>
                            <Form.Group label="Min Read Length">
                              <Form.Input
                                name="minReadLength"
                                placeholder={10}
                                type="number"
                                value={queryTerms.minReadlen}
                                onChange={this.updateFormValue}
                              />
                            </Form.Group>
                          </Grid.Col>
                          <Grid.Col>
                            <Form.Group label="Max Read Length">
                              <Form.Input
                                name="maxReadLength"
                                placeholder={100}
                                type="number"
                                value={queryTerms.maxReadlen}
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
                            <Form.Group label="Min MBases">
                              <Form.Input
                                name="minMBases"
                                placeholder={10}
                                type="number"
                                value={queryTerms.minMbases}
                                onChange={this.updateFormValue}
                              />
                            </Form.Group>
                          </Grid.Col>
                          <Grid.Col>
                            <Form.Group label="Max MBases">
                              <Form.Input
                                name="maxMBases"
                                placeholder={100}
                                type="number"
                                value={queryTerms.maxMbases}
                                onChange={this.updateFormValue}
                              />
                            </Form.Group>
                          </Grid.Col>
                        </Grid.Row>
                      </Table.Col>
                    </Table.Row>
                    <GetDiseases
                      diseaseSummary={summary.disease}
                      checkedDisease={queryTerms.disease}
                      onChange={this.updateCheckboxValues}
                    />
                    <GetTissues
                      tissueSummary={summary.tissue}
                      checkedTissues={queryTerms.tissue}
                      onChange={this.updateCheckboxValues}
                    />

                    {/* <Table.Row>
                      <Table.Col>
                        <Grid.Row>
                          <Grid.Col>
                            <Form.Group label="DOI">
                              <Form.Input
                                name="doi"
                                placeholder="10.1016/j.cell.2015.11.050"
                                value={form.doi}
                                onChange={this.updateFormValue}
                              />
                            </Form.Group>
                          </Grid.Col>
                        </Grid.Row>
                      </Table.Col>
                    </Table.Row> */}
                  </Table.Body>
                </Table>
              </Card>
            </Grid.Col>

            {/* <Grid.Col>
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
            </Grid.Col> */}
          </Grid.Row>
        </Page.Content>
      </SiteWrapper>
    );
  }
}

// export default FormElements;

const mapDispatchToProps = (dispatch) => ({
  // TODO remove this later
  dispatchGetDbSummary: () => dispatch(getDbSummary()),
  dispatchSetQueryTerms: (queryTerms) => dispatch(setQueryTerms(queryTerms)),
  dispatchQuerySeqrun: (queryTerms) => dispatch(querySeqrun(queryTerms)),
});

const mapStateToProps = (state) => ({
  summary: state.summary,
  query: {
    terms: state.query.seqrunQueryTerms,
    results: state.query.seqrunQueryResults,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(FormElements);
