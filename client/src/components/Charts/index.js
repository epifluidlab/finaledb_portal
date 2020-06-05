import React from 'react'
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

class Charts extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        chartOptions: {
          chart: {
            type: 'areaspline'
          },
          title: {
            text: 'Fragment size distribution'
          },
          yAxis: {
            title: {
                text: 'Count'
            }
          },
          plotOptions: {
            areaspline: {
              marker: {
                enabled: false,
              }
            }
          },
          series: []
        }
    };
  }

  async fetchChartData() {
    const component = this;

    // Parse the raw data (fragment size) and return data points
    // Return: [[12, 24], [13, 27], ... ]
    function parseRawData(rawData) {
      return rawData.trim().split('\n').slice(11).map(v => {
        const m = /(\d+)(\s+)(\d+)/.exec(v);
        return [m[1], m[3]].map(v => parseInt(v));
      });
    }

    // Fetch data for a single entry
    async function singleFetch(name, url) {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}, url: ${url}`);

      const rawData = await response.text();
      const data = parseRawData(rawData);

      const chartOptions = component.state.chartOptions;
      chartOptions.series.push({ name, data });
      component.setState({ chartOptions });
    }

    (this.props.fragmentSize || []).map(v => singleFetch(v.name, v.dataUrl));
  }


  componentDidMount() {
    this.fetchChartData();
  }


  render() {
    const options = this.state.chartOptions;

    if (options)
      return (
        <div>
          <HighchartsReact highcharts={Highcharts} options={options} updateArgs={[true, true, true]} />
        </div>);
    else
      return null;
  }
}

export default Charts;