// @flow

import * as React from "react";

import {
  Page,
  Card,
  Grid,
  Table,
  Form,
  Button,
  Text,
} from "tabler-react";

import SiteWrapper from "./SiteWrapper.react";

function FormElements() {
  return (
    <SiteWrapper>
      <Page.Content title="Search samples">
        <Grid.Row cards={true} justifyContent="flex-end">


          <Grid.Col>
            <Card>
              <Card.Body>
                <Form.Group label="Region search">
                  <Form.InputGroup>
                    <Form.Input placeholder="Search for chromosome coordinate, rsID, gene name..." />
                    <Form.InputGroupAppend>
                      <Button
                        color="primary"
                        outline
                        icon="search"
                        href="http://www.google.com"
                      />
                    </Form.InputGroupAppend>
                  </Form.InputGroup>
                </Form.Group>
              </Card.Body>
            </Card>

            <Card>
              <Table
                responsive
                highlightRowOnHover
                hasOutline
                verticalAlign="center"
                cards
                className="text-nowrap"
              >
                <Table.Header>
                  <Table.Row>
                    <Table.ColHeader>Sample Name</Table.ColHeader>
                    <Table.ColHeader>Disease status</Table.ColHeader>
                    <Table.ColHeader>Sex</Table.ColHeader>
                    <Table.ColHeader>Age</Table.ColHeader>
                    <Table.ColHeader>Run type</Table.ColHeader>
                    <Table.ColHeader>len.</Table.ColHeader>
                    <Table.ColHeader>Datatype</Table.ColHeader>
                    <Table.ColHeader>PMID</Table.ColHeader>
                    <Table.ColHeader alignContent="center">
                      <i className="icon-settings" />
                    </Table.ColHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  <Table.Row>
                    <Table.Col>
                      <div>Sample Name</div>
                      <Text size="sm" muted>
                        SRA ID
                      </Text>
                    </Table.Col>
                    <Table.Col>
                      <div>Lung cancer</div>
                    </Table.Col>
                    <Table.Col>
                      <div>Female</div>
                    </Table.Col>
                    <Table.Col>
                      <div>39</div>
                    </Table.Col>
                    <Table.Col>
                      <div>PAIRED</div>
                    </Table.Col>
                    <Table.Col>
                      <div>39</div>
                    </Table.Col>
                    <Table.Col>
                      <div>WGS</div>
                    </Table.Col>
                    <Table.Col>
                      <Button link size="sm">
                        26771485
                      </Button>
                    </Table.Col>
                    <Table.Col alignContent="center">
                      <Button.List>
                        <Button icon="download" size="sm" color='secondary'/>
                        <Button icon="check" size="sm"color='secondary' />
                      </Button.List>
                    </Table.Col>
                  </Table.Row>


                </Table.Body>
              </Table>
            </Card>
          </Grid.Col>
        </Grid.Row>
      </Page.Content>
    </SiteWrapper>
  );
}

export default FormElements;
