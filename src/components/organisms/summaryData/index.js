import React from 'react';
import './style.css';
import {Typography,Row,Col,Avatar,Button,Card, Space, Form,Input} from 'antd';
import ReactApexChart from "react-apexcharts";
const {Text} = Typography;
const config = {
  options: {
    chart: {
      width: 380,
      type: "pie"
    },
    labels: ["سُلف", "أقساط", "تأخرات", "غيابات","صافي الراتب"],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: "bottom"
          }
        }
      }
    ],
  series: [ 7000, 8000, 10000, 5000,70000],
  }
};

const config2={
  series: [{
    name: 'وقت الحضور',
    data: ['07:00', '8:30', '7:35', '7:20', '7:15', '7:30', '7:27']
  }, {
    name: 'وقت الانصراف',
    data: ['13:50', '14:00', '13:55', '13:30', '12:30', '14:30', '15:00']
  }],
  options: {
    chart: {
      height: 350,
      type: 'area'
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show:true,
      curve: 'smooth',
      width:2,
    },
    xaxis: {
      type: 'datetime',
      categories: ["2018-09-19", "2018-09-20", "2018-09-21", "2018-09-22", "2018-09-23", "2018-09-24", "2018-09-25"]
    },
    yaxis:{
      type:'datetime',
    },
    tooltip: {
      style:{
        fontFamily:'jannatR',
        marginLeft:'5px',
      },
      x: {
        show:true,
        format: 'dd-MM-yyyy'
      },
      y:{
        show:true,
        format:'HH:mm',
      }
    },
  },
}
export default class summaryData extends React.Component{
  
    render(){
        return(
    <Row className="summary" style={{paddingBottom:'10px'}}>
    <Col lg={10} sm={24}>
    <Card>
    <ReactApexChart
      options={config.options}
      series={config.options.series}
      type="pie"
      height="400"
      width="400"
      style={{padding:0}}
    />
    <div style={{textAlign:'center',paddingBottom:'20px'}}>
    <Text>ملخص إعانة شهر فبراير</Text>
    </div>
    </Card>
    </Col>
    <Col lg={14} sm={24}>
    <Card>
    <ReactApexChart
      options={config2.options}
      series={config2.series}
      type="area"
      height="250"
      style={{padding:0}}
    />
     <div style={{textAlign:'center',}}>
    <Text>حركة الحضور والانصراف لآخر 30 يوماً</Text>
    </div>
    </Card>
    </Col>   
     </Row>
     );
    }
}