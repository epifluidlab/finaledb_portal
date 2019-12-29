import React from 'react';
import { Table, Button, Text, Form, Dropdown } from 'tabler-react';
import { connect } from 'react-redux';
import { addDownload, removeDownload } from '../../redux/downloads/actions';



const SamplesTableRow = ({ downloads, sample, addDownload, removeDownload }) => {
  const sampleInBasket = downloads.find(download => download.sraId === sample.sraId);
  const addToBasket = () => addDownload(sample);
  const removeFromBasket = () => removeDownload(sample.sraId);

  const hi = () => {
    console.log('HIII')
  }

  return (
    <Table.Row>
      <Table.Col>
        <div>{sample.sampleName}</div>
        <Text size="sm" muted>
          {sample.sraId}
        </Text>
      </Table.Col>
      <Table.Col>
        {sample.disease}{sample.tissue ? ' (' + sample.tissue + ')' : sample.tissue}
        <Text size="sm" muted>
          {sample.sex}{sample.age ? ', '+ sample.age : sample.age}
        </Text>
      </Table.Col>
      <Table.Col> {sample.readLength} </Table.Col>
      <Table.Col>{sample.libraryFormat}</Table.Col>
      <Table.Col>{sample.platform}</Table.Col>
      <Table.Col> {sample.assayType} </Table.Col>

      <Table.Col alignContent="center">
        <Form.Group>
          <Form.InputGroup append>
            <Button.Dropdown>
              <Dropdown.Item>
                Direct download
              </Dropdown.Item>
              <Dropdown.Item>
                <Button link onClick={sampleInBasket ? removeFromBasket : addToBasket}>
                  Add to download list
                </Button>
              </Dropdown.Item>
              <Dropdown.ItemDivider />
              <Dropdown.Item>
                <Button link RootComponent="a" href={`/visualization/${sample.sraId}`}>
                  Visualiation
                </Button>
              </Dropdown.Item>
              <Dropdown.Item>
                <Button link RootComponent="a" href="/visualization">
                  See Publication
                </Button>
              </Dropdown.Item>
            </Button.Dropdown>
          </Form.InputGroup>
        </Form.Group>

        <Dropdown
        type="button"
        toggle={false}
        arrow
        triggerContent="other"
        itemsObject={[
          {
            value: "Visualization",
            RootComponent:"a",
            href:"/visualization",
          },
          { isDivider: true },
          { value: "Logout" },
        ]}
      />

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
        <Table.ColHeader>Sample Name<br /> Run ID</Table.ColHeader>
        <Table.ColHeader>Disease status (Tissue) <br /> Sex, Age</Table.ColHeader>
        <Table.ColHeader>Read <br /> len.</Table.ColHeader>
        <Table.ColHeader>Format</Table.ColHeader>
        <Table.ColHeader>Platform</Table.ColHeader>
        <Table.ColHeader>Assay <br /> Type</Table.ColHeader>
        <Table.ColHeader>Other</Table.ColHeader>

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
