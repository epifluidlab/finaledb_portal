import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { changeGenomeAssembly } from '../redux/actions/epiBrowserActions';

// A React container component wraps the WashU Epigenome Browser

class EpiBrowser extends React.Component {
  // process track data and generate WashU browser-ready track objects
  static processTracks(assembly, tracks) {
    // Colors that are used to display numeric tracks (such as bigWig)
    const trackColors = [
      '#058DC7',
      '#50B432',
      '#ED561B',
      '#DDDF00',
      '#24CBE5',
      '#64E572',
      '#FF9655',
      '#FFF263',
      '#6AF9C4',
    ];

    // filter tracks matching the assembly
    const filteredTracks = tracks.filter((val) => val.assembly === assembly);

    // Determine colors of the tracks
    // Each track will be assigned a color from trackColors, based on natural order
    const uniqEntryIdx = filteredTracks
      .map((val) => val.entryId)
      .filter((ele, idx, data) => data.indexOf(ele) === idx);
    const colorMap = uniqEntryIdx.reduce((m, entryId, idx) => {
      const newMap = { ...m };
      newMap[entryId] = trackColors[idx % trackColors.length];
      return newMap;
    }, {});

    return filteredTracks.map((val) => {
      const { type, name, url, entryId } = val;
      const track = { type, name, url };
      track.options = {
        color: colorMap[entryId],
        height: 96,
      };
      return track;
    });
  }

  constructor(props) {
    super(props);

    this.browserRef = React.createRef();
  }

  componentDidMount() {
    this.renderBrowser(this.props);
  }

  shouldComponentUpdate(nextProps) {
    // Always manually handle rendering and updating
    const { assembly, revision, displayRegion } = this.props;
    if (
      assembly !== nextProps.assembly ||
      revision !== nextProps.revision ||
      displayRegion !== nextProps.displayRegion
    ) {
      this.renderBrowser(nextProps);
    }
    return false;
  }

  renderBrowser(props) {
    const { assembly, displayRegion, refTracks, tracks } = props;
    console.log(`Render browser: ${assembly} : ${displayRegion}`);

    const dataTracks = EpiBrowser.processTracks(assembly, tracks);

    const contents = {
      genomeName: assembly,
      displayRegion,
      trackLegendWidth: 120,
      isShowingNavigator: true,
      tracks: refTracks.concat(dataTracks),
      metadataTerms: ['Sample'],
      regionSets: [],
      regionSetViewIndex: -1,
    };

    const rootNode = this.browserRef.current;
    // rootNode should have at most one child node
    while (rootNode.childNodes.length > 1) {
      rootNode.removeChild(rootNode.firstChild);
    }

    const browserNode = document.createElement('div');
    browserNode.setAttribute('style', 'visibility: hidden;');
    rootNode.appendChild(browserNode);
    // First child is for display, therefor can't be hidden
    rootNode.firstChild.removeAttribute('style');
    window.renderBrowserInElement(contents, browserNode);
  }

  render() {
    return <div id="epgg-root" ref={this.browserRef} />;
  }
}

const mapStateToProps = (state) => ({
  ...state.browser,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchChangeAssembly: (assembly) =>
    dispatch(changeGenomeAssembly(assembly)),
});

EpiBrowser.propTypes = {
  revision: PropTypes.number.isRequired,
  assembly: PropTypes.string.isRequired,
  displayRegion: PropTypes.string.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(EpiBrowser);
