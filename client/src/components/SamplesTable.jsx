import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Card,
  Grid,
  Button,
  Text,
  Form,
  Icon,
  Dropdown,
  Tab,
} from 'tabler-react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { addDownload, removeDownload } from '../redux/downloads/actions';
import { s3Bucket } from '../settings';

const SamplesTableControl = ({ offset, total, rowCount, handlePaging }) => (
  <div>
    {/* <Grid.Row>
        <Grid.Col width={4} offset={4}>
          <Button color="blue" onClick={handleVisualizing}>
            Visualize
          </Button>
        </Grid.Col>
      </Grid.Row> */}
    <Grid.Row size="lg" className="mx-1 my-2">
      <Grid.Col width={1}>
        <Button link icon="arrow-left" onClick={() => handlePaging(true)} />
      </Grid.Col>
      <Grid.Col width={3}>
        <Form.StaticText className="text-center">
          {`${offset + 1}-${offset + rowCount} of ${total}`}
        </Form.StaticText>
      </Grid.Col>
      <Grid.Col width={1}>
        <Button link icon="arrow-right" onClick={() => handlePaging(false)} />
      </Grid.Col>
    </Grid.Row>
  </div>
);

SamplesTableControl.propTypes = {
  offset: PropTypes.number,
  total: PropTypes.number,
  rowCount: PropTypes.number,
  handlePaging: PropTypes.func.isRequired,
};

SamplesTableControl.defaultProps = {
  offset: 0,
  total: 0,
  rowCount: 0,
};

const SamplesTableRow = ({
  downloads,
  // sample,
  entry,
  assembly: selectedAssembly,
  isSelected,
  isQuery,
  onChange,
  addDownload,
  removeDownload,
}) => {
  console.log(`SampleRow assembly ${selectedAssembly}`);
  const { sample = {} } = entry;

  const {
    id: entryId,
    altId: { SRA: sraId } = {},
    sample: { name: sampleName } = {},
  } = entry;

  const canonicalEntryId = sraId || `EE${entryId}`;
  const canonicalSampleName = sampleName; // || geoId;

  const sampleInBasket = downloads.find(
    (download) => download.sraId === sample.sraId
  );
  const addToBasket = () => addDownload(sample);
  const removeFromBasket = () => removeDownload(sample.sraId);

  // const disease = sample.disease || '';
  const disease = (entry.sample || {}).disease || '';
  // (sample.pathological || []).join(', ');
  const truncatedDisease =
    disease.length > 20 ? `${disease.substring(0, 20)}  ...` : disease;

  const genDownloadList = (downloadedEntry) => {
    const fileLists = (selectedAssembly
      ? [selectedAssembly]
      : ['hg19', 'hg38']
    ).map((assembly) =>
      ((downloadedEntry.analysis || {})[assembly] || []).reduce((acc, item) => {
        if (item.type === 'txt' && item.desc === 'fragment size')
          return [
            ...acc,
            {
              desc: `Fragment size distribution (${assembly})`,
              url: `${s3Bucket}/${item.key}`,
            },
          ];
        if (item.type === 'bedGraph' && item.desc === 'coverage')
          return [
            ...acc,
            {
              desc: `Fragment coverage (${assembly})`,
              url: `${s3Bucket}/${item.key}`,
            },
          ];
        if (item.type === 'bedGraph' && item.desc === 'fragment profile')
          return [
            ...acc,
            {
              desc: `Fragment size profile (${assembly})`,
              url: `${s3Bucket}/${item.key}`,
            },
          ];
        if (item.type === 'bedGraph' && item.desc === 'WPS')
          return [
            ...acc,
            {
              desc: `Windowed Protection Score (WPS) (${assembly})`,
              url: `${s3Bucket}/${item.key}`,
            },
          ];
        if (item.type === 'tsv' && item.desc === 'fragment')
          return [
            ...acc,
            {
              desc: `Fragment .tsv file (${assembly})`,
              url: `${s3Bucket}/${item.key}`,
            },
          ];

        return acc;
      }, [])
    );
    console.log(fileLists);
    return fileLists[0].concat(fileLists[1] || []).map((item) => ({
      value: (
        <a href={item.url} download _target="blank" rel="noreferrer">
          {item.desc}
        </a>
      ),
    }));
  };

  return (
    <Table.Row style={isQuery && isSelected ? { background: 'lavender' } : {}}>
      {isQuery ? (
        <Table.Col>
          <Form.Checkbox
            isInline
            label=" "
            value={entry.id}
            checked={isSelected}
            onChange={(e) => {
              const {
                target: { value, checked },
              } = e;
              onChange(parseInt(value, 10), checked);
            }}
          />
        </Table.Col>
      ) : null}
      <Table.Col>
        <div>{canonicalSampleName}</div>
        <Text size="sm" muted>
          {canonicalEntryId}
        </Text>
      </Table.Col>
      <Table.Col>
        <div title={disease}>{truncatedDisease}</div>
        <Text size="sm" muted>
          {sample.gender || ''}
          {sample.age || ''}
        </Text>
      </Table.Col>
      <Table.Col>{sample.tissue || ''}</Table.Col>
      <Table.Col>
        <Text size="sm" muted>
          {(entry.seqConfig || {}).readlen || ''} <br />
          {entry.mbases || ''}
        </Text>
      </Table.Col>
      <Table.Col>
        <Text size="sm" muted>
          {(entry.seqConfig || {}).instrument || ''}
        </Text>
      </Table.Col>
      <Table.Col>
        <Text size="sm" muted>
          {entry.assay}
        </Text>
      </Table.Col>
      <Table.Col width={1}>
        <a
          href={(entry.publication || {}).link || '#'}
          target="_blank"
          rel="noreferrer"
        >
          <Text size="sm" muted>
            {(entry.publication || {}).citeShort || ''}
          </Text>
        </a>
      </Table.Col>
      <Table.Col>
        <Dropdown arrow icon="download" itemsObject={genDownloadList(entry)} />
        {/* <Button link size="sm" icon="download"></Button> */}
      </Table.Col>

      {/* <Table.Col alignContent="center">
        <Form.Group>
          <Form.InputGroup append>
            <Button.Dropdown>
              <Dropdown.Item>
                <Button
                  link
                  onClick={sampleInBasket ? removeFromBasket : addToBasket}
                >
                  Direct Download
                </Button>
              </Dropdown.Item>
              <Dropdown.Item>
                <Button
                  link
                  onClick={sampleInBasket ? removeFromBasket : addToBasket}
                >
                  Add to download list
                </Button>
              </Dropdown.Item>
              <Dropdown.ItemDivider />
              <Dropdown.Item>
                <Link to={`/visualization/${sample.sraId}`}>
                  <Button link>Visualization</Button>
                </Link>
              </Dropdown.Item>
              <Dropdown.Item>
                <Button link RootComponent="a" href={sample.publication.link}>
                  See Publication
                </Button>
              </Dropdown.Item>
            </Button.Dropdown>
          </Form.InputGroup>
        </Form.Group>
      </Table.Col> */}
    </Table.Row>
  );
};

SamplesTableRow.propTypes = {
  entry: PropTypes.shape({
    id: PropTypes.number,
    altId: PropTypes.shape({
      SRA: PropTypes.string,
    }),
    sample: PropTypes.shape({
      gender: PropTypes.string,
      age: PropTypes.number,
    }),
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  isQuery: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  downloads: state.downloads.downloads,
});

const SamplesTableRowConnected = connect(mapStateToProps, {
  addDownload,
  removeDownload,
})(SamplesTableRow);

const SamplesTable = ({
  entries,
  assembly,
  paging,
  visualizeUrl,
  selectedEntries,
  isQuery,
  handleSelectEntry,
  handlePaging,
}) => {
  let tableControl;
  if (isQuery) {
    const { offset, total, rowCount } = paging;
    tableControl = (
      <SamplesTableControl
        offset={offset}
        total={total}
        rowCount={rowCount}
        visualizeUrl={visualizeUrl}
        handlePaging={handlePaging}
      />
    );
  } else {
    tableControl = null;
  }

  const header = (
    <Table.Header>
      <Table.Row>
        {isQuery ? <Table.ColHeader /> : null}
        <Table.ColHeader>
          Sample Name
          <br /> Run ID
        </Table.ColHeader>
        <Table.ColHeader>
          Disease status <br /> Sex, Age
        </Table.ColHeader>
        <Table.ColHeader>Tissue</Table.ColHeader>
        <Table.ColHeader>
          Read length <br /> Mbases{' '}
        </Table.ColHeader>
        <Table.ColHeader>Platform</Table.ColHeader>
        <Table.ColHeader>Assay</Table.ColHeader>
        <Table.ColHeader>Study</Table.ColHeader>
        <Table.ColHeader></Table.ColHeader>
        {/* <Table.ColHeader>Platform</Table.ColHeader> */}

        {/* <Table.ColHeader>Other</Table.ColHeader> */}
      </Table.Row>
    </Table.Header>
  );

  const selectedEntryIds = selectedEntries.map((entry) => entry.id);
  // Always pin selected entries if they are not in current view
  const currentEntryIds = entries.map((entry) => entry.id);
  const pinnedEntries = selectedEntries.filter(
    (selectedEntry) => !currentEntryIds.includes(selectedEntry.id)
  );
  const entry2row = (entry) => (
    <SamplesTableRowConnected
      key={entry.id}
      entry={entry}
      assembly={assembly}
      isSelected={selectedEntryIds.includes(entry.id)}
      sample={entry.sample}
      isQuery={isQuery}
      onChange={handleSelectEntry}
    />
  );
  const pinned =
    pinnedEntries && pinnedEntries.length > 0
      ? pinnedEntries.map(entry2row)
      : null;
  const content = entries.map(entry2row);

  return (
    <div>
      {tableControl}
      {header}
      <Table.Body>
        {pinned}
        {/* {pinned ? (
          <hr
            style={{
              color: 'gray',
              backgroundColor: 'gray',
              height: 5,
            }}
          />
        ) : null} */}
        {content}
        {/* <Table.Row>
          <Card className="m-2">
          <Table className="card-table table-vcenter">
            <Table.Header>
              <Table.Row>
                <Table.ColHeader>
                  Haha
                </Table.ColHeader>
                <Table.ColHeader>BY</Table.ColHeader>
              </Table.Row>
            </Table.Header>
          </Table>
          </Card>
        </Table.Row> */}
      </Table.Body>
    </div>
  );
};

SamplesTable.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number })),
  selectedEntries: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number })),
  paging: PropTypes.shape({
    offset: PropTypes.number,
    total: PropTypes.number,
    rowCount: PropTypes.number,
  }).isRequired,

  handleSelectEntry: PropTypes.func.isRequired,
  handlePaging: PropTypes.func.isRequired,
  // Whether it's for the query page
  isQuery: PropTypes.bool,
};

SamplesTable.defaultProps = {
  entries: [],
  selectedEntries: [],
  isQuery: false,
};

export default SamplesTable;
