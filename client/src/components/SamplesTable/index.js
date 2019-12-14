import React from 'react';
import { Table, Button, Text } from 'tabler-react';
import { connect } from 'react-redux';
import { addDownload, removeDownload } from '../../redux/downloads/actions';

const SamplesTableRow = ({ downloads, sample, addDownload, removeDownload }) => {
  const sampleInBasket = downloads.find(download => download.sraId === sample.sraId);
  const addToBasket = () => addDownload(sample);
  const removeFromBasket = () => removeDownload(sample.sraId);




  return (
    <Table.Row>
      <Table.Col>
        <div>{sample.sample_name}</div>
        <Text size="sm" muted>
          {sample.sraId}
        </Text>
      </Table.Col>
      <Table.Col>
        {sample.disease}
        <Text size="sm" muted>
          {sample.sex}{sample.age ? ', '+ sample.age : sample.age}
        </Text>
      </Table.Col>
      <Table.Col> {sample.libraryFormat} </Table.Col>
      <Table.Col> {sample.readLength} </Table.Col>
      <Table.Col>{sample.platform}</Table.Col>
      <Table.Col> {sample.datatype} </Table.Col>
      <Table.Col>
        <Button link size="sm" RootComponent="a" href={sample.link} target="_blank">
          {sample.doi}
        </Button>
      </Table.Col>
      <Table.Col alignContent="center">
        <Button.List>
          <Button icon="download" size="sm" color="secondary"/>
          <Button
            size="sm"
            onClick={sampleInBasket ? removeFromBasket : addToBasket}
            icon={sampleInBasket ? "x" : "plus"}
            color={sampleInBasket ? "danger" : "secondary"}
          />
          <Button icon="box" size="sm" color="secondary" RootComponent="a" href="/visualization"/>
        </Button.List>
      </Table.Col>
    </Table.Row>
  )
};


const mapStateToProps = (state) => ({
  downloads: state.downloads.downloads,
});

const SamplesTableRowConnected = connect(mapStateToProps, {
  addDownload,
  removeDownload
})(SamplesTableRow);

const SamplesTable = ({ samples }) => {
  const header = (
    <Table.Header>
      <Table.Row>
        <Table.ColHeader>Sample Name</Table.ColHeader>
        <Table.ColHeader>Disease status</Table.ColHeader>
        <Table.ColHeader>Run type</Table.ColHeader>
        <Table.ColHeader>len.</Table.ColHeader>
        <Table.ColHeader>Platform</Table.ColHeader>
        <Table.ColHeader>Datatype</Table.ColHeader>
        <Table.ColHeader>Publication</Table.ColHeader>
        <Table.ColHeader alignContent="center">
          <i className="icon-settings" />
        </Table.ColHeader>
      </Table.Row>
    </Table.Header>
  );

  const content = samples.map((sample) =>
    <SamplesTableRowConnected sample={sample} />
  );

  return (
    <div>
      {header}
      <Table.Body>
        {content}
      </Table.Body>
    </div>
  );
}

export default SamplesTable;
