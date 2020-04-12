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

    const contents = {
      genomeName: this.props.genomeAssembly,
      displayRegion: 'chr7:27053397-27373765',
      trackLegendWidth: 120,
      isShowingNavigator: true,
      tracks: [
        {
          type: 'geneannotation',
          name: 'refGene' + this.props.genomeAssembly,
          genome: 'hg38', // this.props.genomeAssembly,
        },
        // {
        //   type: 'geneannotation',
        //   name: 'gencodeM19Basic',
        //   genome: 'hg38'
        // },
        {
          type: 'ruler',
          name: 'Ruler'
        },
        {
          type: 'bam',
          name:  this.props.sraId, //'psc file',
          url: this.props.bamFile,
          options: { color: 'red' },
          metadata: { Sample: 'Heart' }
        },
      ],
      metadataTerms: ['Sample'],
      regionSets: [],
      regionSetViewIndex: -1
    };
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
