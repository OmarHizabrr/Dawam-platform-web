import React from 'react';
import ReactApexChart from "react-apexcharts";

const SpiderChart = ({ data }) => {
    // Default data structure if empty
    const seriesData = data && data.length === 5 ? data : [0, 0, 0, 0, 0];

    const config = {
        options: {
            chart: {
                dropShadow: {
                    enabled: true,
                    blur: 1,
                    left: 1,
                    top: 1
                },
                toolbar: {
                    show: false
                }
            },
            dataLabels: {
                enabled: true,
                background: {
                    enabled: true,
                    borderRadius: 2,
                }
            },
            xaxis: {
                // Categories matching the old codebase labels
                categories: ['الحضور المبكر', 'الانضباط', 'الانصراف', 'نسبة أيام الحضور', 'احترام النظام'],
                labels: {
                    show: true,
                    style: {
                        colors: ["#808080"],
                        fontSize: "11px",
                        fontFamily: 'Tajawal'
                    }
                }
            },
            yaxis: {
                min: 0,
                max: 100,
                tickAmount: 5,
                show: false
            },
            colors: ["#0972B6", "#002612"],
            stroke: {
                width: 1
            },
            fill: {
                opacity: 0.5
            },
            markers: {
                size: 5
            }
        },
        series: [
            {
                name: "النسبة",
                data: seriesData,
            },
        ],
    };

    return (
        <ReactApexChart
            options={config.options}
            series={config.series}
            type="radar"
            height="300"
            width="350"
        />
    );
};

export default SpiderChart;
