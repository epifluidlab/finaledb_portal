import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import multiDownload from 'multi-download';

import { Component } from 'react';
import { Page, Card, Grid, Table, Form, Button } from 'tabler-react';

import SiteWrapper from './SiteWrapper';

import 'nouislider';
import 'nouislider/distribute/nouislider.css';

import {
  clearDownloadList,
  initDownloadListStash,
  toggleDownloadItem,
  toggleDownloadFiles,
} from '../redux/actions/downloadListActions';

class DownloadList extends Component {
  componentDidMount() {
    const { summary, history, dispatchInitDownloadListStash } = this.props;
    if (!summary || Object.keys(summary).length === 0) history.push('/query');

    dispatchInitDownloadListStash();
  }

  getCanonicalEntryName = (entry) => {
    const {
      id: entryId,
      altId: { SRA: sraId } = {},
      sample: { name: sampleName } = {},
    } = entry;

    const canonicalEntryId = sraId || `EE${entryId}`;
    const canonicalSampleName = sampleName; // || geoId;
    return canonicalSampleName
      ? `${canonicalEntryId}/${canonicalSampleName}`
      : canonicalEntryId;
  };

  buildTableRow = (downloadItem) => {
    const { entry, checked } = downloadItem;

    const entryName = this.getCanonicalEntryName(entry);
    const subTableItems = this.buildDownloadFileRows(entry.id, downloadItem);

    const { dispatchToggleDownloadItem } = this.props;

    return (
      <Table.Row key={entry.id}>
        <Table.Col colSpan={0.1}>
          <Form.Checkbox
            isInline
            // name="example-radios"
            key={entry.id}
            label=" "
            value={entry.id}
            checked={checked}
            onChange={(e) => {
              const {
                target: { checked: componentChecked },
              } = e;
              dispatchToggleDownloadItem(entry.id, componentChecked);
            }}
          />
        </Table.Col>
        <Table.Col>{entryName}</Table.Col>
        <Table.Col>{subTableItems}</Table.Col>
      </Table.Row>
    );
  };

  buildDownloadFileRows = (entryId, downloadItem) => {
    const { downloads } = downloadItem;
    const { dispatchToggleDownloadFiles } = this.props;
    return downloads.map((fileItem) => (
      <Table.Row key={fileItem.key} className="mt-3">
        <Table.Col>
          <Form.Checkbox
            isInline
            label=" "
            checked={fileItem.checked}
            onChange={(e) => {
              const {
                target: { checked: componentChecked },
              } = e;
              dispatchToggleDownloadFiles(
                entryId,
                [fileItem.key],
                componentChecked
              );
            }}
          />
        </Table.Col>
        <Table.Col>{fileItem.desc}</Table.Col>
      </Table.Row>
    ));
  };

  handleClearDownloadList = () => {
    const {
      dispatchClearDownloadList,
      dispatchInitDownloadListStash,
    } = this.props;
    dispatchClearDownloadList();
    dispatchInitDownloadListStash();
  };

  render() {
    // const { downloads: { downloadList = [] } = {} } = this.props;
    const { stash = [] } = this.props;

    const tableRows = stash.map((item) => this.buildTableRow(item));

    return (
      <SiteWrapper>
        <Page.Content title="Download Center">
          <Grid.Row cards width={8}>
            <Grid.Col width={8} offset={2}>
              <Grid.Row>
                <Grid.Col width={3}>
                  <Button
                    block
                    color="primary"
                    className="mb-4"
                    onClick={async () => {
                      const fetchPromise = fetch('/api/v1/misc');
                      const miscPromise = fetchPromise.then((response) => response.json());
                      const misc = await miscPromise;
                      const s3Bucket = misc.s3;
                
                      const downloadFiles = stash
                                        .filter((item) => item.checked)
                                        .reduce((acc, downloadItem) => {
                                          const urls = downloadItem.downloads
                                            .filter((ele) => ele.checked)
                                            .map((ele) => {
                                              const path = ele.url.replace(/^\/data\//, "/");
                                              return `${s3Bucket}${path}`;
                                            });
                                          return [...acc, ...urls];
                                        }, []);
                                        multiDownload(downloadFiles);}}
                  >
                    Download Selected
                  </Button>
                </Grid.Col>
                <Grid.Col width={4} offset={5}>
                  <Button
                    block
                    color="crimson"
                    className="mb-4 download-clear"
                    onClick={this.handleClearDownloadList}
                  >
                    Clear Download List
                  </Button>
                </Grid.Col>
              </Grid.Row>
              <Card cards justifyContent="flex-end">
                <Table
                  responsive
                  highlightRowOnHover
                  hasOutline
                  verticalAlign="center"
                  cards
                  className="text-nowrap"
                >
                  <Table.Body>{tableRows}</Table.Body>
                </Table>
              </Card>
            </Grid.Col>
          </Grid.Row>
        </Page.Content>
      </SiteWrapper>
    );
  }
}

DownloadList.propTypes = {
  summary: PropTypes.shape().isRequired,
  history: PropTypes.func.isRequired,
  downloads: PropTypes.shape({
    downloadList: PropTypes.arrayOf(PropTypes.shape()),
    downloadListStash: PropTypes.arrayOf(PropTypes.shape()),
  }).isRequired,
  stash: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  // dispatches
  dispatchClearDownloadList: PropTypes.func.isRequired,
  dispatchInitDownloadListStash: PropTypes.func.isRequired,
  dispatchToggleDownloadItem: PropTypes.func.isRequired,
  dispatchToggleDownloadFiles: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  dispatchClearDownloadList: () => dispatch(clearDownloadList()),
  dispatchInitDownloadListStash: () => dispatch(initDownloadListStash()),
  dispatchToggleDownloadItem: (entryId, isChecked) =>
    dispatch(toggleDownloadItem(entryId, isChecked)),
  dispatchToggleDownloadFiles: (entryId, fileKeys, isChecked) =>
    dispatch(toggleDownloadFiles(entryId, fileKeys, isChecked)),
});

const mapStateToProps = (state) => ({
  summary: state.summary,
  downloads: state.downloads,
  stash: state.downloads.downloadListStash,
});

export default connect(mapStateToProps, mapDispatchToProps)(DownloadList);
