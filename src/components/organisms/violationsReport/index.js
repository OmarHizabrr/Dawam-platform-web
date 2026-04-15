/* eslint-disable react-hooks/rules-of-hooks */
import { ExportOutlined, PrinterOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Select,
  Table,
  Typography,
  notification,
} from "antd";
// import axios from "axios";
import { FirebaseServices } from "../../../firebase/FirebaseServices";
import React, { useEffect, useState } from "react";
import excel from "xlsx";
import { Env, PrintFonts } from "./../../../styles";
import "./style.css";
const { Text } = Typography;

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;

export default function ViolationsReport(props) {
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(true);

  const [isTextInput, setIsTextInput] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [amountValue, setAmountValue] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tasksTypes, setTasksTypes] = useState([]);
  const [empNames, setEmpNames] = useState([]);
  const [selectedName, setSelectedName] = useState(null);
  const [start, setStart] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .slice(0, 10)
  );
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10));

  const getVacDuration = (user_id, vac_name) => {
    for (var i = 0; i < data.length; i++)
      if (data[i].user_id == user_id && data[i].vio_name == vac_name)
        return data[i].vio_count;
    return 0;
  };
  const getOrganizedVacations = () => {
    if (data.length > 0 && empNames.length > 0 && tasksTypes.length > 0) {
      var vacData = "[";
      empNames.map((user, index) => {
        vacData +=
          "{" +
          '"empName":"' +
          user.label +
          '","user_id":"' +
          user.value +
          '",';
        var vacDetails = "";
        tasksTypes.map((task) => {
          vacDetails +=
            '"' +
            task.label +
            '":"' +
            getVacDuration(user.value, task.label) +
            '",';
        });
        vacData += vacDetails.substring(0, vacDetails.length - 1);
        vacData += "},";
      });

      return JSON.parse(vacData.substring(0, vacData.length - 1) + "]");
    } else return [];
  };

  const getColumnsVac = () => {
    if (tasksTypes.length > 0) {
      const ncolumns = [
        {
          title: "اسم الموظف",
          dataIndex: "empName",
          key: "empName",
          sorter: (a, b) => a.empName.length - b.empName.length,
          sortOrder: sortedInfo.columnKey === "empName" && sortedInfo.order,
          ellipsis: false,
        },
        {
          title: "الرقم الوظيفي",
          dataIndex: "user_id",
          key: "user_id",
          ellipsis: true,
        },
      ];
      var col = "[";
      tasksTypes.map((task) => {
        col +=
          '{"title":"' +
          task.label +
          '","dataIndex":"' +
          task.label +
          '","key":"' +
          task.label +
          '"},';
      });
      var nc = JSON.parse(col.substring(0, col.length - 1) + "]");
      nc.map((col) => {
        ncolumns.push(col);
      });
      return ncolumns;
    } else return [];
  };

  useEffect(() => {
    FirebaseServices.getEmpNames()
      .then((data) => {
        setEmpNames(data);
      })
      .catch(function (error) {
        console.log(error);
      });

    FirebaseServices.getViolationsTypes()
      .then((data) => {
        setTasksTypes(data);
      })
      .catch(function (error) {
        console.log(error);
      });
    setLoad(true);
    if (end != "")
      FirebaseServices.getCumViolations(start, end)
        .then((data) => {
          setData(data);
          setLoad(false);
        })
        .catch(function (error) {
          console.log(error);
        });
  }, [start, end]);

  // console.log(getColumnsVac());

  const handleChange = (pagination, filters, sorter) => {
    console.log("Various parameters", pagination, filters, sorter);
    setSortedInfo(sorter);
  };
  const printReport = () => {
    var report = document.getElementById("att-report");
    //var report=document.body;
    var mywindow = window.open("");
    mywindow.document.write(
      "<html><head><title></title> <style>" +
        PrintFonts.getPrintFontsCSS() +
        "body{font-size:12px;margin:0} " +
        "</style>"
    );
    mywindow.document.write('</head><body dir="rtl" style="font-size:12px;" >');
    mywindow.document.write(report.innerHTML);
    mywindow.document.write("</body></html>");

    mywindow.document.close();
    mywindow.focus();

    mywindow.print();
    mywindow.close();
    /* var printContents = document.getElementById("att-report").innerHTML;
        var originalContents = document.body.innerHTML;
    
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;*/
  };
  const exportToExcel = (type, fn, dl) => {
    var elt = document.getElementsByClassName("print-table")[0];
    if (elt) {
      var wb = excel.utils.table_to_book(elt, { sheet: "sheet1" });
      return dl
        ? excel.write(wb, { bookType: type, bookSST: true, type: "base64" })
        : excel.writeFile(
            wb,
            fn || "كشف إ دوام ليوم " + "." + (type || "xlsx")
          );
    }
  };
  const openNotification = (placement, user_name) => {
    notification.success({
      message: (
        <span>
          {" "}
          'تم إضافة الإجازات/المهام الخاصة بـ '{" "}
          <span style={{ fontWeight: "bold" }}>{user_name} </span> ' بنجاح.'{" "}
        </span>
      ),
      placement,
      duration: 10,
    });
  };
  const addTasks = () => {
    setIsModalVisible(true);
  };
  const deleteDebt = (record) => {
    FirebaseServices.deleteTask(record.id, record.user_id)
      .then((response) => {
        notification.success({ 
          message: 'تم حذف المهمة/الإجازة بنجاح',
          placement: 'bottomLeft' 
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const [form] = Form.useForm();

  const onFinish = (values) => {
    setSaving(true);
    FirebaseServices.addAcceptedTasks(values)
      .then((response) => {
        setSaving(false);
        openNotification("bottomLeft", selectedName);
      })
      .catch(function (error) {
        alert("يوجد مشكلة في الاتصال بالسرفر!");
      });
  };

  const handleFormChange = (selected, options) => {
    setSelectedName(options.label);
    form.setFieldsValue({ tasks: [] });
  };
  const changeRange = (all, date) => {
    setStart(date[0]);
    setEnd(date[1]);
  };
  var index = 1;
  return (
    <Card>
      <div style={{ marginBottom: "10px" }}>
        <div className="discountHeader" style={{ marginBottom: "10px" }}>
          <div className="discountRange" style={{ marginBottom: "10px" }}>
            <span>اختر فترة : </span>
            <RangePicker
              needConfirm={true}
              inputReadOnly={window.innerWidth <= 760}
              onChange={changeRange}
            />
          </div>
          <div className="discountBtn">
            <Button
              style={{ margin: "0 10px" }}
              onClick={function () {
                exportToExcel("xlsx");
              }}
              type="primary"
            >
              <ExportOutlined />
            </Button>
            <Button
              style={{
                backgroundColor: "#0972B6",
                borderColor: "#0972B6",
              }}
              onClick={function () {
                printReport();
              }}
              type="primary"
            >
              <PrinterOutlined />
            </Button>
          </div>
        </div>
      </div>
      <Table
        loading={load}
        columns={getColumnsVac()}
        scroll={{ x: "1000px" }}
        dataSource={getOrganizedVacations()}
        onChange={function () {
          handleChange();
        }}
      />
      <div id="att-report" style={{ display: "none" }}>
        <div
          style={{
            direction: "rtl",
            fontSize: "12px",
            fontFamily: "Tajawal, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
            margin: "0",
          }}
        >
          <header
            style={{
              display: "flex",
              flexDirection: "row",
              borderColor: "#000",
              borderBottomStyle: "solid",
              borderBottomWidth: "1px",
            }}
          >
            <div style={{ width: "20%" }}>
              <img
                loading="eager"
                style={{ width: "250px" }}
                src={
                  Env.HOST_SERVER_STORAGE +
                  props.setting.filter((item) => item.key == "admin.logo")[0]
                    ?.value
                }
              />
            </div>
            <div
              style={{
                fontSize: "11px",
                textAlign: "center",
                width: "60%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "end",
                paddingBottom: "10px",
              }}
            >
              <h1
                style={{
                  fontSize: " 18px",
                  fontWeight: 700,
                  marginBottom: " 5px",
                  margin: "0",
                }}
              >
                كشف المخالفات والإنذارات
              </h1>
              <h2
                style={{ fontSize: " 14px", fontWeight: " 200", margin: "0" }}
              >
                للفترة من {start} إلى {end}
              </h2>
            </div>
            <div style={{ width: "20%" }}></div>
          </header>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              textAlign: "center",
              fontSize: "14px",
              borderBottom: "1px solid black",
            }}
          ></div>
          <div>
            <table
              style={{
                fontSize: "12px",
                width: " 100%",
                textAlign: " center",
                marginTop: " 20px",
              }}
            >
              <thead>
                <tr
                  style={{
                    color: "#fff",
                    backgroundColor: "#0972B6",
                    height: "25px",
                  }}
                >
                  <th style={{ fontWeight: "100" }} rowSpan="2">
                    م
                  </th>
                  {getColumnsVac().map((item) => (
                    <th style={{ fontWeight: "100" }}>{item.title}</th>
                  ))}
                  <th style={{ fontWeight: "100" }} rowSpan="2">
                    ملاحظات
                  </th>
                </tr>
              </thead>
              <tbody>
                {getOrganizedVacations().map((item) => (
                  <tr
                    style={{
                      height: " 25px",
                      backgroundColor: index % 2 == 0 ? "#e6e6e6" : "#fff",
                    }}
                  >
                    <td>{index++}</td>
                    <td>{item.empName}</td>
                    <td>{item.user_id}</td>
                    {tasksTypes.map((task) => (
                      <td>{item[task.label]}</td>
                    ))}
                    <td>
                      <pre> </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: "20px",
              textAlign: "center",
            }}
          >
            {props.setting
              .filter((item) => item.key == "admin.signs_footer")[0]
              ?.value.split("\n")
              .map((sign) => {
                var sign_position = sign.split(":")[0];
                var sign_name = sign.split(":")[1];

                return (
                  <div style={{ width: "50%" }}>
                    <div style={{ fontWeight: "900" }}>{sign_position}</div>
                    {sign_name != "" && (
                      <div style={{ fontWeight: "500" }}>{sign_name}</div>
                    )}
                  </div>
                );
              })}
          </div>
          <div
            style={{
              marginTop: " 20px",
              width: "85%",
              backgroundColor: "#e6e6e61",
              padding: "5px 0",
              borderTopLeftRadius: " 5px",
              borderBottomLeftRadius: " 5px",
            }}
          >
            <div
              style={{
                backgroundColor: " #0972B6",
                width: " 95%",
                height: " 15px",
                borderTopLeftRadius: " 5px",
                borderBottomLeftRadius: " 5px",
                color: " #fff",
                paddingRight: " 20px",
              }}
            >
              نظام دوام | {new Date().toLocaleString("en-IT")}{" "}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
