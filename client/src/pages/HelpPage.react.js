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
                <Card.Header>
                  <Card.Title>FAQ & Contact</Card.Title>
                </Card.Header>
                <Card.Body>
                </Card.Body>
              </Card>
          </Grid.Col>
        </Grid.Row>
      </Page.Content>
    </SiteWrapper>
  );
}

export default FormElements;
