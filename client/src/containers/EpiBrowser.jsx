import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import log from 'loglevel';

import { changeGenomeAssembly } from '../redux/actions/epiBrowserActions';
import { s3Bucket, showBAM } from '../settings';

// A React container component wraps the WashU Epigenome Browser

log.enableAll();

class EpiBrowser extends React.Component {
  // process track data and generate WashU browser-ready track objects
  static processTracks(assembly, entries) {
    log.info(entries);
    // Colors that are used to display numeric tracks (such as bigWig)
    const trackColors = [
      '#058DC7',
      '#50B432',
      // '#ED561B',
      '#DDDF00',
      '#24CBE5',
      '#64E572',
      '#FF9655',
      '#FFF263',
      '#6AF9C4',
    ];

    // Merge tracks from entries and only keep those matching the assembly
    const tracks = Object.values(entries || {}).reduce((arr, entry) => {
      const filteredAnalysis = (entry.analysis || []).filter((val) => {
        if (val.assembly !== assembly) return false;

        switch (val.type) {
          case 'BAM':
            return showBAM;
          case 'bigWig':
            return true;
          default:
            return false;
        }
      });
      // Sample name: original altId or the universal entryId
      const sampleName = (entry.altId || {}).original || `EE${entry.id}`;
      const tracksForEntry = filteredAnalysis.map((analysis) => {
        const url = `${s3Bucket}/${analysis.key}`;
        const name = (() => {
          switch (analysis.desc) {
            case 'BAM':
              return `BAM: ${sampleName}`;
            case 'coverage':
              return `Coverage: ${sampleName}`;
            case 'fragment profile':
              return `Fragments: ${sampleName}`;
            default:
              return '';
          }
        })();
        const { type } = analysis;
        // Each entry will be assigned a color from trackColors, by the natural order.
        const color =
          trackColors[
            Object.keys(entries).indexOf(entry.id) % trackColors.length
          ];

        return {
          type,
          name,
          url,
          options: { color, height: 96 },
        };
      });

      return arr.concat(tracksForEntry);
    }, []);

    log.info('Successfully building up the tracks!');
    log.info(tracks);

    return tracks;
  }

  constructor(props) {
    super(props);

    this.browserRef = React.createRef();
  }

  componentDidMount() {
    log.info('EpiBrowser: componentDidMount');
    // This is a weired behavior. When the EpiBrowser is unmounted and mounted again, unless you call
    // renderBrowser twice, thus epgg-root has two children nodes, the browser won't display properly.
    // Here, we force it to have at least two children nodes.
    this.renderBrowser(this.props);
    this.renderBrowser(this.props);
    log.info(this.props);
  }

  shouldComponentUpdate(nextProps) {
    // Always manually handle rendering and updating
    log.info('EpiBrowser: shouldComponentUpdate');
    const { revision } = this.props;
    if (revision !== nextProps.revision) {
      log.info(
        `Revision updated, renderBrowser: ${revision} => ${nextProps.revision}`
      );
      this.renderBrowser(nextProps);
    }
    return false;
  }

  componentWillUnmount() {
    // EpiBrowser relies on manual DOM manipulation. If the component is
    // unmounted because of React's render/update process, it may stop
    // functioning.
    log.warn('Browser is going to be unmounted!');
  }

  renderBrowser(props) {
    const {
      assembly,
      displayRegion,
      refTracks,
      externalTracks,
      tracks,
    } = props;
    log.info(`Render browser: ${assembly} : ${displayRegion}`);

    // const dataTracks = EpiBrowser.processTracks(assembly, entries);

    // if (!dataTracks || dataTracks.length === 0) {
    //   log.info('Empty tracks, skip rendering the browser.');
    //   return;
    // }

    const contents = {
      genomeName: assembly,
      displayRegion,
      trackLegendWidth: 120,
      isShowingNavigator: true,
      tracks: refTracks.concat(externalTracks, tracks),
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

// const mapDispatchToProps = (dispatch) => ({
//   dispatchChangeAssembly: (assembly) =>
//     dispatch(changeGenomeAssembly(assembly)),
// });

EpiBrowser.propTypes = {
  revision: PropTypes.number.isRequired,
  // assembly: PropTypes.string.isRequired,
  // displayRegion: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(EpiBrowser);
