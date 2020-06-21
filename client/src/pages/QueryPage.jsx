import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Component } from 'react';
import { Page, Card, Grid, Table, Form, Button } from 'tabler-react';
import SiteWrapper from './SiteWrapper';
import SamplesTable from '../components/SamplesTable';

import 'nouislider';
import 'nouislider/distribute/nouislider.css';

import getDbSummary from '../redux/actions/dbSummaryActions';
import {
  setQueryTerms,
  querySeqrun,
  toggleSelectedSeqruns,
  setReadlenInput,
} from '../redux/actions/queryActions';
import {
  resetBrowserEntries,
  fetchFragmentSizeSeries,
} from '../redux/actions/epiBrowserActions';
import { addDownloadItems } from '../redux/actions/downloadListActions';

import { defaultSeqrunQueryTerms } from '../settings';

function GetPlatforms(props) {
  const { instrumentSummary, checkedInstruments, onChange } = props;
  const content = Object.keys(instrumentSummary || {}).map((instrument) => (
    <Form.Checkbox
      isInline
      // name="example-radios"
      key={instrument}
      label={instrument}
      value={instrument}
      checked={(checkedInstruments || []).includes(instrument)}
      onChange={(e) => {
        const {
          target: { value, checked },
        } = e;
        onChange('instrument', value, checked);
      }}
    />
  ));
  return (
    <Table.Row>
      <Table.Col>
        <Form.Group label="Platform">{content}</Form.Group>
      </Table.Col>
    </Table.Row>
  );
}

GetPlatforms.propTypes = {
  instrumentSummary: PropTypes.shape().isRequired,
  checkedInstruments: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

function GetDiseases(props) {
  const { diseaseSummary, checkedDisease, onChange } = props;

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

function GetPublications(props) {
  const { publicationList, checkedPublication, onChange } = props;

  const content = (publicationList || []).map(
    ({ id: publicationId, citeShort: publication }) => {
      return (
        // const content = Object.entries(publicationSummary || {}).map(
        // ([publicationId, { cite: publication }]) => (
        <Form.Checkbox
          isInline
          key={publicationId}
          label={publication}
          value={publicationId}
          checked={(checkedPublication || []).includes(publicationId)}
          onChange={(e) => {
            const {
              target: { value, checked },
            } = e;
            onChange('publication', parseInt(value, 10), checked);
          }}
        />
      );
    }
  );
  return (
    <Table.Row>
      <Table.Col>
        <Form.Group label="Publication">{content}</Form.Group>
      </Table.Col>
    </Table.Row>
  );
}
GetPublications.propTypes = {
  publicationList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      citeShort: PropTypes.string,
    })
  ).isRequired,
  checkedPublication: PropTypes.arrayOf(PropTypes.string).isRequired,
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
  componentDidMount() {
    // Try retrieving DB summary if it's absent
    const { summary } = this.props;
    if (Object.keys(summary || {}).length === 0) {
      const { dispatchGetDbSummary } = this.props;
      dispatchGetDbSummary();
    }

    // initialization
    const {
      query: {
        terms: queryTerms,
        results: { entries },
      },
      dispatchQuerySeqrun,
    } = this.props;

    if (!entries || entries.length === 0) {
      dispatchQuerySeqrun(queryTerms);
    }
  }

  getFilterForAttr = (attr) => {
    const { form } = this.state;

    if (!form[attr]) return '';

    return Object.keys(form[attr])
      .filter((key) => form[attr][key])
      .join(',');
  };

  // Select/deselect an entry for visualization
  selectEntry = (entryId, isSelected) => {
    const {
      query: {
        results: { entries },
      },
      dispatchToggleSelectedSeqruns,
    } = this.props;
    if (isSelected) {
      dispatchToggleSelectedSeqruns(
        entries.filter((entry) => entry.id === entryId)[0],
        isSelected
      );
      // For deselecting, we only need the entryId
    } else dispatchToggleSelectedSeqruns({ id: entryId }, isSelected);
  };

  updateCheckboxValues = (type, value, checked) => {
    const {
      query: { terms: queryTerms },
      dispatchSetQueryTerms,
      dispatchQuerySeqrun,
    } = this.props;

    if (
      ['assay', 'disease', 'tissue', 'instrument', 'publication'].includes(type)
    ) {
      let newChecklist;
      const oldChecklist = queryTerms[type];
      if (checked) {
        newChecklist = oldChecklist
          .concat([value])
          .filter((v, idx, self) => self.indexOf(v) === idx);
      } else {
        newChecklist = oldChecklist.filter((v) => v !== value);
      }
      const newQueryTerms = {
        ...queryTerms,
        ...{ [type]: newChecklist },
        offset: 0,
      };
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
  };

  resetForm = () => {
    const { dispatchSetQueryTerms, dispatchQuerySeqrun } = this.props;
    const defaultQueryTerms = defaultSeqrunQueryTerms;
    dispatchSetQueryTerms(defaultQueryTerms);
    dispatchQuerySeqrun(defaultQueryTerms);
  };

  gotoPage = (isPrev) => {
    // isPrev means go previous
    const {
      query: { terms: queryTerms, results: queryResults },
    } = this.props;
    const {
      total: resultsTotal,
      offset: resultsOffset,
      entries,
    } = queryResults;
    const { dispatchSetQueryTerms, dispatchQuerySeqrun } = this.props;

    const pageSize = 50;
    let newOffset;
    if (isPrev && resultsOffset > 0) {
      newOffset = resultsOffset > pageSize ? resultsOffset - pageSize : 0;
    } else if (!isPrev && resultsOffset + entries.length < resultsTotal) {
      newOffset =
        resultsOffset + pageSize < resultsTotal
          ? resultsOffset + pageSize
          : resultsTotal - 1;
    }
    if (newOffset !== undefined) {
      const newQueryTerms = { ...queryTerms, offset: newOffset };
      dispatchSetQueryTerms(newQueryTerms);
      dispatchQuerySeqrun(newQueryTerms);
    }
  };

  goVisualize = () => {
    const {
      query: { selected: selectedEntries },
      history,
    } = this.props;

    // Build the visualization page url
    // id=EE1234,EE5678
    const params = `id=${selectedEntries
      .map((entry) => `EE${entry.id}`)
      .join(',')}`;
    const url = `/visualization?${params}`;
    console.log(`Go to ${url}`);

    // const defaultAssembly = 'hg38';
    // dispatchResetBrowserEntries(defaultAssembly, selectedEntries);

    history.push(url);
  };

  goDownloads = () => {
    const { history } = this.props;
    history.push('/downloads');
  };

  getVisualizeUrl = () => {
    const {
      query: { selected: selectedEntries },
    } = this.props;

    // Build the visualization page url
    // id=EE1234,EE5678
    const params = `id=${selectedEntries
      .map((entry) => `EE${entry.id}`)
      .join(',')}`;
    return `/visualization?${params}`;
  };

  handleSearch = (value) => {
    const { dispatchQuerySeqrun, dispatchSetQueryTerms } = this.props;
    const {
      query: { terms: queryTerms },
    } = this.props;
    const newQueryTerms = { ...queryTerms, search: value };
    dispatchSetQueryTerms(newQueryTerms);
    dispatchQuerySeqrun(newQueryTerms);
  };

  // Handle range changes such as readlen and mbases
  handleRangeChange = (type, value, isMin) => {
    const { dispatchQuerySeqrun, dispatchSetQueryTerms } = this.props;
    const {
      query: { terms: queryTerms },
    } = this.props;

    const numVal = parseInt(value, 10);

    let queryTermsPatch = {};
    if (type === 'readlen') {
      queryTermsPatch = isMin ? { minReadlen: numVal } : { maxReadlen: numVal };
    } else if (type === 'fragNum') {
      const fragNum = parseInt(numVal * 1e6, 10);
      queryTermsPatch = isMin
        ? { minFragNum: fragNum }
        : { maxFragNum: fragNum };
    }
    const newQueryTerms = { ...queryTerms, ...queryTermsPatch };

    dispatchSetQueryTerms(newQueryTerms);
    dispatchQuerySeqrun(newQueryTerms);
  };

  toggleRangeChange = (type, isChecked) => {
    const { dispatchQuerySeqrun, dispatchSetQueryTerms } = this.props;
    const {
      query: { terms: queryTerms },
    } = this.props;

    let queryTermsPatch = {};
    if (type === 'readlen') {
      queryTermsPatch = { enableReadlen: isChecked };
    } else if (type === 'fragNum') {
      queryTermsPatch = { enableFragNum: isChecked };
    }
    const newQueryTerms = { ...queryTerms, ...queryTermsPatch };

    dispatchSetQueryTerms(newQueryTerms);
    dispatchQuerySeqrun(newQueryTerms);
  };

  handleAddDownloadItem = (entries, isAdding) => {
    const { dispatchAddDownloadItems } = this.props;
    dispatchAddDownloadItems(entries, isAdding);
  };

  // handleReadlenChange = (value, isMin) => {
  //   const { dispatchQuerySeqrun, dispatchSetQueryTerms } = this.props;
  //   console.log(`readlen changed: ${value}`);
  //   // dispatchSetReadlenInput(value, isMin);
  //   const {
  //     query: { terms: queryTerms },
  //   } = this.props;

  //   const numVal = parseInt(value, 10);

  //   const newQueryTerms = isMin
  //     ? { ...queryTerms, minReadlen: numVal }
  //     : { ...queryTerms, maxReadlen: numVal };
  //   dispatchSetQueryTerms(newQueryTerms);
  //   dispatchQuerySeqrun(newQueryTerms);
  // };

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

    const { summary, downloads } = this.props;

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
      query: {
        terms: queryTerms,
        results: queryResults,
        selected: selectedEntries,
      },
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
                    <Table.Row>
                      <Table.Col>
                        <Form.Group label="Search">
                          <Form.Input
                            name="search"
                            placeholder="Try sample name, run ID, SRA ID, etc."
                            type="text"
                            value={queryTerms.search}
                            onChange={(e) => this.handleSearch(e.target.value)}
                          />
                        </Form.Group>
                      </Table.Col>
                    </Table.Row>
                    <GetPlatforms
                      instrumentSummary={summary.instrument}
                      checkedInstruments={queryTerms.instrument}
                      onChange={this.updateCheckboxValues}
                    />
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
                          <Grid.Col width={1} size="sm" className="mt-6">
                            <Form.Checkbox
                              isInline
                              label=" "
                              value=" "
                              checked={queryTerms.enableFragNum}
                              onChange={(e) => {
                                const {
                                  target: { checked },
                                } = e;
                                this.toggleRangeChange('fragNum', checked);
                              }}
                            />
                          </Grid.Col>
                          <Grid.Col>
                            <Form.Group label="Min # of fragments (M)">
                              <Form.Input
                                disabled={!queryTerms.enableFragNum}
                                name="minFragNum"
                                placeholder={10}
                                type="number"
                                value={
                                  Math.round(queryTerms.minFragNum / 1e5) / 10
                                }
                                onChange={(e) =>
                                  this.handleRangeChange(
                                    'fragNum',
                                    e.target.value,
                                    true
                                  )
                                }
                              />
                            </Form.Group>
                          </Grid.Col>
                          <Grid.Col>
                            <Form.Group label="Max # of fragments (M)">
                              <Form.Input
                                disabled={!queryTerms.enableFragNum}
                                name="maxFragNum"
                                placeholder={100}
                                type="number"
                                value={
                                  Math.round(queryTerms.maxFragNum / 1e5) / 10
                                }
                                onChange={(e) =>
                                  this.handleRangeChange(
                                    'fragNum',
                                    e.target.value,
                                    false
                                  )
                                }
                              />
                            </Form.Group>
                          </Grid.Col>
                        </Grid.Row>
                      </Table.Col>
                    </Table.Row>
                    <Table.Row>
                      <Table.Col>
                        <Grid.Row>
                          <Grid.Col width={1} size="sm" className="mt-6">
                            <Form.Checkbox
                              isInline
                              label=" "
                              value=" "
                              checked={queryTerms.enableReadlen}
                              onChange={(e) => {
                                const {
                                  target: { checked },
                                } = e;
                                this.toggleRangeChange('readlen', checked);
                              }}
                            />
                          </Grid.Col>
                          <Grid.Col>
                            <Form.Group label="Min Read Length">
                              <Form.Input
                                disabled={!queryTerms.enableReadlen}
                                name="minReadLength"
                                placeholder={10}
                                type="number"
                                value={queryTerms.minReadlen}
                                onChange={(e) =>
                                  this.handleRangeChange(
                                    'readlen',
                                    e.target.value,
                                    true
                                  )
                                }
                              />
                            </Form.Group>
                          </Grid.Col>
                          <Grid.Col>
                            <Form.Group label="Max Read Length">
                              <Form.Input
                                disabled={!queryTerms.enableReadlen}
                                name="maxReadLength"
                                placeholder={100}
                                type="number"
                                value={queryTerms.maxReadlen}
                                onChange={(e) =>
                                  this.handleRangeChange(
                                    'readlen',
                                    e.target.value,
                                    false
                                  )
                                }
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
                    <GetPublications
                      publicationList={summary.publication}
                      checkedPublication={queryTerms.publication}
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

            <Grid.Col>
              <Grid.Row>
                <Grid.Col width={4}>
                  <Button
                    icon="eye"
                    color={(() => {
                      const selNum = (selectedEntries || []).length;
                      if (selNum === 0) return 'secondary';
                      if (selNum <= 3) return 'primary';
                      return 'danger';
                    })()}
                    disabled={selectedEntries.length === 0}
                    size="lg"
                    className="mb-4"
                    block
                    onClick={this.goVisualize}
                  >
                    Visualize
                  </Button>
                </Grid.Col>
                <Grid.Col width={5} />
                <Grid.Col width={3}>
                  <Button
                    icon="download"
                    disabled={downloads.downloadList.length === 0}
                    size="lg"
                    className="mb-4"
                    block
                    color="primary"
                    onClick={this.goDownloads}
                  >
                    Download
                  </Button>
                </Grid.Col>
              </Grid.Row>
              {selectedEntries.length <= 3 ? null : (
                <Grid.Row className="mx-1 mb-2">
                  <Form.StaticText className="text-danger">
                    {`You have selected ${selectedEntries.length} items, which may impact the Epigenome Browser's performance. Thus only the first 3 items will be visualized.`}
                  </Form.StaticText>
                </Grid.Row>
              )}
              {/* </div> */}
              <Card cards justifyContent="flex-end">
                <SamplesTable
                  entries={queryResults.entries}
                  downloads={downloads}
                  selectedEntries={selectedEntries}
                  paging={{
                    offset: queryResults.offset,
                    total: queryResults.total,
                    rowCount: queryResults.entries.length,
                  }}
                  visualizeUrl={this.getVisualizeUrl()}
                  isQuery
                  handleSelectEntry={this.selectEntry}
                  handlePaging={this.gotoPage}
                  handleAddDownloadItem={this.handleAddDownloadItem}
                />
              </Card>
            </Grid.Col>
          </Grid.Row>
        </Page.Content>
      </SiteWrapper>
    );
  }
}

FormElements.propTypes = {
  dispatchGetDbSummary: PropTypes.func.isRequired,
  dispatchSetQueryTerms: PropTypes.func.isRequired,
  dispatchQuerySeqrun: PropTypes.func.isRequired,
  dispatchToggleSelectedSeqruns: PropTypes.func.isRequired,
  query: PropTypes.shape({
    terms: PropTypes.shape(),
    results: PropTypes.shape({
      offset: PropTypes.number,
      total: PropTypes.number,
      entries: PropTypes.arrayOf(PropTypes.shape()),
    }),
    selected: PropTypes.arrayOf(PropTypes.shape()),
  }).isRequired,
  summary: PropTypes.shape({
    // summary: { seqRunCnt, sampleCnt, disease, publication, tissue, assay },
    seqRunCnt: PropTypes.number,
    sampleCnt: PropTypes.number,
    instrument: PropTypes.shape(),
    disease: PropTypes.shape(),
    publication: PropTypes.arrayOf(PropTypes.shape()),
    tissue: PropTypes.shape(),
    assay: PropTypes.shape(),
  }).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  history: PropTypes.object.isRequired,
};

// export default FormElements;

const mapDispatchToProps = (dispatch) => ({
  // TODO remove this later
  dispatchFetchFragmentSizeSeries: (fragSizeSeries) =>
    dispatch(fetchFragmentSizeSeries(fragSizeSeries)),
  dispatchResetBrowserEntries: (assembly, entries) =>
    dispatch(resetBrowserEntries(assembly, entries)),
  dispatchGetDbSummary: () => dispatch(getDbSummary()),
  dispatchSetQueryTerms: (queryTerms) => dispatch(setQueryTerms(queryTerms)),
  dispatchQuerySeqrun: (queryTerms) => dispatch(querySeqrun(queryTerms)),
  dispatchToggleSelectedSeqruns: (entry, isSelected) =>
    dispatch(toggleSelectedSeqruns(entry, isSelected)),
  dispatchSetReadlenInput: (value, isMin) =>
    dispatch(setReadlenInput(value, isMin)),
  dispatchAddDownloadItems: (entries, isAdding) =>
    dispatch(addDownloadItems(entries, isAdding)),
});

const mapStateToProps = (state) => ({
  summary: state.summary,
  query: {
    terms: state.query.seqrunQueryTerms,
    results: state.query.seqrunQueryResults,
    selected: state.query.selectedSeqruns,
  },
  downloads: state.downloads,
});

export default connect(mapStateToProps, mapDispatchToProps)(FormElements);
