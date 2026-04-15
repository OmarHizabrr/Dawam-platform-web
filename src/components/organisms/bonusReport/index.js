/* eslint-disable react-hooks/rules-of-hooks */
import { ExportOutlined, PrinterOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Select,
  Table,
  Typography,
  notification,
} from "antd";
import { FirebaseServices } from "../../../firebase/FirebaseServices";
// import axios from "axios";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import excel from "xlsx";
import { Env, PrintFonts } from "../../../styles";
import "./style.css";

const { Text } = Typography;

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;

export default function bonusReport(props) {
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(true);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dedTypes, setDedTypes] = useState([]);
  const [empNames, setEmpNames] = useState([]);
  const [selectedName, setSelectedName] = useState(null);
  const [start, setStart] = useState(
    dayjs(
      dayjs().format("YYYY-MM") +
        "-" +
        props.setting.filter((item) => item.key == "admin.month_start")[0]
          ?.value,
      "YYYY-MM-DD"
    )
      .subtract(1, "months")
      .format("YYYY-MM-DD")
  );
  const [end, setEnd] = useState(dayjs().format("YYYY-MM-DD"));
  const [currentMonth, setCurrentMonth] = useState(dayjs().format("MMMM"));
  const [categories, setCategories] = useState([]);
  const [pdata, setPData] = useState([]);

  const [namesFilter, setNamesFilter] = useState([]);
  const [categoriesFilter, setCategoriesFilter] = useState([]);
  const [names, setNames] = useState([]);

  const normalizeText = (value) =>
    (value ?? "").toString().trim().toLowerCase();
  const matchesFilterValue = (recordValue, filterValue) =>
    normalizeText(recordValue) === normalizeText(filterValue);

  // تصحيح دالة getVacDuration
  const getVacDuration = (user_id, vac_name) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i].uid === user_id && data[i].vac_name === vac_name)
        return data[i].vac_duration;
    }
    return 0;
  };

  // Custom filter dropdown component for names
  const NamesFilterDropdown = ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
  }) => {
    const [searchText, setSearchText] = useState("");
    const [selectAll, setSelectAll] = useState(false);

    const handleSelectAll = () => {
      if (selectAll) {
        // Deselect all
        setSelectedKeys([]);
        setSelectAll(false);
      } else {
        // Select all
        const allValues = namesFilter
          .filter((name) => name.value !== "SELECT_ALL_NAMES")
          .map((name) => name.value);
        setSelectedKeys(allValues);
        setSelectAll(true);
      }
    };

    const handleConfirm = () => {
      confirm();
    };

    const handleClear = () => {
      clearFilters();
      setSelectedKeys([]);
      setSelectAll(false);
    };

    const filteredNames = namesFilter.filter(
      (name) =>
        name.value !== "SELECT_ALL_NAMES" &&
        name.text.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
      <div style={{ padding: 8 }}>
        <Input
          placeholder="البحث..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <div style={{ marginBottom: 8 }}>
          <Checkbox
            checked={selectAll}
            onChange={handleSelectAll}
            style={{ fontWeight: "bold" }}
          >
            تحديد الكل
          </Checkbox>
        </div>
        <div style={{ maxHeight: 200, overflow: "auto" }}>
          {filteredNames.map((name) => (
            <div key={name.value} style={{ marginBottom: 4 }}>
              <Checkbox
                checked={selectedKeys.includes(name.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedKeys([...selectedKeys, name.value]);
                  } else {
                    setSelectedKeys(
                      selectedKeys.filter((key) => key !== name.value)
                    );
                  }
                  setSelectAll(false);
                }}
              >
                {name.text}
              </Checkbox>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, textAlign: "right" }}>
          <Button size="small" onClick={handleClear} style={{ marginRight: 8 }}>
            مسح
          </Button>
          <Button type="primary" size="small" onClick={handleConfirm}>
            تأكيد
          </Button>
        </div>
      </div>
    );
  };

  // Custom filter dropdown component for categories
  const CategoriesFilterDropdown = ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
  }) => {
    const [searchText, setSearchText] = useState("");
    const [selectAll, setSelectAll] = useState(false);

    const handleSelectAll = () => {
      if (selectAll) {
        // Deselect all
        setSelectedKeys([]);
        setSelectAll(false);
      } else {
        // Select all
        const allValues = categoriesFilter
          .filter((category) => category.value !== "SELECT_ALL_CATEGORIES")
          .map((category) => category.value);
        setSelectedKeys(allValues);
        setSelectAll(true);
      }
    };

    const handleConfirm = () => {
      confirm();
    };

    const handleClear = () => {
      clearFilters();
      setSelectedKeys([]);
      setSelectAll(false);
    };

    const filteredCategories = categoriesFilter.filter(
      (category) =>
        category.value !== "SELECT_ALL_CATEGORIES" &&
        category.text.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
      <div style={{ padding: 8 }}>
        <Input
          placeholder="البحث..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <div style={{ marginBottom: 8 }}>
          <Checkbox
            checked={selectAll}
            onChange={handleSelectAll}
            style={{ fontWeight: "bold" }}
          >
            تحديد الكل
          </Checkbox>
        </div>
        <div style={{ maxHeight: 200, overflow: "auto" }}>
          {filteredCategories.map((category) => (
            <div key={category.value} style={{ marginBottom: 4 }}>
              <Checkbox
                checked={selectedKeys.includes(category.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedKeys([...selectedKeys, category.value]);
                  } else {
                    setSelectedKeys(
                      selectedKeys.filter((key) => key !== category.value)
                    );
                  }
                  setSelectAll(false);
                }}
              >
                {category.text}
              </Checkbox>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, textAlign: "right" }}>
          <Button size="small" onClick={handleClear} style={{ marginRight: 8 }}>
            مسح
          </Button>
          <Button type="primary" size="small" onClick={handleConfirm}>
            تأكيد
          </Button>
        </div>
      </div>
    );
  };

  const columns = [
    {
      title: "اسم الموظف",
      dataIndex: "empName",
      key: "empName",
      sorter: (a, b) => a.empName.length - b.empName.length,
      sortOrder: sortedInfo.columnKey === "empName" && sortedInfo.order,
      ellipsis: false,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <NamesFilterDropdown
          setSelectedKeys={setSelectedKeys}
          selectedKeys={selectedKeys}
          confirm={confirm}
          clearFilters={clearFilters}
        />
      ),
      onFilter: (value, record) => matchesFilterValue(record.empName, value),
      filteredValue: filteredInfo.empName || null,
    },
    {
      title: "الإدارة",
      dataIndex: "category",
      key: "category",
      sorter: (a, b) => a.category.length - b.category.length,
      sortOrder: sortedInfo.columnKey === "category" && sortedInfo.order,
      ellipsis: false,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <CategoriesFilterDropdown
          setSelectedKeys={setSelectedKeys}
          selectedKeys={selectedKeys}
          confirm={confirm}
          clearFilters={clearFilters}
        />
      ),
      onFilter: (value, record) => {
        const result = matchesFilterValue(record.category, value);
        return result;
      },
      filteredValue: filteredInfo.category || null,
    },
    {
      title: "الوظيفة",
      dataIndex: "job",
      key: "job",
      ellipsis: true,
    },
    {
      title: "الإعانة",
      dataIndex: "salary",
      key: "salary",
      ellipsis: true,
    },
    {
      title: "إجمالي الإضافي",
      dataIndex: "bonusTime",
      key: "bonusTime",
      ellipsis: true,
    },
  ];

  useEffect(() => {
    setLoad(true);

    FirebaseServices.getEmpNames()
      .then((data) => {
        setEmpNames(data);
      })
      .catch(function (error) {
        // تم تجاهل الطباعة
      });
    if (end !== "") {
      FirebaseServices.getBonusReport(start, end)
        .then((data) => {
          setData(data.records);
          setPData(data.records);
          const names = [];
          const categories = [];
          data.records?.forEach((element) => {
            if (!names.some((item) => element.name === item.text))
              names.push({
                text: element["empName"],
                value: element["empName"],
              });
            if (!categories.some((item) => element.category === item.text))
              categories.push({
                text: element["category"],
                value: element["category"],
              });
          });
          setCategories(data.categories);
          // Add "Select All" option to names filter
          const namesWithSelectAll = [
            { text: "تحديد الكل", value: "SELECT_ALL_NAMES" },
            ...names,
          ];

          // Add "Select All" option to categories filter
          const categoriesWithSelectAll = [
            { text: "تحديد الكل", value: "SELECT_ALL_CATEGORIES" },
            ...categories,
          ];

          setNamesFilter(namesWithSelectAll);
          setCategoriesFilter(categoriesWithSelectAll);
          setLoad(false);
        })
        .catch(function (error) {
          // تم تجاهل الطباعة
        });
    }
  }, [start, end]);

  const handleChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);

    if (!filters || Object.keys(filters).length === 0) {
      setPData(data);
      return;
    }

    const hasActiveFilters = Object.values(filters).some(
      (value) => Array.isArray(value) && value.length > 0
    );

    if (!hasActiveFilters) {
      setPData(data);
      return;
    }

    const filteredData = data.filter((item) =>
      Object.entries(filters).every(([key, selectedValues]) => {
        if (!Array.isArray(selectedValues) || !selectedValues.length) {
          return true;
        }

        return selectedValues.some((filterValue) =>
          matchesFilterValue(item[key], filterValue)
        );
      })
    );

    setPData(filteredData);
  };

  // تصحيح دالة printReport
  const printReport = () => {
    const report = document.getElementById("att-report");
    const mywindow = window.open("");
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
    mywindow.onload = function () {
      mywindow.focus();
      mywindow.print();
      mywindow.close();
    };
  };
  function timeToSeconds(time) {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }
  function secondsToTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(2, "0")}`;
  }
  // تصحيح دالة exportToExcel
  const exportToExcel = (type, fn, dl) => {
    const elt = document.getElementsByClassName("print-table")[0];
    if (elt) {
      const wb = excel.utils.table_to_book(elt, { sheet: "sheet1" });
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

  const [form] = Form.useForm();

  const changeRange = (all, date) => {
    setStart(date[0]);
    setEnd(date[1]);
  };
  const onChange = (all, data) => {
    setCurrentMonth(all.format("MMMM"));

    var startDay = props.setting.filter(
      (item) => item.key == "admin.month_start"
    )[0]?.value;
    var endDay = props.setting.filter(
      (item) => item.key == "admin.month_end"
    )[0]?.value;

    setStart(
      dayjs(data + "-" + startDay, "YYYY-MM-DD")
        .subtract(1, "months")
        .format("YYYY-MM-DD")
    );
    setEnd(dayjs(data + "-" + endDay, "YYYY-MM-DD").format("YYYY-MM-DD"));
  };

  var index = 1;

  var ttoald = 0;
  var ttsal = 0;
  var ttbvalue = 0;
  let round =
    props.setting.filter((item) => item.key == "admin.round")[0]?.value * 1;
  return (
    <Card>
      <div style={{ marginBottom: "10px" }}>
        <div className="discountHeader" style={{ marginBottom: "10px" }}>
          <div style={{ marginLeft: "10px" }}>
            <span>اختر شهرًا : </span>
            <DatePicker
              needConfirm={false}
              inputReadOnly={window.innerWidth <= 760}
              defaultValue={dayjs()}
              onChange={onChange}
              picker="month"
            />
          </div>
          <div className="discountRange" style={{ marginBottom: "10px" }}>
            <span>اختر فترة : </span>
            <RangePicker
              needConfirm={true}
              inputReadOnly={window.innerWidth <= 760}
              value={[dayjs(start, "YYYY-MM-DD"), dayjs(end, "YYYY-MM-DD")]}
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
        columns={columns}
        scroll={{ x: "1000px" }}
        dataSource={pdata}
        onChange={handleChange}
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
          <table
            style={{ fontSize: "11px", width: " 100%", textAlign: " center" }}
          >
            <thead>
              <tr style={{ border: "none" }}>
                <th colSpan={13}>
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
                        alt="logo"
                        src={
                          Env.HOST_SERVER_STORAGE +
                          props.setting.filter(
                            (item) => item.key === "admin.logo"
                          )[0]?.value
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
                        خلاصة الدوام الإضافي لشهر {currentMonth}
                      </h1>
                      <h2
                        style={{
                          fontSize: " 14px",
                          fontWeight: " 200",
                          margin: "0",
                        }}
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
                </th>
              </tr>
              <tr
                style={{
                  color: "#fff",
                  backgroundColor: "#0972B6",
                  height: "25px",
                }}
              >
                <th style={{ fontWeight: "100" }}>م</th>
                <th style={{ fontWeight: "100" }}>اسم الموظف</th>
                <th style={{ fontWeight: "100", width: "100px" }}>الوظيفة</th>
                <th style={{ fontWeight: "100" }}>الراتب</th>
                <th style={{ fontWeight: "100" }}> إجمالي الإضافي</th>
                <th style={{ fontWeight: "100" }}> المبلغ المستحق</th>
                <th style={{ fontWeight: "100" }}>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((item) => {
                let totald = 0;
                const catData = pdata?.filter(
                  (record) => record.category === item.name
                );
                let tsal = 0;
                let tbvalue = 0;
                if (catData.length)
                  return (
                    <React.Fragment key={item.name}>
                      {catData.map((item, idx) => {
                        totald += timeToSeconds(item.bonusTime) * 1;
                        ttoald += timeToSeconds(item.bonusTime) * 1;
                        tsal += item.salary * 1;
                        ttsal += item.salary * 1;
                        const bonus_value =
                          Math.round(
                            ((timeToSeconds(item.bonusTime) / 60) *
                              (item.salary / 30 / 7 / 60) *
                              props.setting.filter(
                                (i) => i.key === "admin.bonus_price"
                              )[0]?.value) /
                              round
                          ) * 100;
                        tbvalue += bonus_value * 1;
                        ttbvalue += bonus_value * 1;
                        return (
                          <tr
                            key={item.empName + idx}
                            style={{
                              height: " 25px",
                              backgroundColor:
                                index % 2 === 0 ? "#e6e6e6" : "#fff",
                            }}
                          >
                            <td>{index++}</td>
                            <td>{item.empName}</td>
                            <td>{item.job}</td>
                            <td>
                              {new Intl.NumberFormat("en-EN").format(
                                item.salary
                              )}
                            </td>
                            <td>{item.bonusTime}</td>
                            <td>
                              {new Intl.NumberFormat("en-EN").format(
                                bonus_value
                              )}
                            </td>
                            <td>
                              <pre> </pre>
                            </td>
                          </tr>
                        );
                      })}
                      <tr
                        style={{
                          height: " 30px",
                          color: "#fff",
                          backgroundColor: "#0972B6",
                        }}
                      >
                        <td colSpan={3}>{item.name}</td>
                        <td>{new Intl.NumberFormat("en-EN").format(tsal)}</td>
                        <td>{secondsToTime(totald)}</td>
                        <td>
                          {new Intl.NumberFormat("en-EN").format(tbvalue)}
                        </td>
                        <td>
                          <pre> </pre>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
              })}
              <tr
                style={{
                  height: " 30px",
                  color: "#fff",
                  backgroundColor: "#0972B6",
                }}
              >
                <td colSpan={3}>{"الإجمالي العام"}</td>
                <td>{new Intl.NumberFormat("en-EN").format(ttsal)}</td>
                <td>{secondsToTime(ttoald)}</td>
                <td>{new Intl.NumberFormat("en-EN").format(ttbvalue)}</td>

                <td>
                  <pre> </pre>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={13}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      marginTop: "20px",
                      textAlign: "center",
                    }}
                  >
                    {props.setting
                      .filter((item) => item.key === "admin.signs_footer")[0]
                      ?.value.split("\n")
                      .map((sign) => {
                        const sign_position = sign.split(":")[0];
                        const sign_name = sign.split(":")[1];
                        return (
                          <div key={sign} style={{ width: "50%" }}>
                            <div style={{ fontWeight: "900" }}>
                              {sign_position}
                            </div>
                            {sign_name !== "" && (
                              <div style={{ fontWeight: "500" }}>
                                {sign_name}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </th>
              </tr>
            </tfoot>
          </table>
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
