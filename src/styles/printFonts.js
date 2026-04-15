/**
 * دالة للحصول على كود CSS للخطوط المحلية للطباعة
 * يمكن استخدامها في وظائف الطباعة
 */
export const getPrintFontsCSS = () => {
  const fontBaseUrl = window.location.origin;

  return `
    @font-face { 
      font-family: 'JannaLTBold'; 
      src: url('${fontBaseUrl}/fonts/alfont_com_Janna-LT-Bold.ttf') format('truetype'); 
      font-weight: bold; 
      font-style: normal; 
      font-display: swap;
    }
    @font-face { 
      font-family: 'BoutrosMBCDinkum'; 
      src: url('${fontBaseUrl}/fonts/BoutrosMBCDinkum-Medium.ttf') format('truetype'); 
      font-weight: 500; 
      font-style: normal; 
      font-display: swap;
    }
    body,table,th,td,div,p,span,h1,h2,h3,h4,h5,h6 {
      font-family: JannaLTBold,BoutrosMBCDinkum,Arial,sans-serif;
    }
  `;
};

/**
 * دالة للحصول على font-family string للخطوط المحلية
 */
export const getPrintFontFamily = () => {
  return "JannaLTBold, BoutrosMBCDinkum, Arial, sans-serif";
};

/**
 * دالة مساعدة لإنشاء محتوى HTML للطباعة مع الخطوط المحلية
 */
export const createPrintHTML = (content, additionalStyles = "") => {
  const fontBaseUrl = window.location.origin;

  return `
    <html>
      <head>
        <title></title>
        <style>
          ${getPrintFontsCSS()}
          ${additionalStyles}
        </style>
      </head>
      <body dir="rtl" style="font-size:12px;font-family:${getPrintFontFamily()};">
        ${content}
      </body>
    </html>
  `;
};
