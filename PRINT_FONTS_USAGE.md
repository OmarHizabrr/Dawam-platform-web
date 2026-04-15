# دليل استخدام خطوط الطباعة المحلية

تم إنشاء نظام موحد لاستخدام الخطوط المحلية في جميع صفحات الطباعة.

## الملفات المُنشأة

1. **`src/styles/printFonts.css`** - ملف CSS يحتوي على تعريفات @font-face للخطوط
2. **`src/styles/printFonts.js`** - ملف JavaScript يحتوي على دوال مساعدة لاستخدام الخطوط

## الخطوط المستخدمة

- `JannaLTBold` - الخط الرئيسي للطباعة
- `BoutrosMBCDinkum` - الخط الثانوي للطباعة

الخطوط موجودة في: `public/fonts/`

## طريقة الاستخدام

### الطريقة 1: استخدام الدالة `getPrintFontsCSS()`

استورد الدالة واستخدمها في وظيفة الطباعة:

```javascript
import { PrintFonts } from "./../../../styles"; // أو المسار المناسب

const printReport = () => {
  var report = document.getElementById("att-report");
  var mywindow = window.open("");
  mywindow.document.write(
    "<html><head><title></title> <style>" +
      PrintFonts.getPrintFontsCSS() +
      "body{font-size:12px;margin:0} " +
      "table,th,td{font-family:JannaLTBold,BoutrosMBCDinkum,Arial,sans-serif} " +
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
```

### الطريقة 2: استخدام الدالة `getPrintFontFamily()`

للحصول على اسم font-family فقط:

```javascript
import { PrintFonts } from "./../../../styles";

const fontFamily = PrintFonts.getPrintFontFamily();
// النتيجة: 'JannaLTBold, BoutrosMBCDinkum, Arial, sans-serif'
```

### الطريقة 3: استخدام الدالة `createPrintHTML()`

لإنشاء HTML كامل للطباعة:

```javascript
import { PrintFonts } from "./../../../styles";

const printReport = () => {
  var report = document.getElementById("att-report");
  var mywindow = window.open("");
  
  const htmlContent = PrintFonts.createPrintHTML(
    report.innerHTML,
    "table{font-size:12px} /* أي تنسيقات إضافية */"
  );
  
  mywindow.document.write(htmlContent);
  mywindow.onload = function () {
    mywindow.focus();
    mywindow.print();
    mywindow.close();
  };
};
```

## تحديث ملفات الطباعة الموجودة

لتحديث أي ملف طباعة موجود:

1. **أضف الاستيراد:**
   ```javascript
   import { PrintFonts } from "./../../../styles"; // عدّل المسار حسب موقع الملف
   ```

2. **استبدل كود الخطوط القديم:**
   
   **قبل:**
   ```javascript
   mywindow.document.write(
     "<html><head><title></title> <style>@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@500&display=swap'); body{font-family:Tajawal;font-size:12px;margin:0}  </style>"
   );
   ```
   
   **بعد:**
   ```javascript
   mywindow.document.write(
     "<html><head><title></title> <style>" +
       PrintFonts.getPrintFontsCSS() +
       "body{font-size:12px;margin:0} " +
       "</style>"
   );
   ```

3. **استبدل fontFamily في CSS المضمن:**
   - استبدل `font-family:Tajawal` بـ `font-family:JannaLTBold,BoutrosMBCDinkum,Arial,sans-serif`
   - أو استخدم `PrintFonts.getPrintFontFamily()` للحصول على القيمة

## الملفات التي تحتاج للتحديث

- ✅ `src/components/organisms/wagesReport/index.js` - تم التحديث
- ✅ `src/components/organisms/summaryData/annualReport/index.js` - تم التحديث
- ⚠️ `src/components/organisms/empCards/index.js`
- ⚠️ `src/components/organisms/transportReport/index.js`
- ⚠️ `src/components/organisms/generalTable/index.js`
- ⚠️ `src/components/organisms/deductionsReport/index.js`
- ⚠️ `src/components/organisms/bonusTable/index.js`
- ⚠️ وأي ملفات أخرى تحتوي على وظائف طباعة

## ملاحظات

- الخطوط موجودة في `public/fonts/` ويمكن الوصول إليها مباشرة
- لا حاجة لاستيراد ملف CSS في المكونات - الخطوط تُحمّل تلقائياً عبر الدوال
- الدوال تستخدم `window.location.origin` لضمان عمل الخطوط في جميع البيئات

