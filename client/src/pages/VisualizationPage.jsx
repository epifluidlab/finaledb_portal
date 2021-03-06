// @flow

import * as React from 'react';
import { Component } from 'react';
import { Page, Card, Grid, Table, Form } from 'tabler-react';

import { connect } from 'react-redux';
import log from 'loglevel';
import PropTypes from 'prop-types';

import {
  resetBrowserEntries,
  fetchFragmentSizeSeries,
  // setFragmentSizeSeries,
  setDisplayRegion,
} from '../redux/actions/epiBrowserActions';
import { addDownloadItems } from '../redux/actions/downloadListActions';

import SiteWrapper from './SiteWrapper';
import SamplesTable from '../components/SamplesTable';
// import Browser from '../components/Browser';
import EpiBrowser from '../containers/EpiBrowser';
import EpiBrowserSessionUploader from '../containers/EpiBrowserSessionUploader';
import Charts from '../components/FragmentSizesChart';

class FormElements extends Component {
  componentDidMount() {
    const {
      query: { selected: selectedEntries },
      history,
    } = this.props;
    if (!selectedEntries || selectedEntries.length === 0) history.push('/');

    const { dispatchResetBrowserEntries } = this.props;

    const selNum = (selectedEntries || []).length;
    if (selNum > 3) {
      console.log(`Too many selected entries: ${selNum}`);
    }

    const defaultAssembly = 'hg38';
    // Update the fragment series right after reset the browser
    const { dispatchFetchFragmentSizeSeries } = this.props;
    const callback = (browserState) => {
      const { fragSizeSeries = [] } = browserState;
      dispatchFetchFragmentSizeSeries(fragSizeSeries);
    };
    dispatchResetBrowserEntries(
      defaultAssembly,
      selectedEntries.slice(0, 3),
      callback
    );
  }

  updateFormValue = (event) => {
    const assembly = event.target.value;
    log.info(`Change to assembly: ${assembly}`);

    // const { dispatchChangeAssembly } = this.props;
    // dispatchChangeAssembly(assembly);
    const { dispatchResetBrowserEntries, entries } = this.props;
    // Update the fragment series right after reset the browser
    const { dispatchFetchFragmentSizeSeries } = this.props;
    const callback = (browserState) => {
      const { fragSizeSeries = [] } = browserState;
      dispatchFetchFragmentSizeSeries(fragSizeSeries);
    };
    dispatchResetBrowserEntries(assembly, entries, callback);
  };

  shouldComponentUpdate = (nextProps) => {
    const {
      assembly,
      entries,
      fragSizeSeries,
      downloads: { downloadList },
    } = this.props;
    const {
      assembly: nextAssembly,
      entries: nextEntries,
      fragSizeSeries: nextFragSizeSeries,
      downloads: { downloadList: nextDownloadList },
    } = nextProps;

    const shouldUpdate =
      assembly !== nextAssembly ||
      downloadList !== nextDownloadList ||
      JSON.stringify(entries.map((entry) => entry.id).sort()) !==
        JSON.stringify(nextEntries.map((entry) => entry.id).sort()) ||
      JSON.stringify(
        fragSizeSeries
          .filter((item) => item.dataPts)
          .map((item) => item.key)
          .sort()
      ) !==
        JSON.stringify(
          nextFragSizeSeries
            .filter((item) => item.dataPts)
            .map((item) => item.key)
            .sort()
        );
    return shouldUpdate;
  };

  handleAddDownloadItem = (entries, isAdding) => {
    const { dispatchAddDownloadItems } = this.props;
    dispatchAddDownloadItems(entries, isAdding);
  };

  render() {
    console.log('VisualizationPage render');

    const { fragSizeSeries = [], downloads } = this.props;

    const samples = [];
    const {
      entries,
      displayedEntryIds,
      assembly,
      // dispatchSetFragSize,
    } = this.props;
    const displayedEntries = (entries || []).filter(({ id: entryId }) =>
      displayedEntryIds.includes(entryId)
    );

    if (!samples) return null;

    return (
      <SiteWrapper>
        <Page.Content>
          <Grid.Row cards>
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
                              checked={assembly === 'hg19'}
                              // checked={form.genomeAssembly['hg19']}
                              onChange={this.updateFormValue}
                            />
                            <Form.SelectGroupItem
                              name="genomeAssembly"
                              label="hg38 (GRCh38)"
                              value="hg38"
                              checked={assembly === 'hg38'}
                              // checked={form.genomeAssembly['hg38']}
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
                  <SamplesTable
                    entries={displayedEntries}
                    downloads={downloads}
                    handleAddDownloadItem={this.handleAddDownloadItem}
                  />
                </Table>
              </Card>
            </Grid.Col>
          </Grid.Row>

          <Grid.Row>
            <Grid.Col>
              <Card>
                <Charts series={fragSizeSeries} />
              </Card>
            </Grid.Col>
          </Grid.Row>

          <Grid.Row>
            <Grid.Col width={5}>
              <EpiBrowserSessionUploader />
            </Grid.Col>
          </Grid.Row>

          <Grid.Row>
            <Grid.Col>
              <Card>
                <EpiBrowser />
              </Card>
            </Grid.Col>
          </Grid.Row>
        </Page.Content>
      </SiteWrapper>
    );
  }
}

FormElements.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  history: PropTypes.object.isRequired,
  fragSizeSeries: PropTypes.arrayOf(
    PropTypes.shape({
      dataPts: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
      dataUrl: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  assembly: PropTypes.string.isRequired,
  entries: PropTypes.arrayOf(PropTypes.shape()),

  query: PropTypes.shape({
    selected: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number })),
  }).isRequired,

  displayedEntryIds: PropTypes.arrayOf(PropTypes.string),
  dispatchResetBrowserEntries: PropTypes.func.isRequired,
  dispatchFetchFragmentSizeSeries: PropTypes.func.isRequired,
  // dispatchSetDisplayRegion: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }).isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
};

FormElements.defaultProps = {
  fragSizeSeries: [],
  displayedEntryIds: [],
  entries: [],
};

const mapDispatchToProps = (dispatch) => ({
  dispatchSetDisplayRegion: (region) => dispatch(setDisplayRegion(region)),
  dispatchResetBrowserEntries: (assembly, entries, callback) =>
    dispatch(resetBrowserEntries(assembly, entries, callback)),
  dispatchFetchFragmentSizeSeries: (fragSizeSeries) =>
    dispatch(fetchFragmentSizeSeries(fragSizeSeries)),
  dispatchAddDownloadItems: (entries, isAdding) =>
    dispatch(addDownloadItems(entries, isAdding)),
});

const mapStateToProps = (state) => {
  // const { entries } = state.browser;
  return {
    ...state.browser,
    query: {
      selected: state.query.selectedSeqruns,
    },
    downloads: state.downloads,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FormElements);
