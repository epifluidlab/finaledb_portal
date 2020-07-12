import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import log from 'loglevel';
import Dropzone from 'react-dropzone';
import { Page, Grid, Table, Form } from 'tabler-react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

import { setExternalTracks } from '../redux/actions/epiBrowserActions';

class EpiBrowserSessionUploader extends React.Component {
  onDrop = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        // Do whatever you want with the file contents
        const contents = reader.result;
        const session = JSON.parse(contents);
        const externalTracks = (session.tracks || []).filter((track) => {
          const trackName = track.name.toLowerCase();
          const index = ['refgene', 'ruler'].findIndex(
            (val) => val === trackName
          );
          return index === -1;
        });
        console.log(`External tracks: ${externalTracks}`);

        const { dispatchSetExternalTracks } = this.props;
        dispatchSetExternalTracks(externalTracks);

        console.log(session);
      };
      reader.readAsText(file);
    });

    console.log(acceptedFiles);
  };

  render() {
    return (
      <Dropzone onDrop={this.onDrop}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <Card row={4}>
              <Card.Body>
                <b>Import session from WashU epigenome browser</b>
                <br />
                <br />
                1. In WashU Epigenome browser, click "Session" under the "Apps"
                tab.
                <br />
                2. Download the session.
                <br />
                3. Upload the session file by drag-'n'-drop here, or click this
                area.
              </Card.Body>
            </Card>
            {/* <p>Drag 'n' drop some files here, or click to select files</p> */}
          </div>
        )}
      </Dropzone>
    );
  }
}

const mapStateToProps = (state) => ({
  ...state.browser,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchSetExternalTracks: (externalTracks) =>
    dispatch(setExternalTracks(externalTracks)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EpiBrowserSessionUploader);
