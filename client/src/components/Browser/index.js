import React from 'react';

class Browser extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: 0
    }
    this.browserRef = React.createRef();
    this.setNewNumber = this.setNewNumber.bind(this)
  };
  setNewNumber() {
    this.setState({ data: this.state.data + 1 })
  }

  componentDidMount() {
    const container = this.browserRef.current;
    const contents = {
      genomeName: 'mm10',
      displayRegion: 'chr5:51997494-52853744',
      trackLegendWidth: 120,
      isShowingNavigator: true,
      tracks: [
        {
          type: 'geneannotation',
          name: 'refGene',
          genome: 'mm10'
        },
        {
          type: 'geneannotation',
          name: 'gencodeM19Basic',
          genome: 'mm10'
        },
        {
          type: 'ruler',
          name: 'Ruler'
        },
        {
          type: 'bigWig',
          name: 'ChipSeq of Heart',
          url: 'https://www.encodeproject.org/files/ENCFF641FBI/@@download/ENCFF641FBI.bigWig',
          options: { color: 'red' },
          metadata: { Sample: 'Heart' }
        },
        {
          type: 'bigWig',
          name: 'ChipSeq of Liver',
          url: 'https://www.encodeproject.org/files/ENCFF555LBI/@@download/ENCFF555LBI.bigWig',
          options: { color: 'blue' },
          metadata: { Sample: 'Liver' }
        }
      ],
      metadataTerms: ['Sample'],
      regionSets: [],
      regionSetViewIndex: -1
    };
    window.renderBrowserInElement(contents, container);

  }

  render() {
    return (
      <div id="embed" ref={this.browserRef} style={{ width: '1000px' }}></div>
    );
  }
}

export default Browser;
