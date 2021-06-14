import React from 'react';
import GeneralTable from '../../organisms/generalTable';
import { Typography, Row,Col, Card } from 'antd';
import Layout from 'antd/lib/layout/layout';
import ReactApexChart from "react-apexcharts";
const { Text } = Typography;

export default class Statistics extends React.Component{
    constructor(props){
        super(props);
        this.state = {
           config : {
            options: {
              chart: {
                width:500,
                dropShadow: {
                  enabled: true,
                  blur: 1,
                  left: 1,
                  top: 1
                }
              },dataLabels: {
                enabled: true,
                background: {
                  enabled: true,
                  borderRadius:2,
                }
              },xaxis: {
                categories: ['الحضور المبكر', 'الانضباط', 'الانصراف', 'نسبة أيام الحضور', 'احترام النظام','iuwye','wioewey','ieuryiuwey','qwioewuy'],
                labels: {
                  show: true,
                  style: {
                    colors: ["#808080"],
                    fontSize: "11px",
                    fontFamily: 'jannatR'
                  }
                }
              },
              yaxis: {
                min:0,
                max:100,
                tickAmount:5,
              },
              colors: ["#007236", "#002612"],
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
                name: "أسامة جليل",
                data: [
                  45,
                  90,
                 60,
                  80,
                  70,
                  56,
                  99,
                  30,
                  65
                ],
              },
            ]
          },   
            seriesp: [44, 55, 13, 43, 22],
            optionsp: {
                title:{
                 text:'توزيع الموظفين على الإدارات',
                 align:'center',
                 style:{
                     fontFamily:'jannatR',
                 }
                },
              chart: {
                width: 380,
                type: 'pie',
              },
              labels: ['الإحصاء وتقنية المعلومات', 'الاجتماعية', 'العلاقات والإعلام', 'العلمية والتحفيظ', 'الشؤون الإدارية'],
              responsive: [{
                breakpoint: 480,
                options: {
                  chart: {
                    width: 200
                  },
                  legend: {
                    position: 'bottom'
                  }
                }
              }]
            },

            series: [{
              data: [21, 22, 10, 28, 16]
            }],
            options: {
              chart: {
                type: 'bar',
                events: {
                  click: function(chart, w, e) {
                    // console.log(chart, w, e)
                  }
                }
              },
           
              plotOptions: {
                bar: {
                  columnWidth: '30%',
                  distributed: true,
                }
              },
              dataLabels: {
                enabled: false
              },
              legend: {
                show: false
              },
              xaxis: {
                categories: [
                  'إعدادي',
                  'ثانوي',
                  'بكالاريوس',
                  'ماجستير',
                  'دكتوراه', 
                ],
                labels: {
                  style: {
                 
                    fontSize: '12px'
                  }
                }
              }
            },
          
          
          };
        
    }
componentDidMount(){

}
    render(){
        return(
        <Layout style={{padding:'2.75rem 2.25rem'}}>
        <Row style={{margin:'0 0 1.5rem'}}>
        <Col span={24}>
        <Text style={{fontSize:'18px'}}>لوحة البيانات</Text>
        </Col>          
        </Row>
        <Row style={{marginTop:'10px'}}>
          <Col span={6} style={{padding:'20px',color:'#fff',fontSize:'16px'}}>
              <div style={{padding:'10px 20px',borderRadius:'10px',background: "linear-gradient(-90deg,#ffbf96,#fe7096)"}}>
                  <div style={{marginBottom:'10px'}}>عدد الموظفين</div>
                  <div style={{fontSize:'22px'}}>49 موظفاً</div>
                  <div style={{fontSize:'12px',marginTop:'10px'}}>آخر توظيف منذ 2021-05-03</div>
              </div>
          </Col>
          <Col span={6} style={{padding:'20px',color:'#fff',fontSize:'16px'}}>
              <div style={{padding:'10px 20px',borderRadius:'10px',background: "linear-gradient(-90deg,#90caf9,#047edf 99%)"}}>
                  <div style={{marginBottom:'10px'}}>عدد الإدارات</div>
                  <div style={{fontSize:'22px'}}>9 إدارات</div>
                  <div style={{fontSize:'12px',marginTop:'10px'}}>متوسط الموظفين لكل إدارة 5</div>
              </div>
          </Col>
          <Col span={6} style={{padding:'20px',color:'#fff',fontSize:'16px'}}>
              <div style={{padding:'10px 20px',borderRadius:'10px',background: "linear-gradient(-90deg,#84d9d2,#07cdae)"}}>
                  <div style={{marginBottom:'10px'}}>متوسط الأعمار</div>
                  <div style={{fontSize:'22px'}}>45 عاماً</div>
                  <div style={{fontSize:'12px',marginTop:'10px'}}>خلدون السامعي أصغر الموظفين عمراً</div>
              </div>
          </Col>
          <Col span={6} style={{padding:'20px',color:'#fff',fontSize:'16px'}}>
              <div style={{padding:'10px 20px',borderRadius:'10px',background: "linear-gradient(-90deg,#E2B0FF,#9F44D3)"}}>
                  <div style={{marginBottom:'10px'}}>عدد الموظفين المتواجدين</div>
                  <div style={{fontSize:'22px'}}>30 موظفاً</div>
                  <div style={{fontSize:'12px',marginTop:'10px'}}>نسبة حضور الموظفين اليوم 70%</div>
              </div>
          </Col>
       </Row>
       <Row>
           <Col span={13}>
           <Card>
               <ReactApexChart options={this.state.options} series={this.state.series} type="bar" height={300}  />
            </Card>
           </Col>
           <Col span={1}></Col>
           <Col span={10}>
         <Card>
           <ReactApexChart options={this.state.optionsp} series={this.state.seriesp} type="pie"  height={300} />
           </Card>
           </Col>
       </Row>
       <Row style={{marginTop:'20px'}}>
        <Col span={10} style={{backgroundColor:'#fff'}}>
        <ReactApexChart
         options={this.state.config.options}
         series={this.state.config.series}
         type="radar"
         height="300"
         width="350"
        style={{padding:0}}
    />
        </Col>
        <Col span={1}></Col>
        <Col span={13}>
          <Text>ekjeij</Text>
        </Col>
        </Row>
        </Layout>
        );
    };
}

