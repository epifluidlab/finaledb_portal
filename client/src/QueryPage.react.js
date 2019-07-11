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
            <Button.List>
              <Button link icon="x">
                Clear all fields
              </Button>
            </Button.List>
          </Grid.Col>
        </Grid.Row>

        <Grid.Row cards={true}>
          <Grid.Col md={2}>
            <Card>
              <Table className="card-table table-vcenter">
                <Table.Body>
                  <Table.Row>
                    <Table.Col>
                      <Form.Group label="Genome assembly">
                        <Form.SelectGroup>
                          <Form.SelectGroupItem
                            name="device"
                            label="hg19"
                            value="hg19"
                          />
                          <Form.SelectGroupItem
                            name="device"
                            label="hg38"
                            value="hg39"
                          />
                        </Form.SelectGroup>
                      </Form.Group>
                    </Table.Col>
                  </Table.Row>
                  <Table.Row>
                    <Table.Col>
                      <Form.Group label="Repository">
                        <Form.Checkbox
                          name="example-radios"
                          label="NCBI"
                          value="option1"
                        />
                        <Form.Checkbox
                          name="example-radios"
                          label="dbGaP"
                          value="option2"
                        />
                        <Form.Checkbox
                          disabled
                          name="example-radios"
                          label="ENA"
                          value="option3"
                        />
                      </Form.Group>
                    </Table.Col>
                  </Table.Row>
                  <Table.Row>
                    <Table.Col>
                      <Form.Group label="Platform">
                        <Form.Checkbox
                          name="example-radios"
                          label="Ilumina HiSeq 2000"
                          value="option1"
                        />
                        <Form.Checkbox
                          name="example-radios"
                          label="Ilumina HiSeq 2500"
                          value="option2"
                        />
                        <Form.Checkbox
                          name="example-radios"
                          label="Ilumina HiSeq 4000"
                          value="option3"
                        />
                      </Form.Group>
                    </Table.Col>
                  </Table.Row>
                  <Table.Row>
                    <Table.Col>
                      <Form.Group label="Run type">
                        <Form.Checkbox
                          name="example-radios"
                          label="single-ended"
                          value="option1"
                        />
                        <Form.Checkbox
                          name="example-radios"
                          label="paird-ended"
                          value="option2"
                        />
                      </Form.Group>
                    </Table.Col>
                  </Table.Row>
                  <Table.Row>
                    <Table.Col>
                      <Form.Group label="Read length">
                        <Form.Checkbox
                          name="example-radios"
                          label="50"
                          value="option1"
                        />
                        <Form.Checkbox
                          name="example-radios"
                          label="120"
                          value="option2"
                        />
                      </Form.Group>
                    </Table.Col>
                  </Table.Row>
                  <Table.Row>
                    <Table.Col>
                      <Form.Group label="Age">
                        <Form.Checkbox
                          isInline
                          name="0-10"
                          label="0-10"
                          value="option1"
                        />
                        <Form.Checkbox
                          isInline
                          name="example-radios"
                          label="11-20"
                          value="option2"
                        />
                        <Form.Checkbox
                          isInline
                          name="example-radios"
                          label="21-30"
                          value="option2"
                        />
                        <Form.Checkbox
                          isInline
                          name="example-radios"
                          label="31-40"
                          value="option2"
                        />
                        <Form.Checkbox
                          isInline
                          name="example-radios"
                          label="41-50"
                          value="option2"
                        />
                        <Form.Checkbox
                          isInline
                          name="example-radios"
                          label="51-60"
                          value="option2"
                        />
                        <Form.Checkbox
                          isInline
                          name="example-radios"
                          label="61-70"
                          value="option2"
                        />
                        <Form.Checkbox
                          isInline
                          name="example-radios"
                          label="71-80"
                          value="option2"
                        />
                        <Form.Checkbox
                          isInline
                          name="example-radios"
                          label="81-90"
                          value="option2"
                        />
                      </Form.Group>
                    </Table.Col>
                  </Table.Row>
                  <Table.Row>
                    <Table.Col>
                      <Form.Group label="Disease status">
                        <Form.Checkbox
                          name="example-radios"
                          label="healthy"
                          value="option1"
                        />
                        <Form.Checkbox
                          name="example-radios"
                          label="lung cancer"
                          value="option2"
                        />
                        <Form.Checkbox
                          name="example-radios"
                          label="athersclerosis"
                          value="option3"
                        />
                        <Form.Checkbox
                          name="example-radios"
                          label="athersclerosis"
                          value="option3"
                        />
                        <Form.Checkbox
                          name="example-radios"
                          label="athersclerosis"
                          value="option3"
                        />
                      </Form.Group>
                    </Table.Col>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Card>
          </Grid.Col>

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
                        <Button icon="download" size="sm" />
                        <Button icon="check" size="sm" />
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
