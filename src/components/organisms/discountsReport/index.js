/* eslint-disable react-hooks/rules-of-hooks */
import { ExportOutlined, PrinterOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Input,
  Layout,
  Select,
  Table,
  Tabs,
  Typography,
} from "antd";
// import axios from "axios";
import { FirebaseServices } from "../../../firebase/FirebaseServices";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import excel from "xlsx";
import { Env, PrintFonts } from "./../../../styles";
import "./style.css";

const { Content } = Layout;
const { Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const exportToExcel = (type, fn, dl) => {
  var elt = document.getElementById("discounts-table");
  if (elt) {
    var wb = excel.utils.table_to_book(elt, { sheet: "sheet1" });
    return dl
      ? excel.write(wb, { bookType: type, bookSST: true, type: "base64" })
      : excel.writeFile(wb, fn || "كشف الخصميات." + (type || "xlsx"));
  }
};
export default function DiscountsReport(props) {
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  const [data, setData] = useState([]);
  const [pdata, setPData] = useState([]);

  const [namesFilter, setNamesFilter] = useState([]);
  const [categoriesFilter, setCategoriesFilter] = useState([]);
  const [names, setNames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [load, setLoad] = useState(true);
  const [count, setCount] = useState(0);
  const [requiredCount, setRequiredCount] = useState(0);
  const [fridaysData, setFridaysData] = useState([]);

  const normalizeText = (value) =>
    (value ?? "").toString().trim().toLowerCase();
  const matchesFilterValue = (recordValue, filterValue) =>
    normalizeText(recordValue) === normalizeText(filterValue);

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
  const [end, setEnd] = useState(
    dayjs(
      dayjs().format("YYYY-MM") +
      "-" +
      props.setting.filter((item) => item.key == "admin.month_end")[0]?.value,
      "YYYY-MM-DD"
    ).format("YYYY-MM-DD")
  );
  const [currentMonth, setCurrentMonth] = useState(dayjs().format("MMMM"));
  // eslint-disable-next-line react-hooks/rules-of-hooks
  let dround = parseInt(
    props.setting.filter((item) => item.key == "admin.discounts_round")[0]
      ?.value * 1
  );

  useEffect(() => {
    setLoad(true);
    FirebaseServices.getDiscountsList(start, end)
      .then((dataBody) => {
        console.log(dataBody);
        let names = [];
        let categories = [];
        if (dataBody["lists"]) {
          dataBody["lists"].forEach((element) => {
            if (!names.some((item) => element.name == item.text))
              names.push({ text: element["name"], value: element["name"] });
            if (!categories.some((item) => element.category == item.text))
              categories.push({
                text: element["category"],
                value: element["category"],
              });
          });
        }
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

        setData(dataBody.lists || []);
        setPData(dataBody.lists || []);

        setCount(dataBody.count?.[0]?.count || 0);

        setRequiredCount(
          parseInt(dataBody.requiredCount?.[0]?.count || 0)
        );
        setFridaysData(dataBody.fridaysData || []);
        setCategories(dataBody.categories || []);
        setLoad(false);
      })
      .catch(function (error) {
        console.log(error);
      });
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
  const changeRange = (all, date) => {
    //const id=cookies.user;
    setStart(date[0]);
    setEnd(date[1]);
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
      title: "الاسم",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.length - b.name.length,
      sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
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
      onFilter: (value, record) => matchesFilterValue(record.name, value),
      filteredValue: filteredInfo.name || null,
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
      title: "المسمى الوظيفي",
      dataIndex: "job",
      key: "job",
      sorter: (a, b) => a.job - b.job,
      sortOrder: sortedInfo.columnKey === "job" && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: "الاستحقاق",
      dataIndex: "salary",
      key: "salary",
      sorter: (a, b) => a.salary.length - b.salary.length,
      sortOrder: sortedInfo.columnKey === "salary" && sortedInfo.order,
      ellipsis: true,
      render: (salary) => salary + " ر.ي",
    },
    {
      title: "الغياب",
      dataIndex: "attendanceDays",
      key: "attendanceDays",
      sorter: (a, b) => a.attendanceDays - b.attendanceDays,
      sortOrder: sortedInfo.columnKey === "attendanceDays" && sortedInfo.order,
      ellipsis: true,
      render: (attendanceDays, record, _) => {
        let absence = count - attendanceDays - (record.vacationDays || 0);
        return record.fingerprint_type == "22"
          ? absence > 0
            ? absence
            : 0
          : 0;
      },
    },
    {
      title: "خصميات الغياب",
      dataIndex: ["salary", "attendanceDays"],
      key: "absencePrice",
      sorter: (a, b) =>
        (a.salary / 30) *
        (count - a.attendanceDays - (a.vacationDays || 0)) -
        (b.salary / 30) *
        (count - b.attendanceDays - (b.vacationDays || 0)),
      sortOrder: sortedInfo.columnKey === "absencePrice" && sortedInfo.order,
      ellipsis: true,
      render: (attendanceDays, row) => {
        let absence = count - row.attendanceDays - (row.vacationDays || 0);
        absence = absence > 0 ? absence : 0;
        return row.fingerprint_type == "22"
          ? Math.round((row.salary / 30) * absence * 100) / 100
          : 0;
      },
    },
    {
      title: "التأخرات",
      dataIndex: "lateTime",
      key: "lateTime",
      sorter: (a, b) => {
        if (
          a &&
          a.lateTime &&
          a.lateTime.length &&
          b &&
          b.lateTime &&
          b.lateTime.length
        ) {
          return a.lateTime.length - b.lateTime.length;
        } else if (a && a.lateTime && a.lateTime.length) {
          return -1;
        } else if (b && b.lateTime && b.lateTime.length) {
          return 1;
        }
        return 0;
      },
      sortOrder: sortedInfo.columnKey === "lateTime" && sortedInfo.order,
      ellipsis: true,
      render: (lateTime, row) =>
        row.fingerprint_type == "22" ? lateTime : 0,
    },
    {
      title: "خصميات التأخرات",
      dataIndex: "lateTimePrice",
      key: "lateTimePrice",
      sorter: (a, b) => a.lateTimePrice - b.lateTimePrice,
      sortOrder: sortedInfo.columnKey === "lateTimePrice" && sortedInfo.order,
      ellipsis: false,
      render: (lateTimePrice, row) =>
        row.fingerprint_type == "22" ? Math.round(lateTimePrice) : 0,
    },
    {
      title: "إجمالي الخصم",
      key: "total",
      render: (_, row) => {
        let absence = count - row.attendanceDays - (row.vacationDays || 0);
        absence = absence > 0 ? absence : 0;
        let adis = (row.salary / 30) * absence;
        let total = parseFloat(row.lateTimePrice) + adis;
        return row.fingerprint_type == "22"
          ? new Intl.NumberFormat("en-EN").format(
            Math.round(total / dround) * dround
          )
          : 0;
      },
    },
  ];
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

    // mywindow.document.close();
    mywindow.onload = function () {
      // wait until all resources loaded
      mywindow.focus(); // necessary for IE >= 10
      mywindow.print(); // change window to mywindow
      // mywindow.close();// change window to mywindow
    };
    /* var printContents = document.getElementById("att-report").innerHTML;
      var originalContents = document.body.innerHTML;
  
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;*/
  };
  function getMinutesTime(amPmString) {
    if (amPmString) {
      var d = amPmString.split(":");
      var m = parseInt(d[0]) * 60 + parseInt(d[1]);
      return m;
    } else return 0;
  }
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
  var index = 0;
  var tsal = 0;
  var tltimes = 0;
  var tldiscounts = 0;
  var tatimes = 0;
  var tadiscounts = 0;
  var ttotal = 0;
  var tttotalateTime = 0;
  return (
    <Layout>
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
                style={{ display: "block", margin: "0 10px" }}
                onClick={function () {
                  exportToExcel("xlsx");
                }}
                type="primary"
              >
                <ExportOutlined />
              </Button>
              <Button
                style={{
                  display: "block",
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
          style={{ textAlign: "center!important" }}
          columns={columns}
          scroll={{ x: "1000px" }}
          onRow={(record, rowIndex) => {
            return { className: record.status };
          }}
          dataSource={pdata}
          onChange={handleChange}
        />
      </Card>
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
            id="discounts-table"
            style={{
              fontSize: "11px",
              width: " 100%",
              textAlign: " center",
              marginTop: " 20px",
            }}
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
                        src={
                          Env.HOST_SERVER_STORAGE +
                          props.setting.filter(
                            (item) => item.key == "admin.logo"
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
                          fontSize: " 15px",
                          fontWeight: 700,
                          marginBottom: " 5px",
                          margin: "0",
                        }}
                      >
                        خلاصة الغياب والتأخرات لشهر {currentMonth}
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
                  height: "30px",
                }}
              >
                <th style={{ fontWeight: "100" }} rowSpan="2">
                  م
                </th>
                <th style={{ fontWeight: "100" }} rowSpan="2">
                  الاسم
                </th>
                <th style={{ fontWeight: "100", width: "60px" }} rowSpan="2">
                  الوظيفة
                </th>
                <th style={{ fontWeight: "100" }} rowSpan="2">
                  الاستحقاق
                </th>
                <th style={{ fontWeight: "100" }} colSpan="2">
                  التأخرات
                </th>
                <th style={{ fontWeight: "100" }} colSpan="2">
                  الغياب
                </th>
                <th style={{ fontWeight: "100" }} colSpan="3">
                  إجمالي الخصم
                </th>
              </tr>
              <tr
                style={{
                  color: "#fff",
                  backgroundColor: "#0972B6",
                  height: "20px",
                }}
              >
                <th style={{ fontWeight: "100" }}>الساعات</th>
                <th style={{ fontWeight: "100" }}>الخصم</th>
                <th style={{ fontWeight: "100" }}>الأيام</th>
                <th style={{ fontWeight: "100" }}>الخصم</th>
                <th style={{ fontWeight: "100" }}>الساعات</th>
                <th style={{ fontWeight: "100" }}>المبلغ</th>
                <th style={{ fontWeight: "100" }}>النسبة</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((item) => {
                var catData = pdata.filter(
                  (record) => record.category == item.name
                );
                var sal = 0;
                var ltimes = 0;
                var ldiscounts = 0;
                var atimes = 0;
                var adiscounts = 0;
                var total = 0;
                var ttotalateTime = 0;

                if (catData.length)
                  return (
                    <>
                      {catData.map((item) => {
                        // lateTimePrice
                        item.lateTimePrice =
                          item.fingerprint_type == "22"
                            ? item.lateTimePrice
                            : 0;
                        item.lateTimePrice =
                          item.lateTimePrice == null ? 0 : item.lateTimePrice;

                        // lateTime
                        item.lateTime =
                          item.fingerprint_type == "22" ? item.lateTime : 0;
                        item.lateTime =
                          item.lateTime == null ? 0 : item.lateTime;

                        // الاستحقاق هو الراتب فقط
                        var s = parseFloat(item.salary);
                        sal += s;

                        // التأخرات بالدقائق
                        ltimes +=
                          Math.round(getMinutesTime(item.lateTime)) < 0
                            ? 0
                            : Math.round(getMinutesTime(item.lateTime));
                        ldiscounts +=
                          Math.round(item.lateTimePrice) < 0
                            ? 0
                            : Math.round(item.lateTimePrice);

                        // عدد أيام الغياب
                        var atim =
                          item.fingerprint_type == "22"
                            ? count -
                            item.attendanceDays * 1 -
                            (item.vacationDays || 0) * 1
                            : 0;
                        atim = atim == null || atim < 0 ? 0 : atim;
                        atimes += atim;

                        // خصميات الغياب
                        var adis = parseFloat((item.salary / 30) * atim);
                        adiscounts += adis;

                        // إجمالي الخصم
                        var tot =
                          parseFloat(item.lateTimePrice) +
                          adis;
                        total += tot;

                        tsal += parseFloat(item.salary);
                        tltimes += getMinutesTime(item.lateTime);
                        tldiscounts += Math.round(item.lateTimePrice);
                        tatimes += atim;
                        tadiscounts += adis;
                        ttotal += tot;
                        var totalateTime =
                          atim * 7 * 60 + getMinutesTime(item.lateTime);
                        ttotalateTime += totalateTime;
                        tttotalateTime += totalateTime;

                        return (
                          <tr
                            style={{
                              height: " 30px",
                              backgroundColor:
                                ++index % 2 != 0 ? "#e6e6e6" : "#fff",
                            }}
                          >
                            <td>{index}</td>
                            <td style={{ fontSize: "10px" }}>{item.name}</td>
                            <td style={{ fontSize: "8px", width: "60px" }}>
                              {item.job}
                            </td>
                            <td>
                              {new Intl.NumberFormat("en-EN").format(
                                item.salary
                              )}
                            </td>
                            <td>{item.lateTime}</td>
                            <td>
                              {new Intl.NumberFormat("en-EN").format(
                                Math.round(item.lateTimePrice)
                              )}
                            </td>
                            <td>{atim}</td>
                            <td>
                              {new Intl.NumberFormat("en-EN").format(
                                Math.round(adis)
                              )}
                            </td>
                            <td>
                              {parseInt(totalateTime / 60) +
                                ":" +
                                (totalateTime % 60)}
                            </td>
                            <td>
                              {new Intl.NumberFormat("en-EN").format(
                                Math.round(tot / dround) * dround
                              )}
                            </td>
                            <td>
                              {item.salary > 0
                                ? Math.round((tot / item.salary) * 100)
                                : 0}
                              %
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
                        <td>{new Intl.NumberFormat("en-EN").format(sal)}</td>
                        <td>{parseInt(ltimes / 60) + ":" + (ltimes % 60)}</td>
                        <td>
                          {new Intl.NumberFormat("en-EN").format(
                            Math.round(ldiscounts / 5) * 5
                          )}
                        </td>
                        <td>{atimes}</td>
                        <td>
                          {new Intl.NumberFormat("en-EN").format(
                            Math.round(adiscounts / 5) * 5
                          )}
                        </td>
                        <td>
                          {parseInt(ttotalateTime / 60) +
                            ":" +
                            (ttotalateTime % 60)}
                        </td>
                        <td>
                          {new Intl.NumberFormat("en-EN").format(
                            Math.round(total / 5) * 5
                          )}
                        </td>

                        <td>{Math.round((total / sal) * 100)}%</td>
                      </tr>
                    </>
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
                <td>{new Intl.NumberFormat("en-EN").format(tsal)}</td>
                <td>{parseInt(tltimes / 60) + ":" + (tltimes % 60)}</td>
                <td>
                  {new Intl.NumberFormat("en-EN").format(
                    Math.round(tldiscounts / 5) * 5
                  )}
                </td>
                <td>{tatimes}</td>
                <td>
                  {new Intl.NumberFormat("en-EN").format(
                    Math.round(tadiscounts / 5) * 5
                  )}
                </td>
                <td>
                  {parseInt(tttotalateTime / 60) + ":" + (tttotalateTime % 60)}
                </td>
                <td>
                  {new Intl.NumberFormat("en-EN").format(
                    Math.round(ttotal / 5) * 5
                  )}
                </td>
                <td>{Math.round((ttotal / tsal) * 100)}%</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={13}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
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
                            <div style={{ fontWeight: "900" }}>
                              {sign_position}
                            </div>
                            {sign_name != "" && (
                              <div style={{ fontWeight: "500" }}>
                                {sign_name}
                              </div>
                            )}
                          </div>
                        );
                      })}{" "}
                  </div>
                </th>
              </tr>
            </tfoot>
          </table>
          <div
            style={{
              marginTop: "50px",
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
    </Layout>
  );
}
