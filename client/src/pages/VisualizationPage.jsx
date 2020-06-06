// @flow

import * as React from 'react';
import { Component } from 'react';
// import { Document, Page as PdfPage, pdfjs } from "react-pdf";

import { connect } from 'react-redux';
import log from 'loglevel';

import {
  changeGenomeAssembly,
  resetBrowserEntries,
} from '../redux/actions/epiBrowserActions';

import { Page, Card, Grid, Table, Form, Button, Text } from 'tabler-react';

import SiteWrapper from './SiteWrapper';
import SamplesTable from '../components/SamplesTable';
// import Browser from '../components/Browser';
import EpiBrowser from '../containers/EpiBrowser';
import Charts from '../components/Charts';

class FormElements extends Component {
  async componentDidMount() {
    const { id } = this.props.match.params;
    // The page can display tracks of multiple samples by having an additional query term
    const extraIds = (
      new URLSearchParams(this.props.location.search).get('id') || ''
    ).split(',');
    const idList = [];
    if (id) idList.push(id);
    extraIds.forEach((id) => {
      if (id) idList.push(id);
    });

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

const mapDispatchToProps = (dispatch) => ({
  dispatchChangeAssembly: (assembly) =>
    dispatch(changeGenomeAssembly(assembly)),
  dispatchResetBrowserEntries: (assembly, entries) =>
    dispatch(resetBrowserEntries(assembly, entries)),
});

const mapStateToProps = (state) => ({ ...state.browser });

export default connect(mapStateToProps, mapDispatchToProps)(FormElements);

// export default FormElements;
