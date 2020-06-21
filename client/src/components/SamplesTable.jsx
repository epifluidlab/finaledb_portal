import React from 'react';
import PropTypes from 'prop-types';
import { Table, Grid, Button, Text, Form, Dropdown, Icon } from 'tabler-react';
import { connect } from 'react-redux';
// import { addDownload, removeDownload } from '../redux/downloads/actions';
import { s3Bucket } from '../settings';

const SamplesTableControl = ({ offset, total, rowCount, handlePaging }) => (
  <div>
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
  // sample,
  entry,
  downloads,
  isSelected,
  isQuery,
  onChange,
  handleAddDownloadItem,
  // addDownload,
  // removeDownload,
}) => {
  const { sample = {} } = entry;

  const {
    id: entryId,
    altId: { SRA: sraId } = {},
    sample: { name: sampleName } = {},
  } = entry;

  const canonicalEntryId = sraId || `EE${entryId}`;
  const canonicalSampleName = sampleName; // || geoId;

  // const sampleInBasket = downloads.find(
  //   (download) => download.sraId === sample.sraId
  // );
  // const addToBasket = () => addDownload(sample);
  // const removeFromBasket = () => removeDownload(sample.sraId);

  // const disease = sample.disease || '';
  const disease = (entry.sample || {}).disease || '';
  // (sample.pathological || []).join(', ');
  const truncatedDisease =
    disease.length > 20 ? `${disease.substring(0, 20)}  ...` : disease;

  // Check if entry is in downloadlist
  const isInDownloadList = ((downloads || {}).downloadList || []).find(
    (item) => item.entry.id === entry.id
  );

  // const genDownloadList = (downloadedEntry) => {
  //   const fileLists = (selectedAssembly
  //     ? [selectedAssembly]
  //     : ['hg19', 'hg38']
  //   ).map((assembly) =>
  //     ((downloadedEntry.analysis || {})[assembly] || []).reduce((acc, item) => {
  //       if (item.type === 'txt' && item.desc === 'fragment size')
  //         return [
  //           ...acc,
  //           {
  //             desc: `Fragment size distribution (${assembly})`,
  //             url: `${s3Bucket}/${item.key}`,
  //           },
  //         ];
  //       if (item.type === 'bedGraph' && item.desc === 'coverage')
  //         return [
  //           ...acc,
  //           {
  //             desc: `Fragment coverage (${assembly})`,
  //             url: `${s3Bucket}/${item.key}`,
  //           },
  //         ];
  //       if (item.type === 'bedGraph' && item.desc === 'fragment profile')
  //         return [
  //           ...acc,
  //           {
  //             desc: `Fragment size profile (${assembly})`,
  //             url: `${s3Bucket}/${item.key}`,
  //           },
  //         ];
  //       if (item.type === 'bedGraph' && item.desc === 'WPS')
  //         return [
  //           ...acc,
  //           {
  //             desc: `Windowed Protection Score (WPS) (${assembly})`,
  //             url: `${s3Bucket}/${item.key}`,
  //           },
  //         ];
  //       if (item.type === 'tsv' && item.desc === 'fragment')
  //         return [
  //           ...acc,
  //           {
  //             desc: `Fragment .tsv file (${assembly})`,
  //             url: `${s3Bucket}/${item.key}`,
  //           },
  //         ];

  //       return acc;
  //     }, [])
  //   );
  //   console.log(fileLists);
  //   return fileLists[0].concat(fileLists[1] || []).map((item) => ({
  //     value: (
  //       <a href={item.url} download _target="blank" rel="noreferrer">
  //         {item.desc}
  //       </a>
  //     ),
  //   }));
  // };

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
          {(() => {
            const fragNumInM =
              Math.round(
                Math.max(...Object.values(entry.fragNum || {})) / 1e5
              ) / 10;
            // If entry.fragNum is empty, fragNumInM would be -Infinity
            return !fragNumInM || fragNumInM === -Infinity
              ? ''
              : `${fragNumInM}M`;
          })()}{' '}
          <br />
          {(entry.seqConfig || {}).readlen || ''}
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
      {isInDownloadList ? (
        <Table.Col>
          <Button icon="check" className="download-icon-green" />
          <Button
            icon="minus"
            className="download-icon-red"
            onClick={() => handleAddDownloadItem([entry], false)}
          />
        </Table.Col>
      ) : (
        <Table.Col>
          <Button
            icon="plus"
            className="download-icon-green"
            onClick={() => handleAddDownloadItem([entry], true)}
          />
        </Table.Col>
      )}
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
  downloads: PropTypes.shape({
    downloadList: PropTypes.arrayOf(PropTypes.shape()),
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  isQuery: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

// const mapStateToProps = (state) => ({
//   downloads: state.downloads.downloads,
// });

// const SamplesTableRowConnected = connect(mapStateToProps, {
//   addDownload,
//   removeDownload,
// })(SamplesTableRow);

const SamplesTable = ({
  entries,
  downloads,
  paging,
  visualizeUrl,
  selectedEntries,
  isQuery,
  handleSelectEntry,
  handlePaging,
  handleAddDownloadItem,
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
          # of fragments <br /> Read length{' '}
        </Table.ColHeader>
        <Table.ColHeader>Platform</Table.ColHeader>
        <Table.ColHeader>Assay</Table.ColHeader>
        <Table.ColHeader>Study</Table.ColHeader>
        <Table.ColHeader>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <Icon prefix="fe" name="download" />
        </Table.ColHeader>
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
    <SamplesTableRow
      key={entry.id}
      entry={entry}
      downloads={downloads}
      isSelected={selectedEntryIds.includes(entry.id)}
      sample={entry.sample}
      isQuery={isQuery}
      onChange={handleSelectEntry}
      handleAddDownloadItem={handleAddDownloadItem}
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
      <Table
        responsive
        highlightRowOnHover
        hasOutline
        verticalAlign="center"
        cards
        className="text-nowrap"
      >
        {header}
        <Table.Body>
          {pinned}
          {content}
        </Table.Body>
      </Table>
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
