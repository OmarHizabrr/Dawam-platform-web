/* eslint-disable react-hooks/rules-of-hooks */
import {
  DeleteOutlined,
  ExportOutlined,
  FormOutlined,
  PlusOutlined,
  PrinterOutlined,
  ReloadOutlined,
  StarOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Table,
  notification,
} from "antd";
import { FirebaseServices } from "../../../firebase/FirebaseServices";
// import axios from "axios";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import "./style.css";

import excel from "xlsx";
import { Env, PrintFonts } from "./../../../styles";

const { Option } = Select;

export default function SalariesManagement(props) {
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [data, setData] = useState([]);
  const [pdata, setPData] = useState([]);
  const [load, setLoad] = useState(true);
  const [empNames, setEmpNames] = useState([]);
  const [types, setTypes] = useState([]);
  const [catNames, setCatNames] = useState([]);
  const [namesFilter, setNamesFilter] = useState([]);
  const [categoriesFilter, setCategoriesFilter] = useState([]);
  const [currentYear, setCurrentYear] = useState(dayjs().format("YYYY"));

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isBulkEditModalVisible, setIsBulkEditModalVisible] = useState(false);
  const [isFetchSalariesModalVisible, setIsFetchSalariesModalVisible] =
    useState(false);
  const [isTransferSalariesModalVisible, setIsTransferSalariesModalVisible] =
    useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserName, setEditingUserName] = useState(null);
  const [saving, setSaving] = useState(false);

  const [editForm] = Form.useForm();
  const [addForm] = Form.useForm();
  const [bulkEditForm] = Form.useForm();
  const [fetchSalariesForm] = Form.useForm();
  const [transferSalariesForm] = Form.useForm();

  const normalizeText = (value) =>
    (value ?? "").toString().trim().toLowerCase();
  const matchesFilterValue = (recordValue, filterValue) =>
    normalizeText(recordValue) === normalizeText(filterValue);

  useEffect(() => {
    fetchEmployeeNames();
    fetchTypes();
  }, []);

  useEffect(() => {
    if (catNames.length > 0 && empNames.length > 0) {
      fetchAllSalaries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catNames, empNames, currentYear]);

  const fetchEmployeeNames = () => {
    FirebaseServices.getEmpNames()
      .then((data) => {
        setEmpNames(data);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const fetchTypes = () => {
    FirebaseServices.getUsersInfo()
      .then((data) => {
        setTypes(data.types || []);
      })
      .catch(function (error) {
        console.log(error);
      });

    // جلب أسماء الإدارات
    FirebaseServices.getCatNames()
      .then((data) => {
        setCatNames(data || []);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const fetchAllSalaries = async () => {
    setLoad(true);
    try {
      // جلب جميع الموظفين
      const empResponse = await FirebaseServices.getEmpNames();
      const employees = empResponse || [];

      // جلب بيانات المستخدمين من API users للحصول على الوظيفة (job)
      const today = dayjs().format("YYYY-MM-DD");
      const start = dayjs(currentYear + "-01-01").format("YYYY-MM-DD");
      const end = dayjs(currentYear + "-12-31").format("YYYY-MM-DD");

      let usersDataMap = {};
      try {
        const usersResponse = await FirebaseServices.getUsersData(today, start, end);
        const users = usersResponse["users"] || [];
        // إنشاء خريطة للوظائف من users
        users.forEach((user) => {
          usersDataMap[user.user_id] = {
            job: user.job || "",
            category_id: user.category_id,
          };
        });
      } catch (error) {
        console.log("Error fetching users data:", error);
      }

      // جلب الرواتب لكل موظف
      const salaryPromises = employees.map(async (emp) => {
        try {
          const salariesData = await FirebaseServices.getUserSalaries(emp.value);
          const salaries = salariesData || [];

          // تصفية الرواتب حسب السنة المختارة
          const yearSalaries = salaries.filter(
            (s) => s.year.toString() === currentYear
          );

          // العثور على الراتب الافتراضي أو الأحدث للسنة المختارة
          const defaultSalary =
            yearSalaries.find((s) => s.is_default) ||
            yearSalaries.sort((a, b) => b.year - a.year)[0] ||
            null;

          // العثور على اسم الإدارة من category_id
          const categoryName =
            catNames.find((cat) => cat.value === emp.category)?.label || "";

          // جلب الوظيفة من usersDataMap أو من emp
          const userData = usersDataMap[emp.value];
          const job = userData?.job || emp.job || "";

          return {
            user_id: emp.value,
            empName: emp.label,
            category: categoryName,
            category_id: emp.category,
            job: job,
            defaultSalary: defaultSalary?.salary || 0,
            defaultYear: defaultSalary?.year || "",
            defaultCurrency: defaultSalary?.salary_currency || null,
            is_default: defaultSalary?.is_default || false,
            salaryCount: yearSalaries.length,
          };
        } catch (error) {
          console.log(`Error fetching salary for ${emp.value}:`, error);
          const categoryName =
            catNames.find((cat) => cat.value === emp.category)?.label || "";

          // جلب الوظيفة من usersDataMap أو من emp
          const userData = usersDataMap[emp.value];
          const job = userData?.job || emp.job || "";

          return {
            user_id: emp.value,
            empName: emp.label,
            category: categoryName,
            category_id: emp.category,
            job: job,
            defaultSalary: 0,
            defaultYear: "",
            defaultCurrency: null,
            is_default: false,
            salaryCount: 0,
          };
        }
      });

      const results = await Promise.all(salaryPromises);
      setData(results);
      setPData(results);

      // إعداد الفلاتر
      const names = [];
      const cats = [];
      results.forEach((element) => {
        if (!names.some((item) => element.empName === item.text)) {
          names.push({
            text: element.empName,
            value: element.empName,
          });
        }
        if (
          element.category &&
          !cats.some((item) => element.category === item.text)
        ) {
          cats.push({
            text: element.category,
            value: element.category,
          });
        }
      });

      names.sort((a, b) => a.text.localeCompare(b.text));
      cats.sort((a, b) => a.text.localeCompare(b.text));

      const namesWithSelectAll = [
        { text: "تحديد الكل", value: "SELECT_ALL_NAMES" },
        ...names,
      ];

      const categoriesWithSelectAll = [
        { text: "تحديد الكل", value: "SELECT_ALL_CATEGORIES" },
        ...cats,
      ];

      setNamesFilter(namesWithSelectAll);
      setCategoriesFilter(categoriesWithSelectAll);

      setLoad(false);
    } catch (error) {
      console.log(error);
      notification.error({
        message: "خطأ في جلب البيانات",
        placement: "bottomLeft",
        duration: 3,
      });
      setLoad(false);
    }
  };

  const fetchEmployeeSalaries = (user_id) => {
    return FirebaseServices.getUserSalaries(user_id)
      .then((data) => {
        return data || [];
      })
      .catch(function (error) {
        console.log(error);
        return [];
      });
  };

  const fetchSalariesFromUsers = async (year, currency) => {
    setLoad(true);
    try {
      // استخدام API users للحصول على المستخدمين مع خاصية salary
      const today = dayjs().format("YYYY-MM-DD");
      const start = dayjs(year + "-01-01").format("YYYY-MM-DD");
      const end = dayjs(year + "-12-31").format("YYYY-MM-DD");

      const usersResponse = await FirebaseServices.getUsersData(today, start, end);

      const users = usersResponse["users"] || [];
      const lists = usersResponse["lists"] || [];

      // إنشاء خريطة للرواتب من lists (التي تحتوي على salary)
      const salaryMap = {};
      lists.forEach((item) => {
        salaryMap[item.user_id] = item.salary || 0;
      });

      // إضافة الرواتب إلى جدول salaries
      let addedCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;

      for (const user of users) {
        const salary = salaryMap[user.user_id] || user.salary || 0;

        // تخطي المستخدمين بدون راتب
        if (!salary || salary === 0) {
          skippedCount++;
          continue;
        }

        try {
          // التحقق من وجود راتب لنفس المستخدم والسنة
          const existingSalaries = await fetchEmployeeSalaries(user.user_id);
          const existingSalary = existingSalaries.find(
            (s) => s.year.toString() === year
          );

          if (existingSalary) {
            // تحديث الراتب الموجود
            await FirebaseServices.updateSalary(existingSalary.id, {
              user_id: user.user_id,
              year: year,
              salary: salary,
              salary_currency: currency || existingSalary.salary_currency,
              is_default: existingSalary.is_default || false,
            });
            updatedCount++;
          } else {
            // إضافة راتب جديد
            await FirebaseServices.addSalary({
              user_id: user.user_id,
              year: year,
              salary: salary,
              salary_currency: currency || null,
              is_default: false,
            });
            addedCount++;
          }
        } catch (error) {
          console.log(
            `Error adding/updating salary for user ${user.user_id}:`,
            error
          );
          skippedCount++;
        }
      }

      // تحويل البيانات إلى صيغة الجدول
      const salariesData = users.map((user) => {
        // العثور على اسم الإدارة من category_id
        const categoryName =
          catNames.find((cat) => cat.value === user.category_id)?.label ||
          user.category ||
          "";

        const salary = salaryMap[user.user_id] || user.salary || 0;

        return {
          user_id: user.user_id,
          empName: user.name,
          category: categoryName,
          category_id: user.category_id,
          job: user.job || "",
          defaultSalary: salary,
          defaultYear: year,
          defaultCurrency: currency || null,
          is_default: false,
          salaryCount: salary > 0 ? 1 : 0,
        };
      });

      // إعادة جلب البيانات من جدول salaries بعد الإضافة
      await fetchAllSalaries();

      // إعداد الفلاتر
      const names = [];
      const cats = [];
      salariesData.forEach((element) => {
        if (!names.some((item) => element.empName === item.text)) {
          names.push({
            text: element.empName,
            value: element.empName,
          });
        }
        if (
          element.category &&
          !cats.some((item) => element.category === item.text)
        ) {
          cats.push({
            text: element.category,
            value: element.category,
          });
        }
      });

      names.sort((a, b) => a.text.localeCompare(b.text));
      cats.sort((a, b) => a.text.localeCompare(b.text));

      const namesWithSelectAll = [
        { text: "تحديد الكل", value: "SELECT_ALL_NAMES" },
        ...names,
      ];

      const categoriesWithSelectAll = [
        { text: "تحديد الكل", value: "SELECT_ALL_CATEGORIES" },
        ...cats,
      ];

      setNamesFilter(namesWithSelectAll);
      setCategoriesFilter(categoriesWithSelectAll);

      notification.success({
        message: "تم جلب وإضافة الرواتب بنجاح",
        description: `تم إضافة ${addedCount} راتب جديد، تحديث ${updatedCount} راتب، وتخطي ${skippedCount} موظف بدون راتب للسنة ${year}`,
        placement: "bottomLeft",
        duration: 5,
      });

      setLoad(false);
    } catch (error) {
      console.log(error);
      notification.error({
        message: "خطأ في جلب البيانات",
        description:
          error.response?.data?.message || "حدث خطأ أثناء جلب الرواتب",
        placement: "bottomLeft",
        duration: 3,
      });
      setLoad(false);
    }
  };

  const handleFetchSalariesOk = () => {
    fetchSalariesForm.validateFields().then(async (values) => {
      const year = values.year.format("YYYY");
      const currency = values.currency;
      await fetchSalariesFromUsers(year, currency);
      setIsFetchSalariesModalVisible(false);
      fetchSalariesForm.resetFields();
    });
  };

  const handleFetchSalariesCancel = () => {
    setIsFetchSalariesModalVisible(false);
    fetchSalariesForm.resetFields();
  };

  const handleTransferSalariesOk = () => {
    transferSalariesForm.validateFields().then(async (values) => {
      const fromYear = values.fromYear.format("YYYY");
      const toYear = values.toYear.format("YYYY");
      const bonus = values.bonus || 0;

      setSaving(true);
      try {
        const response = await FirebaseServices.transferSalaries(fromYear, toYear, bonus);

        notification.success({
          message: "تم ترحيل الرواتب بنجاح",
          description: response.data.message || "تم ترحيل جميع الرواتب بنجاح",
          placement: "bottomLeft",
          duration: 3,
        });

        setIsTransferSalariesModalVisible(false);
        transferSalariesForm.resetFields();
        fetchAllSalaries();
      } catch (error) {
        console.error("Error transferring salaries:", error);
        notification.error({
          message: "خطأ في ترحيل الرواتب",
          description:
            error.response?.data?.message || "حدث خطأ أثناء ترحيل الرواتب",
          placement: "bottomLeft",
          duration: 3,
        });
      } finally {
        setSaving(false);
      }
    });
  };

  const handleTransferSalariesCancel = () => {
    setIsTransferSalariesModalVisible(false);
    transferSalariesForm.resetFields();
  };

  const handleResetYear = async () => {
    try {
      // جلب السنة المختارة
      const year = fetchSalariesForm.getFieldValue("year");
      if (!year) {
        notification.warning({
          message: "يرجى اختيار السنة أولاً",
          placement: "bottomLeft",
          duration: 3,
        });
        return;
      }

      const yearStr = year.format("YYYY");

      // استدعاء API لحذف جميع الرواتب للسنة المختارة
      const response = await FirebaseServices.resetYearSalaries(yearStr);

      if (response.success) {
        notification.success({
          message: "تم تصفير السنة بنجاح",
          description:
            response.message +
            ` (تم حذف ${response.deleted_count} راتب)`,
          placement: "bottomLeft",
          duration: 3,
        });

        // تحديث الجدول
        fetchAllSalaries();
      } else {
        notification.error({
          message: "حدث خطأ أثناء التصفير",
          description: response.data.message,
          placement: "bottomLeft",
          duration: 3,
        });
      }
    } catch (error) {
      console.log(error);
      notification.error({
        message: "حدث خطأ أثناء التصفير",
        description: error.response?.data?.message || "حدث خطأ غير متوقع",
        placement: "bottomLeft",
        duration: 3,
      });
    }
  };

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

    const filterPredicate = (item) =>
      Object.entries(filters).every(([key, selectedValues]) => {
        if (!Array.isArray(selectedValues) || !selectedValues.length) {
          return true;
        }

        return selectedValues.some((filterValue) =>
          matchesFilterValue(item[key], filterValue)
        );
      });

    setPData(data.filter(filterPredicate));
  };

  const showEditModal = async (user_id) => {
    setEditingUserId(user_id);

    const user = empNames.find((emp) => emp.value === user_id);
    const userName = user ? user.label : "موظف";
    setEditingUserName(userName);

    const salaries = await fetchEmployeeSalaries(user_id);

    // تعبئة النموذج بالرواتب
    editForm.setFieldsValue({
      salaries: salaries.map((salary) => ({
        id: salary.id,
        year: dayjs(salary.year.toString(), "YYYY"),
        salary: salary.salary,
        salary_currency: salary.salary_currency,
        is_default: salary.is_default,
      })),
    });

    setIsEditModalVisible(true);
  };

  const handleEditOk = () => {
    editForm.validateFields().then(async (values) => {
      setSaving(true);
      try {
        const salaries = values.salaries || [];
        const updates = salaries.map((sal) => ({
          id: sal.id,
          user_id: editingUserId,
          year: sal.year.format("YYYY"),
          salary: sal.salary,
          salary_currency: sal.salary_currency,
          is_default: sal.is_default || false,
        }));

        // تحديث كل راتب
        for (const update of updates) {
          if (update.id) {
            await FirebaseServices.updateSalary(update.id, update);
          }
        }

        notification.success({
          message: "تم تحديث الرواتب بنجاح",
          placement: "bottomLeft",
          duration: 3,
        });

        setIsEditModalVisible(false);
        editForm.resetFields();
        setEditingUserId(null);
        setEditingUserName(null);
        fetchAllSalaries();
      } catch (error) {
        console.log(error);
        notification.error({
          message: "حدث خطأ أثناء العملية",
          placement: "bottomLeft",
          duration: 3,
        });
      } finally {
        setSaving(false);
      }
    });
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    editForm.resetFields();
    setEditingUserId(null);
    setEditingUserName(null);
  };

  const handleAddOk = () => {
    addForm.validateFields().then(async (values) => {
      setSaving(true);
      try {
        const employees = values.employees || [];

        // إضافة راتب لكل موظف مع بياناته الخاصة
        for (const emp of employees) {
          if (emp.user_id && emp.year && emp.salary) {
            const formData = {
              user_id: emp.user_id,
              year: emp.year.format("YYYY"),
              salary: emp.salary,
              salary_currency: emp.salary_currency,
              is_default: emp.is_default || false,
            };

            await FirebaseServices.addSalary(formData);
          }
        }

        notification.success({
          message: "تم إضافة الرواتب بنجاح",
          placement: "bottomLeft",
          duration: 3,
        });

        setIsModalVisible(false);
        addForm.resetFields();
        fetchAllSalaries();
      } catch (error) {
        console.log(error);
        notification.error({
          message: "حدث خطأ أثناء العملية",
          placement: "bottomLeft",
          duration: 3,
        });
      } finally {
        setSaving(false);
      }
    });
  };

  const handleAddCancel = () => {
    setIsModalVisible(false);
    addForm.resetFields();
  };

  const handleBulkEditOk = () => {
    bulkEditForm.validateFields().then(async (values) => {
      setSaving(true);
      try {
        const employees = values.employees || [];

        // تحديث/إضافة راتب لكل موظف مع بياناته الخاصة
        for (const emp of employees) {
          if (emp.user_id && emp.year && emp.salary) {
            const year = emp.year.format("YYYY");

            // التحقق من وجود راتب لنفس السنة
            const userSalaries = await fetchEmployeeSalaries(emp.user_id);
            const existingSalary = userSalaries.find(
              (s) => s.year.toString() === year
            );

            if (existingSalary) {
              // تحديث الراتب الموجود
              await FirebaseServices.updateSalary(existingSalary.id, {
                user_id: emp.user_id,
                year: year,
                salary: emp.salary,
                salary_currency: emp.salary_currency,
                is_default: emp.is_default || false,
              });
            } else {
              // إضافة راتب جديد
              await FirebaseServices.addSalary({
                user_id: emp.user_id,
                year: year,
                salary: emp.salary,
                salary_currency: emp.salary_currency,
                is_default: emp.is_default || false,
              });
            }
          }
        }

        notification.success({
          message: "تم التعديل الجماعي بنجاح",
          description: `تم تحديث رواتب ${employees.length} موظف`,
          placement: "bottomLeft",
          duration: 3,
        });

        setIsBulkEditModalVisible(false);
        bulkEditForm.resetFields();
        setSelectedRowKeys([]);
        fetchAllSalaries();
      } catch (error) {
        console.log(error);
        notification.error({
          message: "حدث خطأ أثناء العملية",
          placement: "bottomLeft",
          duration: 3,
        });
      } finally {
        setSaving(false);
      }
    });
  };

  const handleBulkEditCancel = () => {
    setIsBulkEditModalVisible(false);
    bulkEditForm.resetFields();
  };

  const handleDelete = async (salaryId, userId) => {
    try {
      await FirebaseServices.deleteSalary(salaryId);
      notification.success({
        message: "تم حذف الراتب بنجاح",
        placement: "bottomLeft",
        duration: 3,
      });
      fetchAllSalaries();
      if (editingUserId === userId) {
        const salaries = await fetchEmployeeSalaries(userId);
        editForm.setFieldsValue({
          salaries: salaries.map((salary) => ({
            id: salary.id,
            year: dayjs(salary.year.toString(), "YYYY"),
            salary: salary.salary,
            salary_currency: salary.salary_currency,
            is_default: salary.is_default,
          })),
        });
      }
    } catch (error) {
      console.log(error);
      notification.error({
        message: "حدث خطأ أثناء العملية",
        placement: "bottomLeft",
        duration: 3,
      });
    }
  };

  const handleSetDefault = async (salaryId, userId) => {
    try {
      await FirebaseServices.setDefaultSalary(salaryId);
      notification.success({
        message: "تم تعيين الراتب كافتراضي بنجاح",
        placement: "bottomLeft",
        duration: 3,
      });
      fetchAllSalaries();
      if (editingUserId === userId) {
        const salaries = await fetchEmployeeSalaries(userId);
        editForm.setFieldsValue({
          salaries: salaries.map((salary) => ({
            id: salary.id,
            year: dayjs(salary.year.toString(), "YYYY"),
            salary: salary.salary,
            salary_currency: salary.salary_currency,
            is_default: salary.is_default,
          })),
        });
      }
    } catch (error) {
      console.log(error);
      notification.error({
        message: "حدث خطأ أثناء العملية",
        placement: "bottomLeft",
        duration: 3,
      });
    }
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
        setSelectedKeys([]);
        setSelectAll(false);
      } else {
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
        setSelectedKeys([]);
        setSelectAll(false);
      } else {
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

  const getColumns = () => {
    return [
      {
        title: "اسم الموظف",
        dataIndex: "empName",
        key: "empName",
        sorter: (a, b) => a.empName.localeCompare(b.empName),
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
        sorter: (a, b) => (a.category || "").localeCompare(b.category || ""),
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
        onFilter: (value, record) => matchesFilterValue(record.category, value),
        filteredValue: filteredInfo.category || null,
      },
      {
        title: "الوظيفة",
        dataIndex: "job",
        key: "job",
        sorter: (a, b) => (a.job || "").localeCompare(b.job || ""),
        sortOrder: sortedInfo.columnKey === "job" && sortedInfo.order,
        ellipsis: true,
      },
      {
        title: "الراتب الافتراضي",
        dataIndex: "defaultSalary",
        key: "defaultSalary",
        sorter: (a, b) => a.defaultSalary - b.defaultSalary,
        sortOrder: sortedInfo.columnKey === "defaultSalary" && sortedInfo.order,
        render: (salary, record) => {
          if (record.defaultYear === currentYear || record.defaultYear) {
            return new Intl.NumberFormat("en-EN").format(salary || 0);
          }
          return "-";
        },
      },
      {
        title: "السنة",
        dataIndex: "defaultYear",
        key: "defaultYear",
        sorter: (a, b) => (a.defaultYear || "") - (b.defaultYear || ""),
        sortOrder: sortedInfo.columnKey === "defaultYear" && sortedInfo.order,
        render: (year) => year || "-",
      },
      {
        title: "العملة",
        dataIndex: "defaultCurrency",
        key: "defaultCurrency",
        render: (currency) => {
          if (!currency) return "-";
          // البحث عن العملة مع تحويل القيم إلى نفس النوع للمقارنة (مثل النوافذ)
          const currencyType = types.find(
            (t) =>
              t.parent == 4 &&
              (String(t.value) === String(currency) ||
                Number(t.value) === Number(currency))
          );
          return currencyType ? currencyType.label : currency;
        },
      },
      {
        title: "عدد الرواتب",
        dataIndex: "salaryCount",
        key: "salaryCount",
        sorter: (a, b) => a.salaryCount - b.salaryCount,
        sortOrder: sortedInfo.columnKey === "salaryCount" && sortedInfo.order,
      },
      {
        title: "الأحداث",
        dataIndex: "user_id",
        key: "user_id",
        ellipsis: true,
        render: (user_id) => (
          <Button
            onClick={() => showEditModal(user_id)}
            type="primary"
            shape="round"
            icon={<FormOutlined />}
          ></Button>
        ),
      },
    ];
  };

  const exportToExcel = (type, fn, dl) => {
    var elt = document.getElementById("att-report");
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
        : excel.writeFile(
            wb,
            fn || "إدارة الرواتب - سنة " + currentYear + "." + (type || "xlsx"),
            {
              bookSST: true,
              type: "base64",
              cellStyles: true,
            }
          );
    }
  };

  const printReport = () => {
    var report = document.getElementById("att-report");
    if (!report) return;
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

    mywindow.onload = function () {
      mywindow.focus();
      mywindow.print();
      mywindow.close();
    };
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
              onChange={(date) => {
                if (date) {
                  setCurrentYear(date.format("YYYY"));
                }
              }}
              placeholder="اختر سنة"
              picker="year"
            />
            <Button
              style={{
                marginLeft: "5px",
                marginRight: "5px",
                border: "none",
                backgroundColor: "#1890ff",
                color: "#fff",
              }}
              onClick={() => {
                setIsFetchSalariesModalVisible(true);
                fetchSalariesForm.setFieldsValue({
                  year: dayjs(currentYear, "YYYY"),
                  currency: null,
                });
              }}
            >
              <FormOutlined /> جلب الرواتب من المستخدمين
            </Button>
            <Button
              style={{
                marginLeft: "5px",
                marginRight: "5px",
                border: "none",
                backgroundColor: "#722ed1",
                color: "#fff",
              }}
              onClick={() => {
                setIsTransferSalariesModalVisible(true);
                transferSalariesForm.setFieldsValue({
                  fromYear: dayjs(currentYear, "YYYY"),
                  toYear: dayjs((parseInt(currentYear) + 1).toString(), "YYYY"),
                  bonus: 0,
                });
              }}
            >
              <FormOutlined /> ترحيل الرواتب
            </Button>
            <Button
              style={{
                marginLeft: "5px",
                marginRight: "5px",
                border: "none",
                backgroundColor: "#FAA61A",
                color: "#fff",
              }}
              onClick={() => {
                setIsModalVisible(true);
                addForm.setFieldsValue({
                  year: dayjs(currentYear, "YYYY"),
                  salary: "",
                  salary_currency: null,
                  is_default: false,
                  employees: [],
                });
              }}
            >
              <FormOutlined /> إضافة راتب
            </Button>
            {selectedRowKeys.length > 0 && (
              <Button
                style={{
                  marginLeft: "5px",
                  marginRight: "5px",
                  border: "none",
                  backgroundColor: "#52c41a",
                  color: "#fff",
                }}
                onClick={async () => {
                  setIsBulkEditModalVisible(true);

                  // جلب رواتب الموظفين المحددين للسنة الحالية
                  const employeesData = [];
                  for (const userId of selectedRowKeys) {
                    const salaries = await fetchEmployeeSalaries(userId);
                    const yearSalary = salaries.find(
                      (s) => s.year.toString() === currentYear
                    );
                    const emp = empNames.find((e) => e.value === userId);

                    employeesData.push({
                      user_id: userId,
                      empName: emp?.label || userId,
                      year: yearSalary
                        ? dayjs(yearSalary.year.toString(), "YYYY")
                        : dayjs(currentYear, "YYYY"),
                      salary: yearSalary?.salary || 0,
                      salary_currency: yearSalary?.salary_currency || null,
                      is_default: yearSalary?.is_default || false,
                    });
                  }

                  bulkEditForm.setFieldsValue({
                    employees: employeesData,
                  });
                }}
              >
                <FormOutlined /> تعديل جماعي ({selectedRowKeys.length})
              </Button>
            )}
            <Button
              style={{
                marginLeft: "5px",
                marginRight: "5px",
              }}
              onClick={() => {
                const allKeys = pdata.map((record) => record.user_id);
                setSelectedRowKeys(allKeys);
              }}
            >
              تحديد الكل
            </Button>
            <Button
              style={{
                marginLeft: "5px",
                marginRight: "5px",
              }}
              onClick={() => {
                setSelectedRowKeys([]);
              }}
            >
              إزالة الكل
            </Button>
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
        columns={getColumns()}
        scroll={{ x: "1000px" }}
        dataSource={pdata}
        onChange={handleChange}
        rowKey="user_id"
        rowSelection={{
          selectedRowKeys,
          onChange: (selectedKeys) => {
            setSelectedRowKeys(selectedKeys);
          },
        }}
      />
      <div id="att-report" style={{ display: "none" }}>
        <div
          style={{
            direction: "rtl",
            fontSize: "12px",
            fontFamily:
              "Tajawal, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
            margin: "0",
          }}
        >
          <table
            style={{ fontSize: "11px", width: "100%", textAlign: "center" }}
          >
            <thead>
              <tr style={{ border: "none" }}>
                <th colSpan={6}>
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
                      {props.setting && (
                        <img
                          alt="Logo"
                          loading="eager"
                          style={{ width: "250px" }}
                          src={
                            Env.HOST_SERVER_STORAGE +
                            props.setting.filter(
                              (item) => item.key == "admin.logo"
                            )[0]?.value
                          }
                        />
                      )}
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
                          fontSize: "18px",
                          fontWeight: 700,
                          marginBottom: "5px",
                          margin: "0",
                        }}
                      >
                        كشف{" "}
                        {props.setting
                          ? props.setting.filter(
                              (item) => item.key == "admin.salary_allowances"
                            )[0]?.value || "الرواتب"
                          : "الرواتب"}{" "}
                        سنة {currentYear}
                      </h1>
                    </div>
                    <div style={{ width: "20%" }}></div>
                  </header>
                  <div
                    style={{
                      display: "flex",
                      marginBottom: "20px",
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
                <th style={{ fontWeight: "100" }} rowSpan="2">
                  م
                </th>
                <th style={{ fontWeight: "100" }} rowSpan="2">
                  اسم الموظف
                </th>
                <th style={{ fontWeight: "100", width: "50px" }} rowSpan="2">
                  الوظيفة
                </th>
                <th style={{ fontWeight: "100" }} rowSpan="2">
                  الراتب الافتراضي
                </th>
                <th style={{ fontWeight: "100" }} rowSpan="2">
                  العملة
                </th>
              </tr>
              <tr
                style={{
                  color: "#fff",
                  backgroundColor: "#0972B6",
                  height: "25px",
                }}
              ></tr>
            </thead>
            <tbody>
              {(() => {
                let index = 0;
                // الحصول على الإدارات الفريدة من البيانات المفلترة فقط
                const filteredCategories = [
                  ...new Set(pdata.map((item) => item.category)),
                ]
                  .map((catName) => {
                    const cat = catNames.find((c) => c.label === catName);
                    return cat || { label: catName, value: catName };
                  })
                  .filter((cat) => cat !== null);

                return filteredCategories.map((category) => {
                  const catData = pdata.filter(
                    (record) => record.category == category.label
                  );

                  if (catData.length === 0) return null;

                  let categoryTotalSalary = 0;

                  return (
                    <React.Fragment key={category.value}>
                      {catData.map((item) => {
                        index++;
                        const currencyType = types.find(
                          (t) =>
                            t.parent == 4 &&
                            (String(t.value) === String(item.defaultCurrency) ||
                              Number(t.value) === Number(item.defaultCurrency))
                        );
                        categoryTotalSalary += item.defaultSalary || 0;

                        return (
                          <tr
                            key={item.user_id}
                            style={{
                              height: "30px",
                              backgroundColor:
                                index % 2 != 0 ? "#e6e6e6" : "#fff",
                            }}
                          >
                            <td>{index}</td>
                            <td style={{ fontSize: "8px", minWidth: "80px" }}>
                              {item.empName}
                            </td>
                            <td style={{ fontSize: "7px", width: "30px" }}>
                              {item.job || "-"}
                            </td>
                            <td>
                              {new Intl.NumberFormat("en-EN").format(
                                item.defaultSalary || 0
                              )}
                            </td>
                            <td>
                              {currencyType
                                ? currencyType.label
                                : item.defaultCurrency || "-"}
                            </td>
                          </tr>
                        );
                      })}
                      <tr
                        style={{
                          height: "30px",
                          color: "#fff",
                          backgroundColor: "#0972B6",
                          fontSize: "8px!important",
                        }}
                      >
                        <td colSpan={3}>{category.label}</td>
                        <td>
                          {new Intl.NumberFormat("en-EN").format(
                            categoryTotalSalary
                          )}
                        </td>
                        <td></td>
                      </tr>
                    </React.Fragment>
                  );
                });
              })()}
              <tr
                style={{
                  height: "30px",
                  color: "#fff",
                  backgroundColor: "#0972B6",
                }}
              >
                <td colSpan={3}>{"الإجمالي العام"}</td>
                <td>
                  {new Intl.NumberFormat("en-EN").format(
                    pdata.reduce(
                      (sum, item) => sum + (item.defaultSalary || 0),
                      0
                    )
                  )}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              marginTop: "50px",
              width: "85%",
              backgroundColor: "#e6e6e61",
              padding: "5px 0",
              borderTopLeftRadius: "5px",
              borderBottomLeftRadius: "5px",
            }}
          >
            <div
              style={{
                backgroundColor: "#0972B6",
                width: "95%",
                height: "15px",
                borderTopLeftRadius: "5px",
                borderBottomLeftRadius: "5px",
                color: "#fff",
                paddingRight: "20px",
              }}
            >
              نظام دوام | {new Date().toLocaleString("en-IT")}{" "}
            </div>
          </div>
        </div>
      </div>

      {/* Modal إضافة راتب */}
      <Modal
        title="إضافة رواتب جديدة"
        open={isModalVisible}
        onOk={handleAddOk}
        onCancel={handleAddCancel}
        confirmLoading={saving}
        okText="حفظ"
        cancelText="إلغاء"
        width={1000}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            name="selectedEmployees"
            label="اختر الموظفين"
            rules={[
              { required: true, message: "يرجى اختيار موظف واحد على الأقل" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="اختر الموظفين"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children
                  ?.toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }
              onChange={(selectedUserIds) => {
                // عند اختيار الموظفين، إضافة صف لكل موظف
                const employeesData = selectedUserIds.map((userId) => {
                  const emp = empNames.find((e) => e.value === userId);
                  return {
                    user_id: userId,
                    empName: emp?.label || userId,
                    year: dayjs(currentYear, "YYYY"),
                    salary: 0,
                    salary_currency: null,
                    is_default: false,
                  };
                });
                addForm.setFieldsValue({
                  employees: employeesData,
                });
              }}
            >
              {empNames.map((emp) => (
                <Option key={emp.value} value={emp.value}>
                  {emp.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ marginTop: "20px", marginBottom: "10px" }}>
            <strong>بيانات الرواتب (كل موظف على حدة):</strong>
          </div>

          <Form.List name="employees">
            {(fields, { add, remove }) => (
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f0f0f0" }}>
                      <th
                        style={{
                          padding: "8px",
                          textAlign: "right",
                          border: "1px solid #d9d9d9",
                        }}
                      >
                        اسم الموظف
                      </th>
                      <th
                        style={{
                          padding: "8px",
                          textAlign: "right",
                          border: "1px solid #d9d9d9",
                        }}
                      >
                        السنة
                      </th>
                      <th
                        style={{
                          padding: "8px",
                          textAlign: "right",
                          border: "1px solid #d9d9d9",
                        }}
                      >
                        الراتب
                      </th>
                      <th
                        style={{
                          padding: "8px",
                          textAlign: "right",
                          border: "1px solid #d9d9d9",
                        }}
                      >
                        العملة
                      </th>
                      <th
                        style={{
                          padding: "8px",
                          textAlign: "right",
                          border: "1px solid #d9d9d9",
                        }}
                      >
                        افتراضي
                      </th>
                      <th
                        style={{
                          padding: "8px",
                          textAlign: "right",
                          border: "1px solid #d9d9d9",
                        }}
                      >
                        حذف
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map(({ key, name, ...restField }) => {
                      const empName = addForm.getFieldValue([
                        "employees",
                        name,
                        "empName",
                      ]);
                      return (
                        <tr key={key}>
                          <td
                            style={{
                              padding: "8px",
                              border: "1px solid #d9d9d9",
                            }}
                          >
                            {empName}
                            <Form.Item name={[name, "user_id"]} hidden>
                              <Input />
                            </Form.Item>
                            <Form.Item name={[name, "empName"]} hidden>
                              <Input />
                            </Form.Item>
                          </td>
                          <td
                            style={{
                              padding: "8px",
                              border: "1px solid #d9d9d9",
                            }}
                          >
                            <Form.Item
                              {...restField}
                              name={[name, "year"]}
                              rules={[{ required: true, message: "مطلوب" }]}
                              style={{ marginBottom: 0 }}
                            >
                              <DatePicker
                                picker="year"
                                style={{ width: "100%" }}
                              />
                            </Form.Item>
                          </td>
                          <td
                            style={{
                              padding: "8px",
                              border: "1px solid #d9d9d9",
                            }}
                          >
                            <Form.Item
                              {...restField}
                              name={[name, "salary"]}
                              rules={[{ required: true, message: "مطلوب" }]}
                              style={{ marginBottom: 0 }}
                            >
                              <InputNumber
                                style={{ width: "100%" }}
                                min={0}
                                formatter={(value) =>
                                  `${value}`.replace(
                                    /\B(?=(\d{3})+(?!\d))/g,
                                    ","
                                  )
                                }
                                parser={(value) =>
                                  value.replace(/\$\s?|(,*)/g, "")
                                }
                              />
                            </Form.Item>
                          </td>
                          <td
                            style={{
                              padding: "8px",
                              border: "1px solid #d9d9d9",
                            }}
                          >
                            <Form.Item
                              {...restField}
                              name={[name, "salary_currency"]}
                              rules={[{ required: true, message: "مطلوب" }]}
                              style={{ marginBottom: 0 }}
                            >
                              <Select
                                placeholder="اختر"
                                style={{ width: "100%" }}
                                options={types.filter(function (e) {
                                  return e.parent == 4;
                                })}
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  option.props.children?.indexOf(input) >= 0 ||
                                  option.props.label?.indexOf(input) >= 0
                                }
                                filterSort={(optionA, optionB) =>
                                  optionA.props?.children?.localeCompare(
                                    optionB.props.children
                                  )
                                }
                              />
                            </Form.Item>
                          </td>
                          <td
                            style={{
                              padding: "8px",
                              border: "1px solid #d9d9d9",
                              textAlign: "center",
                            }}
                          >
                            <Form.Item
                              {...restField}
                              name={[name, "is_default"]}
                              valuePropName="checked"
                              style={{ marginBottom: 0 }}
                            >
                              <Checkbox />
                            </Form.Item>
                          </td>
                          <td
                            style={{
                              padding: "8px",
                              border: "1px solid #d9d9d9",
                              textAlign: "center",
                            }}
                          >
                            <Button
                              type="link"
                              danger
                              onClick={() => remove(name)}
                              icon={<DeleteOutlined />}
                            >
                              حذف
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* Modal تعديل رواتب موظف */}
      <Modal
        title={`تعديل رواتب - ${editingUserName || "موظف"}`}
        open={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
        confirmLoading={saving}
        okText="حفظ"
        cancelText="إلغاء"
        width={900}
      >
        <Form form={editForm} layout="vertical">
          <Form.List name="salaries">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => {
                  const salaryId = editForm.getFieldValue([
                    "salaries",
                    name,
                    "id",
                  ]);
                  const isDefault = editForm.getFieldValue([
                    "salaries",
                    name,
                    "is_default",
                  ]);
                  return (
                    <div
                      key={key}
                      style={{
                        marginBottom: "20px",
                        padding: "15px",
                        border: "1px solid #d9d9d9",
                        borderRadius: "6px",
                      }}
                    >
                      <Form.Item name={[name, "id"]} hidden>
                        <Input />
                      </Form.Item>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: "15px",
                        }}
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "year"]}
                          label="السنة"
                          rules={[{ required: true, message: "مطلوب" }]}
                        >
                          <DatePicker
                            picker="year"
                            style={{ width: "100%" }}
                            disabled={!!salaryId}
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "salary"]}
                          label="الراتب"
                          rules={[{ required: true, message: "مطلوب" }]}
                        >
                          <InputNumber
                            style={{ width: "100%" }}
                            min={0}
                            formatter={(value) =>
                              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "salary_currency"]}
                          label="العملة"
                          rules={[{ required: true, message: "مطلوب" }]}
                        >
                          <Select
                            placeholder="اختر العملة"
                            options={types.filter(function (e) {
                              return e.parent == 4;
                            })}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.props.children?.indexOf(input) >= 0 ||
                              option.props.label?.indexOf(input) >= 0
                            }
                            filterSort={(optionA, optionB) =>
                              optionA.props?.children?.localeCompare(
                                optionB.props.children
                              )
                            }
                            showSearch
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "is_default"]}
                          valuePropName="checked"
                          label="افتراضي"
                        >
                          <Checkbox>افتراضي</Checkbox>
                        </Form.Item>
                      </div>
                      {salaryId && (
                        <div
                          style={{
                            marginTop: "10px",
                            display: "flex",
                            gap: "8px",
                          }}
                        >
                          {!isDefault && (
                            <Button
                              type="link"
                              icon={<StarOutlined />}
                              onClick={() =>
                                handleSetDefault(salaryId, editingUserId)
                              }
                            >
                              تعيين كافتراضي
                            </Button>
                          )}
                          <Popconfirm
                            title="هل أنت متأكد من حذف هذا الراتب؟"
                            onConfirm={() => {
                              handleDelete(salaryId, editingUserId);
                              remove(name);
                            }}
                            okText="نعم"
                            cancelText="لا"
                          >
                            <Button
                              type="link"
                              danger
                              icon={<DeleteOutlined />}
                            >
                              حذف
                            </Button>
                          </Popconfirm>
                        </div>
                      )}
                    </div>
                  );
                })}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    إضافة راتب جديد
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* Modal التعديل الجماعي */}
      <Modal
        title={`تعديل جماعي - ${selectedRowKeys.length} موظف`}
        open={isBulkEditModalVisible}
        onOk={handleBulkEditOk}
        onCancel={handleBulkEditCancel}
        confirmLoading={saving}
        okText="حفظ"
        cancelText="إلغاء"
        width={1000}
      >
        <Form form={bulkEditForm} layout="vertical">
          <div style={{ marginBottom: "15px" }}>
            <strong>بيانات الرواتب (كل موظف على حدة):</strong>
          </div>

          <Form.List name="employees">
            {(fields) => {
              // حساب حالة "تحديد الكل"
              const allChecked =
                fields.length > 0 &&
                fields.every((field) => {
                  const isDefault = bulkEditForm.getFieldValue([
                    "employees",
                    field.name,
                    "is_default",
                  ]);
                  return isDefault === true;
                });

              const someChecked = fields.some((field) => {
                const isDefault = bulkEditForm.getFieldValue([
                  "employees",
                  field.name,
                  "is_default",
                ]);
                return isDefault === true;
              });

              const handleSelectAllDefault = (checked) => {
                fields.forEach((field) => {
                  bulkEditForm.setFieldValue(
                    ["employees", field.name, "is_default"],
                    checked
                  );
                });
              };

              return (
                <>
                  <div
                    style={{
                      marginBottom: "10px",
                      padding: "8px",
                      backgroundColor: "#f0f0f0",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      flexWrap: "wrap",
                    }}
                  >
                    <Checkbox
                      checked={allChecked}
                      indeterminate={someChecked && !allChecked}
                      onChange={(e) => handleSelectAllDefault(e.target.checked)}
                    >
                      <strong>تحديد الكل كافتراضي</strong>
                    </Checkbox>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleSelectAllDefault(true)}
                    >
                      تحديد الكل
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleSelectAllDefault(false)}
                    >
                      إزالة الكل
                    </Button>
                  </div>
                  <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: "#f0f0f0" }}>
                          <th
                            style={{
                              padding: "8px",
                              textAlign: "right",
                              border: "1px solid #d9d9d9",
                            }}
                          >
                            اسم الموظف
                          </th>
                          <th
                            style={{
                              padding: "8px",
                              textAlign: "right",
                              border: "1px solid #d9d9d9",
                            }}
                          >
                            السنة
                          </th>
                          <th
                            style={{
                              padding: "8px",
                              textAlign: "right",
                              border: "1px solid #d9d9d9",
                            }}
                          >
                            الراتب
                          </th>
                          <th
                            style={{
                              padding: "8px",
                              textAlign: "right",
                              border: "1px solid #d9d9d9",
                            }}
                          >
                            العملة
                          </th>
                          <th
                            style={{
                              padding: "8px",
                              textAlign: "right",
                              border: "1px solid #d9d9d9",
                            }}
                          >
                            افتراضي
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {fields.map(({ key, name, ...restField }) => {
                          const empName = bulkEditForm.getFieldValue([
                            "employees",
                            name,
                            "empName",
                          ]);
                          return (
                            <tr key={key}>
                              <td
                                style={{
                                  padding: "8px",
                                  border: "1px solid #d9d9d9",
                                }}
                              >
                                {empName}
                                <Form.Item name={[name, "user_id"]} hidden>
                                  <Input />
                                </Form.Item>
                                <Form.Item name={[name, "empName"]} hidden>
                                  <Input />
                                </Form.Item>
                              </td>
                              <td
                                style={{
                                  padding: "8px",
                                  border: "1px solid #d9d9d9",
                                }}
                              >
                                <Form.Item
                                  {...restField}
                                  name={[name, "year"]}
                                  rules={[{ required: true, message: "مطلوب" }]}
                                  style={{ marginBottom: 0 }}
                                >
                                  <DatePicker
                                    picker="year"
                                    style={{ width: "100%" }}
                                  />
                                </Form.Item>
                              </td>
                              <td
                                style={{
                                  padding: "8px",
                                  border: "1px solid #d9d9d9",
                                }}
                              >
                                <Form.Item
                                  {...restField}
                                  name={[name, "salary"]}
                                  rules={[{ required: true, message: "مطلوب" }]}
                                  style={{ marginBottom: 0 }}
                                >
                                  <InputNumber
                                    style={{ width: "100%" }}
                                    min={0}
                                    formatter={(value) =>
                                      `${value}`.replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        ","
                                      )
                                    }
                                    parser={(value) =>
                                      value.replace(/\$\s?|(,*)/g, "")
                                    }
                                  />
                                </Form.Item>
                              </td>
                              <td
                                style={{
                                  padding: "8px",
                                  border: "1px solid #d9d9d9",
                                }}
                              >
                                <Form.Item
                                  {...restField}
                                  name={[name, "salary_currency"]}
                                  rules={[{ required: true, message: "مطلوب" }]}
                                  style={{ marginBottom: 0 }}
                                >
                                  <Select
                                    placeholder="اختر"
                                    style={{ width: "100%" }}
                                    options={types.filter(function (e) {
                                      return e.parent == 4;
                                    })}
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                      option.props.children?.indexOf(input) >=
                                        0 ||
                                      option.props.label?.indexOf(input) >= 0
                                    }
                                    filterSort={(optionA, optionB) =>
                                      optionA.props?.children?.localeCompare(
                                        optionB.props.children
                                      )
                                    }
                                    showSearch
                                  />
                                </Form.Item>
                              </td>
                              <td
                                style={{
                                  padding: "8px",
                                  border: "1px solid #d9d9d9",
                                  textAlign: "center",
                                }}
                              >
                                <Form.Item
                                  {...restField}
                                  name={[name, "is_default"]}
                                  valuePropName="checked"
                                  style={{ marginBottom: 0 }}
                                >
                                  <Checkbox />
                                </Form.Item>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            }}
          </Form.List>
        </Form>
      </Modal>

      {/* Modal جلب الرواتب من المستخدمين */}
      <Modal
        title="جلب الرواتب من المستخدمين"
        open={isFetchSalariesModalVisible}
        onOk={handleFetchSalariesOk}
        onCancel={handleFetchSalariesCancel}
        okText="جلب"
        cancelText="إلغاء"
        width={500}
      >
        <Form form={fetchSalariesForm} layout="vertical">
          <Form.Item
            name="year"
            label="السنة"
            rules={[{ required: true, message: "يرجى اختيار السنة" }]}
          >
            <DatePicker
              picker="year"
              style={{ width: "100%" }}
              placeholder="اختر السنة"
            />
          </Form.Item>
          <Form.Item
            name="currency"
            label="العملة"
            rules={[{ required: true, message: "يرجى اختيار العملة" }]}
          >
            <Select
              placeholder="اختر العملة"
              style={{ width: "100%" }}
              options={types.filter(function (e) {
                return e.parent == 4;
              })}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children?.indexOf(input) >= 0 ||
                option.props.label?.indexOf(input) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.props?.children?.localeCompare(optionB.props.children)
              }
            />
          </Form.Item>
          <Form.Item>
            <Popconfirm
              title="هل أنت متأكد من تصفير السنة؟"
              description={`سيتم حذف جميع الرواتب لسنة ${
                fetchSalariesForm.getFieldValue("year")?.format("YYYY") ||
                "المحددة"
              } بشكل دائم. هذا الإجراء لا يمكن التراجع عنه!`}
              onConfirm={handleResetYear}
              okText="نعم، تصفير"
              cancelText="إلغاء"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="primary"
                danger
                icon={<ReloadOutlined />}
                block
                style={{ marginTop: "10px" }}
              >
                تصفير السنة المختارة
              </Button>
            </Popconfirm>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal ترحيل الرواتب */}
      <Modal
        title="ترحيل الرواتب"
        open={isTransferSalariesModalVisible}
        onOk={handleTransferSalariesOk}
        onCancel={handleTransferSalariesCancel}
        okText="ترحيل"
        cancelText="إلغاء"
        width={500}
        confirmLoading={saving}
      >
        <Form form={transferSalariesForm} layout="vertical">
          <Form.Item
            name="fromYear"
            label="السنة المصدر (التي يرحل منها)"
            rules={[{ required: true, message: "يرجى اختيار السنة المصدر" }]}
          >
            <DatePicker
              picker="year"
              style={{ width: "100%" }}
              placeholder="اختر السنة المصدر"
            />
          </Form.Item>
          <Form.Item
            name="toYear"
            label="السنة المستهدفة (التي يرحل إليها)"
            rules={[{ required: true, message: "يرجى اختيار السنة المستهدفة" }]}
          >
            <DatePicker
              picker="year"
              style={{ width: "100%" }}
              placeholder="اختر السنة المستهدفة"
            />
          </Form.Item>
          <Form.Item
            name="bonus"
            label="العلاوة للسنة الجديدة"
            rules={[
              { required: true, message: "يرجى إدخال العلاوة" },
              {
                type: "number",
                min: 0,
                message: "العلاوة يجب أن تكون أكبر من أو تساوي صفر",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="أدخل العلاوة"
              min={0}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
