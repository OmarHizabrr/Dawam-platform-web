/* eslint-disable react-hooks/rules-of-hooks */
import { ExportOutlined, PrinterOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, DatePicker, Input, Table } from "antd";
import { FirebaseServices } from "../../../../firebase/FirebaseServices";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import excel from "xlsx";
import "./style.css";

import { Env, PrintFonts } from "../../../../styles";

export default function AnnualReport(props) {
  const [sortedInfo, setSortedInfo] = useState({});
  const [filteredInfo, setFilteredInfo] = useState({});
  const [load, setLoad] = useState(true);
  const [loadReport] = useState(false);
  const [namesFilter, setNamesFilter] = useState([]);
  const [names, setNames] = useState([]);
  const [currentYear, setCurrentYear] = useState(dayjs().format("YYYY"));
  const [categories, setCategories] = useState([]);
  const [annTasks, setAnnTasks] = useState([]);
  const [pannTasks, setPAnnTasks] = useState([]);

  const getColumnsVac = () => {
    const months = [
      "يناير",
      "فبراير",
      "مارس",
      "إبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];

    const ncolumns = [
      {
        title: "م",
        dataIndex: "index",
        key: "index",
        width: 50,
        render: (text, record, index) => index + 1,
      },
      {
        title: "اسم الموظف",
        dataIndex: "name",
        key: "name",
        width: 200,
        ellipsis: false,
        sorter: (a, b) => a.name?.localeCompare(b.name),
        sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
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
        onFilter: (value, record) => {
          if (value === "SELECT_ALL_NAMES") {
            return true; // Show all records when "Select All" is selected
          }
          return record.name?.includes(value);
        },
        filteredValue: filteredInfo.name || null,
        render: (text) => (
          <div
            style={{
              whiteSpace: "normal",
              wordBreak: "break-word",
              lineHeight: "1.4",
              padding: "4px 0",
            }}
          >
            {text}
          </div>
        ),
      },
      {
        title: "الوظيفة",
        dataIndex: "job",
        key: "job",
        width: 150,
        ellipsis: true,
      },
      {
        title: "مرحل من العام الماضي",
        dataIndex: "prev",
        key: "prev",
        width: 120,
        render: (value) => {
          if (!value) return "0:00";
          return parseInt(value / 60) + ":" + Math.round(value % 60);
        },
      },
      {
        title: "رصيد العام الحالي",
        dataIndex: "curr",
        key: "curr",
        width: 120,
        render: (value) => {
          if (!value) return "0:00";
          return parseInt(value / 60) + ":" + Math.round(value % 60);
        },
      },
      {
        title: "رصيد محول",
        dataIndex: "trans",
        key: "trans",
        width: 100,
        render: (value) => {
          if (!value) return "0:00";
          return parseInt(value / 60) + ":" + Math.round(value % 60);
        },
      },
      {
        title: "الافتتاحي",
        dataIndex: "opening",
        key: "opening",
        width: 100,
        render: (text, record) => {
          const op =
            Math.round(record.prev || 0) +
            Math.round(record.curr || 0) +
            Math.round(record.trans || 0);
          return parseInt(op / 60) + ":" + (op % 60);
        },
      },
    ];

    // إضافة أعمدة الأشهر
    months.forEach((month, index) => {
      ncolumns.push({
        title: month,
        dataIndex: `m${index + 1}`,
        key: `m${index + 1}`,
        width: 80,
        render: (value) => {
          if (!value) return "0:00";
          const min = value / 60;
          return parseInt(min / 60) + ":" + (min % 60);
        },
      });
    });

    // إضافة العمودين الأخيرين
    ncolumns.push({
      title: "الممنوح",
      dataIndex: "granted",
      key: "granted",
      width: 100,
      render: (text, record) => {
        let totalg = 0;
        for (let i = 1; i <= 12; i++) {
          totalg += (record[`m${i}`] || 0) / 60;
        }
        return Math.round((totalg / 60 / 7) * 100) / 100;
      },
    });

    ncolumns.push({
      title: "المتبقي",
      dataIndex: "remaining",
      key: "remaining",
      width: 100,
      render: (text, record) => {
        const op =
          Math.round(record.prev || 0) +
          Math.round(record.curr || 0) +
          Math.round(record.trans || 0);
        let totalg = 0;
        for (let i = 1; i <= 12; i++) {
          totalg += (record[`m${i}`] || 0) / 60;
        }
        return Math.round(((op - totalg) / 60 / 7) * 100) / 100;
      },
    });

    return ncolumns;
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

  useEffect(() => {
    setLoad(true);

    // جلب الفئات
    FirebaseServices.getRestTasks(currentYear)
      .then((data) => {
        setCategories(data.categories);
      })
      .catch(function (error) {
        console.log(error);
      });

    // جلب البيانات السنوية
    FirebaseServices.getAnnualTasksReport(currentYear)
      .then((data) => {
        setAnnTasks(data);
        setPAnnTasks(data);

        // إعداد فلاتر الأسماء للبيانات السنوية
        let annualNames = [];
        data.forEach((element) => {
          if (!annualNames.some((item) => element.name === item.text))
            annualNames.push({
              text: element["name"],
              value: element["name"],
            });
        });
        annualNames = annualNames.sort((a, b) => a.text.localeCompare(b.text));
        // Add "Select All" option to names filter
        const annualNamesWithSelectAll = [
          { text: "تحديد الكل", value: "SELECT_ALL_NAMES" },
          ...annualNames,
        ];
        setNamesFilter(annualNamesWithSelectAll);
        setLoad(false);
      })
      .catch(function (error) {
        console.log(error);
        setLoad(false);
      });
  }, [currentYear]);

  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
    setFilteredInfo(filters);

    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== null) {
          setPAnnTasks(
            annTasks.filter((item) => {
              if (key === "name") {
                return filters[key].includes(item.name);
              }
              return filters[key].includes(item[key]);
            })
          );
        } else {
          setPAnnTasks(annTasks);
        }
      });
    }
  };

  const printReport = () => {
    var report = document.getElementById("ann-report");
    var mywindow = window.open("");
    mywindow.document.write(
      "<html><head><title></title> <style>" +
        PrintFonts.getPrintFontsCSS() +
        "body{font-size:12px;margin:0} " +
        "table{font-size:12px} " +
        "</style>"
    );
    mywindow.document.write('</head><body dir="rtl" style="font-size:12px;" >');
    mywindow.document.write(report.innerHTML);
    mywindow.document.write("</body></html>");

    mywindow.onload = function () {
      mywindow.focus();
      mywindow.print();
      mywindow.close();
    };
  };

  const exportToExcel = (type, fn, dl) => {
    var elt = document.getElementById("ann-report");
    if (elt) {
      var wb = excel.utils.table_to_book(elt, {
        sheet: "sheet1",
        cellStyles: true,
      });
      return dl
        ? excel.write(wb, {
            bookType: type,
            bookSST: true,
            type: "base64",
            cellStyles: true,
          })
        : excel.writeFile(wb, fn || "التقرير السنوي." + (type || "xlsx"), {
            bookSST: true,
            type: "base64",
            cellStyles: true,
          });
    }
  };

  const onChange = (all, date) => {
    setCurrentYear(date);
  };

  var aindex = 1;
  var months = [
    "يناير",
    "فبراير",
    "مارس",
    "إبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];
  var tprevBalance = 0;
  var tcurrBalance = 0;
  var ttransBalance = 0;
  var topBalance = 0;
  var ttotalgBalance = 0;
  var tmonthsBalance = {
    m1: 0,
    m2: 0,
    m3: 0,
    m4: 0,
    m5: 0,
    m6: 0,
    m7: 0,
    m8: 0,
    m9: 0,
    m10: 0,
    m11: 0,
    m12: 0,
  };

  return (
    <Card>
      <div style={{ marginBottom: "10px" }}>
        <div className="discountHeader" style={{ marginBottom: "10px" }}>
          <div className="discountBtn">
            <DatePicker
              needConfirm={false}
              inputReadOnly={window.innerWidth <= 760}
              value={dayjs(currentYear, "YYYY")}
              onChange={onChange}
              placeholder="اختر سنة"
              picker="year"
            />
            <Button
              style={{ margin: "0 10px" }}
              onClick={function () {
                exportToExcel("xlsx");
              }}
              type="primary"
            >
              <ExportOutlined /> تصدير
            </Button>
            <Button
              loading={loadReport}
              style={{
                backgroundColor: "#0972B6",
                borderColor: "#0972B6",
                marginLeft: "10px",
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
        scroll={{ x: "1500px" }}
        dataSource={pannTasks}
        onChange={handleChange}
      />

      <div id="ann-report" style={{ display: "none" }}>
        <div
          style={{
            direction: "rtl",
            fontSize: "12px",
            fontFamily: "Tajawal, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
            margin: "0",
          }}
        >
          <table
            class="equal-table"
            style={{
              fontSize: "11px",
              width: " 100%",
              textAlign: " center",
              fontFamily: "Tajawal, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
            }}
          >
            <thead>
              <tr style={{ border: "none" }}>
                <th colSpan={21}>
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
                        alt="Logo"
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
                        كشف السنوية لعام {currentYear}م
                      </h1>
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

              <tr style={{ color: "#fff", backgroundColor: "#0972B6" }}>
                <th style={{ fontWeight: "100" }}>م</th>
                <th style={{ fontWeight: "100" }}>اسم الموظف</th>
                <th style={{ fontWeight: "100" }}>الوظيفة</th>
                <th style={{ fontWeight: "100", width: "50px" }}>
                  مرحل من العام الماضي
                </th>
                <th style={{ fontWeight: "100", width: "50px" }}>
                  رصيد العام الحالي
                </th>
                <th style={{ fontWeight: "100", width: "50px" }}>رصيد محول</th>
                <th style={{ fontWeight: "100" }}>الافتتاحي</th>

                {months.map((m, ind) => {
                  return (
                    <th
                      class="equal"
                      style={{
                        fontWeight: "100",
                        whiteSpace: "nowrap",
                        transform: "rotate(-180deg)",
                        writingMode: "vertical-rl",
                        height: "30px",
                        width: "30px",
                        maxWidth: "30px",
                      }}
                    >
                      {months[ind]}
                    </th>
                  );
                })}
                <th style={{ fontWeight: "100" }}> الممنوح</th>
                <th style={{ fontWeight: "100" }}> المتبقي</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((item) => {
                var catData = pannTasks.filter(
                  (record) => record.category === item.name
                );
                var prevBalance = 0;
                var currBalance = 0;
                var transBalance = 0;
                var opBalance = 0;
                var totalgBalance = 0;
                var monthsBalance = {
                  m1: 0,
                  m2: 0,
                  m3: 0,
                  m4: 0,
                  m5: 0,
                  m6: 0,
                  m7: 0,
                  m8: 0,
                  m9: 0,
                  m10: 0,
                  m11: 0,
                  m12: 0,
                };
                if (catData.length > 0) {
                  return (
                    <>
                      {catData.map((item) => {
                        prevBalance += item.prev * 1;
                        currBalance += item.curr * 1;
                        transBalance += item.trans * 1;
                        var totalg = 0;
                        var op =
                          Math.round(item.prev) +
                          Math.round(item.curr) +
                          Math.round(item.trans);
                        opBalance += op;

                        tprevBalance += item.prev * 1;
                        tcurrBalance += item.curr * 1;
                        ttransBalance += item.trans * 1;
                        topBalance += op;

                        return (
                          <tr
                            style={{
                              height: " 25px",
                              backgroundColor:
                                aindex % 2 === 0 ? "#e6e6e6" : "#fff",
                            }}
                          >
                            <td style={{ fontWeight: "100" }}>{aindex++}</td>
                            <td style={{ fontWeight: "100" }}>{item.name}</td>
                            <td style={{ fontWeight: "100", width: "100px" }}>
                              {item.job}
                            </td>
                            <th style={{ fontWeight: "100" }}>
                              {parseInt(item.prev / 60) +
                                ":" +
                                Math.round(item.prev % 60)}
                            </th>
                            <th style={{ fontWeight: "100" }}>
                              {parseInt(item.curr / 60) +
                                ":" +
                                Math.round(item.curr % 60)}
                            </th>
                            <th style={{ fontWeight: "100" }}>
                              {parseInt(item.trans / 60) +
                                ":" +
                                Math.round(item.trans % 60)}
                            </th>
                            <th style={{ fontWeight: "100" }}>
                              {parseInt(op / 60) + ":" + (op % 60)}
                            </th>
                            {months.map((m, ind) => {
                              var min = item["m" + (ind + 1)] / 60;
                              totalg += min;
                              totalgBalance += min;
                              monthsBalance["m" + (ind + 1)] += min;
                              ttotalgBalance += min;
                              tmonthsBalance["m" + (ind + 1)] += min;
                              return (
                                <td class="equal" style={{ fontWeight: "100" }}>
                                  {parseInt(min / 60) + ":" + (min % 60)}
                                </td>
                              );
                            })}
                            <td style={{ fontWeight: "100" }}>
                              {Math.round((totalg / 60 / 7) * 100) / 100}
                            </td>
                            <th style={{ fontWeight: "100" }}>
                              {Math.round(((op - totalg) / 60 / 7) * 100) / 100}
                            </th>
                          </tr>
                        );
                      })}
                      <tr
                        style={{
                          height: " 25px",
                          color: "#fff",
                          backgroundColor: "#0972B6",
                        }}
                      >
                        <td style={{ fontWeight: "100" }} colSpan={3}>
                          {item.name}
                        </td>
                        <th style={{ fontWeight: "100" }}>
                          {parseInt(prevBalance / 60) +
                            ":" +
                            Math.round(prevBalance % 60)}
                        </th>
                        <th style={{ fontWeight: "100" }}>
                          {parseInt(currBalance / 60) +
                            ":" +
                            Math.round(currBalance % 60)}
                        </th>
                        <th style={{ fontWeight: "100" }}>
                          {parseInt(transBalance / 60) +
                            ":" +
                            Math.round(transBalance % 60)}
                        </th>
                        <th style={{ fontWeight: "100" }}>
                          {parseInt(opBalance / 60) + ":" + (opBalance % 60)}
                        </th>
                        {months.map((m, ind) => {
                          var min = monthsBalance["m" + (ind + 1)];
                          return (
                            <td class="equal" style={{ fontWeight: "100" }}>
                              {parseInt(min / 60) + ":" + (min % 60)}
                            </td>
                          );
                        })}
                        <td style={{ fontWeight: "100" }}>
                          {Math.round((totalgBalance / 60 / 7) * 100) / 100}
                        </td>
                        <th style={{ fontWeight: "100" }}>
                          {Math.round(
                            ((opBalance - totalgBalance) / 60 / 7) * 100
                          ) / 100}
                        </th>
                      </tr>
                    </>
                  );
                }
                return null;
              })}
              <tr
                style={{
                  height: " 30px",
                  color: "#fff",
                  backgroundColor: "#0972B6",
                }}
              >
                <td colSpan={3}>{"الإجمالي العام"}</td>
                <th style={{ fontWeight: "100" }}>
                  {parseInt(tprevBalance / 60) +
                    ":" +
                    Math.round(tprevBalance % 60)}
                </th>
                <th style={{ fontWeight: "100" }}>
                  {parseInt(tcurrBalance / 60) +
                    ":" +
                    Math.round(tcurrBalance % 60)}
                </th>
                <th style={{ fontWeight: "100" }}>
                  {parseInt(ttransBalance / 60) +
                    ":" +
                    Math.round(ttransBalance % 60)}
                </th>
                <th style={{ fontWeight: "100" }}>
                  {parseInt(topBalance / 60) + ":" + (topBalance % 60)}
                </th>
                {months.map((m, ind) => {
                  var min = tmonthsBalance["m" + (ind + 1)];
                  return (
                    <td class="equal" style={{ fontWeight: "100" }}>
                      {parseInt(min / 60) + ":" + (min % 60)}
                    </td>
                  );
                })}
                <td style={{ fontWeight: "100" }}>
                  {Math.round((ttotalgBalance / 60 / 7) * 100) / 100}
                </td>
                <th style={{ fontWeight: "100" }}>
                  {Math.round(((topBalance - ttotalgBalance) / 60 / 7) * 100) /
                    100}
                </th>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={21}>
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
                        var sign_position = sign.split(":")[0];
                        var sign_name = sign.split(":")[1];

                        return (
                          <div style={{ width: "50%" }}>
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
                      })}{" "}
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
