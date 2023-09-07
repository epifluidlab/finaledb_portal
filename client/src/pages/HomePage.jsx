/* eslint-disable jsx-a11y/anchor-is-valid */
// @flow

import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';

import { Page, Avatar, Icon, Grid, Card, Table, StampCard } from 'tabler-react';

import C3Chart from 'react-c3js';

import SiteWrapper from './SiteWrapper';
import request from '../utils/request';
import SamplesTable from '../components/SamplesTable';

import getDbSummary from '../redux/actions/dbSummaryActions';

function PublicationTable(props) {
  const header = (
    <Table.Header>
      <Table.Row>
        <Table.ColHeader>Publication Name</Table.ColHeader>
        <Table.ColHeader>Author</Table.ColHeader>
        <Table.ColHeader>Date</Table.ColHeader>
        <Table.ColHeader>Journal</Table.ColHeader>
        <Table.ColHeader>PMID</Table.ColHeader>
        <Table.ColHeader>DOI</Table.ColHeader>
      </Table.Row>
    </Table.Header>
  );
  const content = props.pubs.map((pub) => (
    <Table.Row>
      <Table.Col>
        <a href={pub.link}>{pub.title}</a>
      </Table.Col>
      <Table.Col>{pub.author}</Table.Col>
      <Table.Col>{pub.date}</Table.Col>
      <Table.Col>{pub.journal}</Table.Col>
      <Table.Col>{(pub.identifiers || {}).pmid}</Table.Col>
      <Table.Col>{(pub.identifiers || {}).doi}</Table.Col>
    </Table.Row>
  ));
  return (
    <div>
      {header}
      <Table.Body>{content}</Table.Body>
    </div>
  );
}

class Home extends Component {
  componentDidMount() {
    // Call our fetch function below once the component mounts
    this.props.dispatchGetDbSummary();
  }

  render() {
    const {
      seqRunCnt,
      sampleCnt,
      disease,
      publication,
      tissue,
      assay,
    } = this.props.summary;

    if (
      !seqRunCnt ||
      !sampleCnt ||
      !disease ||
      !publication ||
      !tissue ||
      !assay
    )
      return null;

    const diseaseArray = Object.entries(disease).sort(
      (first, second) => second[1] - first[1]
    );
    return (
      <SiteWrapper>
        <Page.Content>
          <Grid.Row cards={true} gutters={'lg'}>
            <Grid.Col lg={9}>
              <Card>
                <Card.Header>
                  <Card.Title>About FinaleDB</Card.Title>
                </Card.Header>
                <Card.Body>
                  FinaleDB refers to <b>F</b>ragmentat<b>I</b>o<b>N</b> <b>A</b>
                  na<b>L</b>ysis of c<b>E</b>ll-free DNA DataBase. It is a
                  comprehensive cell-free DNA (cfDNA) fragmentation pattern
                  database to host uniformly processed and quality controlled
                  2579 paired-end cfDNA WGS datasets from 2505 samples across 23
                  different pathological conditions in the existing public
                  domain. <br />
                  <br />
                  <b> Our lab is moving to Northwestern University. The server is currently
                  down. Please use globus.org (check https://docs.globus.org/how-to/get-started/)
                    and search the endpoint named FinaleDB_northwestern_2023
                  (url: https://app.globus.org/file-manager?origin_id=68c86914-a133-4e16-963d-028cc5f60cea&origin_path=%2F)
                  to download all the files.</b> <br /> <br />
                  cfDNA fragmentation patterns inspired much interest in the
                  research community. The fragmentation is a nucleosome-guided
                  non-random process. Its patterns have been demonstrated to be
                  closely related to diseases such as cancer, and have the
                  potential as blood-based biomarkers that provide diagnostic
                  and prognostic insight in a number of pathological conditions.
                  However, a centralized database hosting publicly-available
                  cfDNA fragmentation data does not yet exist. In addition, due
                  to the protection of genotype information of patients, which
                  in fact is not needed for the fragmentation analysis,
                  databases such as dbGap and EGA requires special application
                  procedure in terms of data access, and getting approvals can
                  be burdensome. Lastly, different cfDNA studies usually employ
                  different data processing workflows, resulting in possibly
                  inconsistent cfDNA datasets. <br /> <br />
                  FinaleDB curates cfDNA fragmentation data by collecting
                  published WGS datasets and remove the original sequences to
                  de-identify the sensitive genotype information. All the
                  datasets are uniquely processed by an in-house developed
                  workflow (see data collection and prcoessing). FinaleDB users
                  can conveniently browse, query and visualize the datasets
                  through FinaleDB web portal.
                </Card.Body>
              </Card>

              <Card>
                <Card.Header>
                  <Card.Title>Sample Number per Disease</Card.Title>
                </Card.Header>
                <C3Chart
                  data={{
                    columns: diseaseArray,
                    type: 'bar',
                  }}
                  legend={{
                    show: true,
                    position: 'bottom',
                    padding: 0,
                  }}
                  tooltip={{
                    format: {
                      title: () => '',
                    },
                  }}
                  axis={{
                    x: {
                      show: true,
                    },
                    y: {
                      show: true,
                    },
                  }}
                  padding={{
                    bottom: 0,
                    left: -1,
                    right: -1,
                  }}
                  point={{
                    show: true,
                  }}
                />
              </Card>

              <Card>
                <Card.Header>
                  <Card.Title>Publications</Card.Title>
                </Card.Header>
                <Table
                  responsive
                  highlightRowOnHover
                  hasOutline
                  verticalAlign="center"
                  cards
                  className="text-nowrap"
                >
                  <PublicationTable pubs={publication} />
                </Table>
              </Card>
            </Grid.Col>

            <Grid.Col sm={3}>
              <Grid.Row>
                <StampCard
                  color="blue-light"
                  icon="activity"
                  header={
                    <a href="#">
                      {sampleCnt} <small>Samples</small>
                    </a>
                  }
                />

                <StampCard
                  color="red-light"
                  icon="activity"
                  header={
                    <a href="#">
                      {seqRunCnt} <small>Seqencing runs</small>
                    </a>
                  }
                />

                <StampCard
                  color="green-light"
                  icon="book-open"
                  header={
                    <a href="#">
                      {publication.length} <small>Publications</small>
                    </a>
                  }
                />

                <Card>
                  <Card.Header>
                    <Card.Title>Disease Status</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <C3Chart
                      style={{ height: '12rem' }}
                      data={{
                        columns: diseaseArray,
                        type: 'donut', // default type of chart
                      }}
                      donut={{
                        label: {
                          format: (value) => value,
                        },
                      }}
                      legend={{
                        show: false, //hide legend
                      }}
                      padding={{
                        bottom: 0,
                        top: 0,
                      }}
                    />
                  </Card.Body>
                </Card>
              </Grid.Row>

              <Grid.Row>
                <Card>
                  <Card.Header>
                    <Card.Title>Assay Types</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <C3Chart
                      style={{ height: '12rem' }}
                      data={{
                        columns: Object.entries(assay),
                        type: 'donut', // default type of chart
                      }}
                      legend={{
                        show: false, //hide legend
                      }}
                      padding={{
                        bottom: 0,
                        top: 0,
                      }}
                    />
                  </Card.Body>
                </Card>
              </Grid.Row>

              <Grid.Row>
                <Card>
                  <Card.Header>
                    <Card.Title>Tissues</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <C3Chart
                      style={{ height: '12rem' }}
                      data={{
                        columns: Object.entries(tissue),
                        type: 'donut', // default type of chart
                      }}
                      legend={{
                        show: false, //hide legend
                      }}
                      padding={{
                        bottom: 0,
                        top: 0,
                      }}
                    />
                  </Card.Body>
                </Card>
              </Grid.Row>
            </Grid.Col>
          </Grid.Row>
        </Page.Content>
      </SiteWrapper>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  // TODO remove this later
  dispatchGetDbSummary: () => dispatch(getDbSummary()),
});

const mapStateToProps = (state) => {
  return { summary: state.summary };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);

// export default Home;
