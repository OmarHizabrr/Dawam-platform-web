/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import excel from 'xlsx';
import './style.css';
import { Typography ,Layout,Tabs,Table, Button,Progress, DatePicker, Select,Card,Image} from 'antd';
import {SwapOutlined,FormOutlined,ExportOutlined} from '@ant-design/icons';
import axios from 'axios';
import { useCookies,CookiesProvider  } from 'react-cookie';
import {Env} from './../../../styles';


export default function detailedAttendance(){
  
return (
    <div style={{direction: "rtl",fontSize: "12px",fontFamily: "BoutrosMBC",margin: "0"}}>
    <header style={{display: "flex",flexDirection: "row",borderBottom: "1px solid black"}}>
       <div style={{width: "30%"}}>
           <Image style={{width: "320px"}} src="logo-text.png"/>
       </div>
       <div style={{fontSize: "11px",textAlign: "center",width: "40%",display: "flex",flexDirection: "column",justifyContent: "end",paddingBottom: "10px"}}>
           <h1 style={{fontSize: " 18px",marginBottom: " 5px"}}>السجل التفصيلي للموظف</h1>
           <h2 style={{fontSize: " 14px",fontWeight: " 200"}}>للفترة من 2021-08-23 إلى 2021-09-22</h2>
       </div>
       <div style={{width: "30%"}}></div>
    </header> 
    <div  >
         <div style={{width: " 30%"}}>الاسم:  خلدون أحمد محمد</div>
         <div style={{width: " 20%"}}> الرقم الوظيفي:  38 </div>
         <div style={{width: " 20%"}}>الوظيفة:  مدير</div>
         <div style={{width: " 30%"}}>الإدارة:  الإحصاء وتقنية المعلومات</div>
    </div>
    <div >
        <table style={{width: " 100%",textAlign: " center",marginTop: " 20px"}}>
            <thead>
                <tr>
                    <th>اليوم</th>
                    <th>التاريح</th>
                    <th>زمن الحضور</th>
                    <th>زمن الانصراف</th>
                    <th>ساعات العمل</th>
                    <th>التأخرات</th>
                    <th>الإجازات</th>
                    <th>نوع الإجازة</th>
                    <th>الوقت الفائض</th>
                    <th>مبلغ الخصم</th>
                    <th style={{width: " 300px"}}>ملاحظات</th>
                </tr>
            </thead>
            <tbody>
             <tr style={{height: " 25px"}}>
                 <td>الخميس</td>
                 <td>2021-08-26</td>
                 <td>07:30:12 AM</td>
                 <td>01:30:12 PM</td>
                 <td>07:00</td>
                 <td>01:34</td>
                 <td>02:40</td>
                 <td>مهمة عمل ، دراسية، سنوية</td>
                 <td>04:00</td>
                 <td>{document.write(new Intl.NumberFormat('en-IN').format(10000)+" ر.ي ")}</td>
                 <td>ملاحظات</td>
             </tr>
            </tbody>
        </table>
    </div>
    <div style={{display: "flex",flexDirection: "row",marginTop: "20px"}}>
        <table style={{width: "50%",textAlign: "center",paddingLeft: "20px"}}>
            <caption>خلاصة الإجازات</caption>
            <thead>
                <tr>
                 <th>نوع الإجازة</th>
                 <th>سنوية</th>
                 <th>دراسية</th>
                 <th>مرضية</th>
                 <th>طارئة</th>
                 <th>مهمة عمل</th>
                 <th>إعفاء</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                 <td style={{backgroundColor: " #007236",color: "#fff"}}>الممنوحة</td>
                 <td>22:10</td>
                 <td>17:30</td>
                 <td rowspan="2">0</td>
                 <td rowspan="2">01:20</td>
                 <td rowspan="2">74:50</td>
                 <td rowspan="2">14:23</td>   
                </tr>
                <tr>
                 <td style={{backgroundColor: "#007236",color: "#fff"}}>المتبقية</td>
                 <td>22:10</td>
                 <td>17:30</td>   
                </tr>
            </tbody>
        </table>
        <table style={{width: "50%",textAlign: "center",paddingRight: "20px"}}>
         <caption>خلاصة الخصميات</caption>
         <thead>
             <tr>
              <th>نوع الخصم</th>
              <th>الاسنحقاق</th>            
              <th>غياب</th>
              <th>تأخرات</th>
              <th>سلفة</th>
              <th>أقساط</th>
              <th>الإجمالي</th>
              <th>صافي الراتب</th>
             </tr>
         </thead>
         <tbody>
             <tr style={{height: "20px"}}>
                 <td style={{backgroundColor: "#007236",color: "#fff"}}>المبلغ</td>
                 <td>{document.write(new Intl.NumberFormat('en-IN').format(128000)+" ر.ي ")}</td>
                 <td>{document.write(new Intl.NumberFormat('en-IN').format(16250)+" ر.ي ")}</td>
                 <td>{document.write(new Intl.NumberFormat('en-IN').format(5630)+" ر.ي ")}</td>
                 <td>{document.write(new Intl.NumberFormat('en-IN').format(60000)+" ر.ي ")}</td>
                 <td>{document.write(new Intl.NumberFormat('en-IN').format(0)+" ر.ي ")}</td>
                 <td>{document.write(new Intl.NumberFormat('en-IN').format(30500)+" ر.ي ")}</td>
                 <td>{document.write(new Intl.NumberFormat('en-IN').format(113500)+" ر.ي ")}</td>
                </tr>
         </tbody>
     </table>
    </div>
    <div style={{display: "flex",flexDirection: "row",marginTop: "20px",textAlign: "center"}}>
       <div style={{width: "50%",fontWeight: "900"}}>المختص</div>
       <div style={{width: "50%",fontWeight: "900"}}>مدير الشؤون</div>
     </div>  
     <div style={{marginTop: " 20px",width: "85%",backgroundColor: "#e6e6e61",padding: "5px 0",borderTopLeftRadius: " 5px",borderBottomLeftRadius: " 5px"}}>
         <div style={{backgroundColor: " #007236",width: " 95%",height: " 15px",borderTopLeftRadius: " 5px",borderBottomLeftRadius: " 5px",color: " #fff",paddingRight: " 20px"}}>نظام دوام | 2021-08-09 12: "24: "24 </div>
     </div>
 </div> 

);
    
 }
