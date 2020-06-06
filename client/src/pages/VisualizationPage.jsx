// @flow

import * as React from 'react';
import { Component } from 'react';
// import { Document, Page as PdfPage, pdfjs } from "react-pdf";

import { connect } from 'react-redux';
import log from 'loglevel';
import PropTypes from 'prop-types';

import {
  changeGenomeAssembly,
  resetBrowserEntries,
  setDisplayRegion,
} from '../redux/actions/epiBrowserActions';

import { Page, Card, Grid, Table, Form, Button, Text } from 'tabler-react';

import SiteWrapper from './SiteWrapper';
import SamplesTable from '../components/SamplesTable';
// import Browser from '../components/Browser';
import EpiBrowser from '../containers/EpiBrowser';
import Charts from '../components/Charts';

class FormElements extends Component {
  async componentDidMount() {
    // eslint-disable-next-line react/destructuring-assignment
    const { id } = this.props.match.params;
    // The page can display tracks of multiple samples by having an additional query term
    const searchParams =
      // eslint-disable-next-line react/destructuring-assignment
      new URLSearchParams(this.props.location.search);
    const extraIds = (searchParams.get('id') || '').split(',');
    const idList = [];
    if (id) idList.push(id);
    else {
      extraIds.forEach((val) => {
        if (val) idList.push(val);
      });
    }
    const displayRegion = searchParams.get('region');
    if (displayRegion) {
      const { dispatchSetDisplayRegion } = this.props;
      dispatchSetDisplayRegion(displayRegion);
    }

    const { dispatchResetBrowserEntries, assembly } = this.props;
    dispatchResetBrowserEntries(assembly, idList);

    // this.setState({ form: { ...this.state.form, samples, } });
  }

  updateFormValue(e) {
    this.forceUpdate();
  }

  render() {
    log.info('Render the form');
    const samples = [];

    // eslint-disable-next-line react/destructuring-assignment
    const fragSizeSeries = Object.values(this.props.fragSizeSeries || {});

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
                              // checked={form.genomeAssembly['hg19']}
                              onChange={this.updateFormValue}
                            />
                            <Form.SelectGroupItem
                              name="genomeAssembly"
                              label="hg38 (GRCh38)"
                              value="hg38"
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
                  <SamplesTable samples={samples} />
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
  fragSizeSeries: PropTypes.arrayOf(
    PropTypes.shape({
      dataPts: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
      dataUrl: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  assembly: PropTypes.string.isRequired,
  dispatchResetBrowserEntries: PropTypes.func.isRequired,
  dispatchSetDisplayRegion: PropTypes.func.isRequired,
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
};

const mapDispatchToProps = (dispatch) => ({
  dispatchSetDisplayRegion: (region) => dispatch(setDisplayRegion(region)),
  dispatchChangeAssembly: (assembly) =>
    dispatch(changeGenomeAssembly(assembly)),
  dispatchResetBrowserEntries: (assembly, entries) =>
    dispatch(resetBrowserEntries(assembly, entries)),
});

const mapStateToProps = (state) => ({ ...state.browser });

export default connect(mapStateToProps, mapDispatchToProps)(FormElements);
