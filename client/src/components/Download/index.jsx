import React from 'react';
import { connect } from 'react-redux';
import { Button, Dropdown } from 'tabler-react';

class Download extends React.Component {
  render() {
    const { downloads } = this.props;
    return (
      <Button.Dropdown icon="shopping-bag">
        {
          downloads.map(download => <Dropdown.Item>{download.sample_name}</Dropdown.Item>)
        }
      </Button.Dropdown>
    )
  }
}

const mapStateToProps = state => ({
  downloads: state.downloads.downloads
});

export default connect(mapStateToProps, null)(Download);
