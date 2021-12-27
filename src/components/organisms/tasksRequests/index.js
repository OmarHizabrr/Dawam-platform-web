/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from "react";
import moment from 'moment';
import excel from "xlsx";
import {ClusterOutlined,TagsOutlined,CheckCircleOutlined,MinusCircleOutlined,CloseCircleOutlined} from '@ant-design/icons';
import axios from "axios";
import {message} from 'antd';
import { Env } from "../../../styles";
import { SvelteGantt, SvelteGanttTable } from 'svelte-gantt';
import { useCookies, CookiesProvider } from "react-cookie";
import "./style.css";
import {
  DatePicker,
  Space,
  Form,
  Table,
  Button,
  Modal,
  Card,
  Radio,
  Input,
  Select,
  Progress,
  Tag,
  Typography,
} from "antd";
import { ExportOutlined, FormOutlined } from "@ant-design/icons";
const { Text } = Typography;

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;

const exportToExcel = (type, fn, dl) => {
  var elt = document.getElementsByTagName("table")[0];
  if (elt) {
    var wb = excel.utils.table_to_book(elt, { sheet: "sheet1" });
    return dl
      ? excel.write(wb, { bookType: type, bookSST: true, type: "base64" })
      : excel.writeFile(wb, fn || "طلبات الإجازات." + (type || "xlsx"));
  }
};

export default function tasksRequests() {
  const [cookies, setCookie, removeCookie] = useCookies(["userId"]);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [data, setData] = useState([]);
  const [start, setStart] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .slice(0, 10)
  );
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10));
  const [selected, setSelected] = useState(null);
  const [statusType, setStatusType] = useState(null);
  const [accepter, setAccepter] = useState(null);
  const [notes, setNotes] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [startVac,setStartVac]=useState("");
  const [type,setType]=useState(null);
  const [endVac,setEndVac]=useState("");
  const user = cookies.user;
  useEffect(() => {
    axios
      .get(
        Env.HOST_SERVER_NAME +
          "get-tasks-requests/" +
          user.user_id +
          "/" +
          start +
          "/" +
          end
      )
      .then((response) => {
        setData(response.data["tasks"]);
        setAccepter(response.data["type"]);
      });
  });

  const handleChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };
  const processRequest = (selected) => {
    setSelected(selected);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const  onRangeChange=(all,dates)=>{ 
    setStartVac(dates[0]);  
    setEndVac(dates[1]);        
  }
  const handleOk = () => {
    var values = {
      user_id: cookies.user.user_id,
      vid: selected.vid,
      status: statusType,
      note: notes,
      accepter: accepter,
    };

    axios
      .post(Env.HOST_SERVER_NAME + `accept-task`, values)
      .then(function (response) {
        if (response.statusText == "OK") {
          message.success("تم التحديث بنجاح");
        }
      })
      .catch(function (error) {
        console.log("Refused Request : "+error);
      });
    setIsModalVisible(false);
  };
  const changeType = (e) => {
    setStatusType(e);
  };
  const changeNotes = (e) => {
    setNotes(e);
    console.log(e.target.value);
  };
  const columns = [
    {
      title: "الموظف",
      dataIndex: "user",
      key: "user",
      filters: [
        { text: "Joe", value: "Joe" },
        { text: "Jim", value: "Jim" },
      ],
      filteredValue: filteredInfo.user || null,
      onFilter: (value, record) => record.user.includes(value),
      sorter: (a, b) => a.user.length - b.user.length,
      sortOrder: sortedInfo.columnKey === "user" && sortedInfo.order,
      ellipsis: false,
    },
    {
      title: "الإدارة",
      dataIndex: "category",
      key: "category",
      filters: [
        { text: "Joe", value: "Joe" },
        { text: "Jim", value: "Jim" },
      ],
      filteredValue: filteredInfo.category || null,
      onFilter: (value, record) => record.category.includes(value),
      sorter: (a, b) => a.category.length - b.category.length,
      sortOrder: sortedInfo.columnKey === "category" && sortedInfo.order,
      ellipsis: false,
    },
    {
      title: "من",
      dataIndex: "date_from",
      key: "date_from",
      sorter: (a, b) => a.date_from - b.date_from,
      sortOrder: sortedInfo.columnKey === "date_from" && sortedInfo.order,
      ellipsis: false,
    },
    {
      title: "إلى",
      dataIndex: "date_to",
      key: "date_to",
      sorter: (a, b) => a.date_to.length - b.date_to.length,
      sortOrder: sortedInfo.columnKey === "address" && sortedInfo.order,
      ellipsis: false,
    },

    {
      title: "المسؤول المباشر",
      dataIndex: "direct_manager",
      key: "direct_manager",
      filters: [
        { text: "معتمدة", value: "معتمدة" },
        { text: "في الانتظار", value: "في الانتظار" },
        { text: "مرفوضة", value: "مرفوضة" },
      ],
      filteredValue: filteredInfo.direct_manager || null,
      onFilter: (value, record) => record.direct_manager.includes(value),
      sorter: (a, b) => a.direct_manager.length - b.direct_manager.length,
      sortOrder: sortedInfo.columnKey === "direct_manager" && sortedInfo.order,
      ellipsis: false,
      render:(el)=>el=="معتمدة"?<CheckCircleOutlined style={{fontSize:'25x',color:'#007236'}} />:el=="في الانتظار"?<MinusCircleOutlined style={{fontSize:'25px',color:'#FFDD1C'}}/>:<CloseCircleOutlined style={{fontSize:'25px',color:'#f00'}}/>,
    },
    {
      title: "مدير الإدارة",
      dataIndex: "dept_manager",
      key: "dept_manager",
      filters: [
        { text: "معتمدة", value: "معتمدة" },
        { text: "في الانتظار", value: "في الانتظار" },
        { text: "مرفوضة", value: "مرفوضة" },
      ],
      filteredValue: filteredInfo.dept_manager || null,
      onFilter: (value, record) => record.dept_manager.includes(value),
      sorter: (a, b) => a.dept_manager.length - b.dept_manager.length,
      sortOrder: sortedInfo.columnKey === "dept_manager" && sortedInfo.order,
      ellipsis: false,
      render:(el)=>el=="معتمدة"?<CheckCircleOutlined style={{fontSize:'25px',color:'#007236'}} />:el=="في الانتظار"?<MinusCircleOutlined style={{fontSize:'25px',color:'#FFDD1C'}}/>:<CloseCircleOutlined style={{fontSize:'25px',color:'#f00'}}/>,
    },
    {
      title: "الأمين العام",
      dataIndex: "gerenal_sec",
      key: "gerenal_sec",
      className: "gensec",
      filters: [
        { text: "معتمدة", value: "معتمدة" },
        { text: "في الانتظار", value: "في الانتظار" },
        { text: "مرفوضة", value: "مرفوضة" },
      ],
      filteredValue: filteredInfo.gerenal_sec || null,
      onFilter: (value, record) => record.gerenal_sec.includes(value),
      sorter: (a, b) => a.gerenal_sec.length - b.gerenal_sec.length,
      sortOrder: sortedInfo.columnKey === "gerenal_sec" && sortedInfo.order,
      ellipsis: false,
      render:(el)=>el=="معتمدة"?<CheckCircleOutlined style={{fontSize:'25px',color:'#007236'}} />:el=="في الانتظار"?<MinusCircleOutlined style={{fontSize:'25px',color:'#FFDD1C'}}/>:<CloseCircleOutlined style={{fontSize:'25px',color:'#f00'}}/>,
    },
    {
      title: "شؤون الموظفين",
      dataIndex: "hr_manager",
      key: "hr_manager",
      filters: [
        { text: "معتمدة", value: "معتمدة" },
        { text: "في الانتظار", value: "في الانتظار" },
        { text: "مرفوضة", value: "مرفوضة" },
      ],
      filteredValue: filteredInfo.hr_manager || null,
      onFilter: (value, record) => record.hr_manager.includes(value),
      sorter: (a, b) => a.hr_manager.length - b.hr_manager.length,
      sortOrder: sortedInfo.columnKey === "hr_manager" && sortedInfo.order,
      ellipsis: false,
      render:(el)=>el=="معتمدة"?<CheckCircleOutlined style={{fontSize:'25px',color:'#007236'}} />:el=="في الانتظار"?<MinusCircleOutlined style={{fontSize:'25px',color:'#FFDD1C'}}/>:<CloseCircleOutlined style={{fontSize:'25px',color:'#f00'}}/>,
    },
    {
      title: "مراجعة الطلب",
      dataIndex: "vid",
      key: "vid",
      render: (vid, record, index) => (
        <Button
          onClick={function () {
            processRequest(record);
          }}
          style={{ backgroundColor: "#007236", borderColor: "#007236" }}
          type="primary"
          shape="round"
          icon={<FormOutlined />}
        ></Button>
      ),
    },
  ];

  return (
    <Card>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row" }}>
          <span>
            <Progress
              type="circle"
              percent={12}
              width={80}
              style={{ marginLeft: "5px", display: "inline-block" }}
            />
          </span>
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              paddingTop: "10px",
              marginRight: "5px",
            }}
          >
            <div style={{ marginBottom: "5px" }}>الطلبات المنجزة</div>
            <div style={{ color: "#828282" }}> لقد أنجزت 12 طلباً</div>
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <span>
            <Progress
              type="circle"
              percent={30}
              width={80}
              style={{ marginLeft: "5px", display: "inline-block" }}
            />
          </span>
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              paddingTop: "10px",
              marginRight: "5px",
            }}
          >
            <div style={{ marginBottom: "5px" }}>طلبات تحت الانتظار</div>
            <div style={{ color: "#828282" }}> 30 طلباً في انتظارك</div>
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <span>
            <Progress
              type="circle"
              percent={100}
              width={80}
              style={{ marginLeft: "5px", display: "inline-block" }}
            />
          </span>
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              paddingTop: "10px",
              marginRight: "5px",
            }}
          >
            <div style={{ marginBottom: "5px" }}>سرعة الإنجاز</div>
            <div style={{ color: "#828282" }}>
              {" "}
              غالباً يتم الإنجاز خلال 5 أيام
            </div>
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Button
            style={{ float: "left", marginBottom: "30px" }}
            onClick={function () {
              exportToExcel("xlsx");
            }}
            type="primary"
          >
            <ExportOutlined /> تصدير كملف اكسل
          </Button>
        </div>
      </div>
      <Modal
        title="مراجعة الطلبات"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <div style={{ marginBottom: "20px" }}>
          {" "}
          مقدم الطلب : {" "}
          <span style={{ fontWeight: "900", fontFamily: "jannatR" }}>
            {" "}
            {selected ? selected.user : ""}{" "}
          </span>{" "}
          <div className="taggedInfo" style={{fontFamily: 'jannatR'}}><Text><ClusterOutlined /> {selected ? selected.category : ""} , {selected ? selected.job : ""} </Text></div>
          <div className="taggedInfo"> نوع الطلب : <Text  style={{fontFamily: 'jannatR'}}>{selected ? selected.vactype : ""}</Text></div>
          <div className="taggedInfo"> الإجمالي : <Text  style={{fontFamily: 'jannatR'}}>
          {selected && selected.days > 0 ? selected.days + " يوم " : ""}
          {selected && selected.period != 0 ? selected.period : ""}
          </Text></div>
          <div className="taggedInfo" style={{fontFamily: 'jannatR'}}><Text>الفترة :   </Text></div>
          <RangePicker
            showTime={{ format: "HH:mm" }}
            defaultValue={[moment(selected ? selected.date_from : "", "YYYY-MM-DD HH:mm"), moment(selected ? selected.date_to : "", "YYYY-MM-DD HH:mm")]}
            format="YYYY-MM-DD HH:mm"
          onChange= {onRangeChange}
          />
        </div>
        <div>
          <Select
            showSearch
            style={{ width: 200, marginBottom: "20px" }}
            placeholder="قم بتعيين حالة الطلب"
            optionFilterProp="children"
            onSelect={changeType}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children
                .toLowerCase()
                .localeCompare(optionB.children.toLowerCase())
            }
          >
            <Option value="1">اعتماد</Option>
            <Option value="0">رفض</Option>
          </Select>
          <div id="gantt">

          </div>
          <TextArea
            onChange={changeNotes}
            placeholder="ملاحظات"
            row={3}
          ></TextArea>
        </div>
      </Modal>
      <Table columns={columns} dataSource={data} onChange={handleChange} />
    </Card>
  );
}
