import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import PropTypes from 'prop-types';

const Charts = (props) => {
  const { series } = props;
  const chartOptions = {
    chart: {
      type: 'spline',
    },
    title: {
      text: 'Fragment size distribution',
    },
    yAxis: {
      title: {
        text: 'Count',
      },
    },
    plotOptions: {
      areaspline: {
        marker: {
          enabled: false,
        },
      },
    },
    series: series.map((val) => ({
      name: val.name,
      color: val.color,
      data: val.dataPts,
    })),
  };

  if ((chartOptions.series || []).length > 0) {
    return (
      <div>
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
          updateArgs={[true, true, true]}
        />
      </div>
    );
  }
  return null;
};

Charts.propTypes = {
  series: PropTypes.arrayOf(
    PropTypes.shape({
      dataPts: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
      dataUrl: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default Charts;
