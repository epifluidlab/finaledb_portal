import React from 'react';

class Browser extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: 0,
    }
    this.browserRef = React.createRef();
    this.setNewNumber = this.setNewNumber.bind(this)
  };
  setNewNumber() {
    this.setState({ 
      data: this.state.data + 1,
    })
  }

  renderBrowser = () => {
    const container = this.browserRef.current;
    console.log(this.props.sraId);
    console.log("ga " + this.props.genomeAssembly);

    const tracks = [
        {
          type: 'ruler',
          name: 'Ruler'
        },
        {
          type: 'geneannotation',
          name: 'refGene', // + this.props.genomeAssembly,
          genome: this.props.genomeAssembly,
        }
    ];

    for (const track of this.props.tracks || []) {
      const trackOptions = {};
      if (track.type == 'bigWig') {
        trackOptions.height = 64;
      }
      tracks.push({ name: track.name, type: track.type, url: track.url, options: trackOptions });
    }

    const contents = {
      genomeName: this.props.genomeAssembly,
      displayRegion: 'chr7:27170438-27190461',
      trackLegendWidth: 120,
      isShowingNavigator: true,
      tracks: tracks,
      metadataTerms: ['Sample'],
      regionSets: [],
      regionSetViewIndex: -1
    };
    console.log(contents);
    window.renderBrowserInElement(contents, container);
  }

  componentDidMount() {
    this.renderBrowser();

    // just call this.renderBrowser()
  }

  componentDidUpdate(prevProps) {
    if (this.props.genomeAssembly !== prevProps.genomeAssembly) {
      this.renderBrowser();
    }
  }

  render() {
    return (
      <div id="embed" ref={this.browserRef} ></div>
    );
  }
}

export default Browser;
