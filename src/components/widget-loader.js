// widget-loader.js
(function () {
  const translations = {
    uz: {
      siteName: "Finco",
      department: "Kadrlar bo'limi",
      openChat: "Bo'sh ish o'rinlari",
      placeholder: "Savol yozing...",
      loading: "Yuklanmoqda...",
      apply: "Ariza yuborish",
      uploadResume: "Resume yuklash",
      createResume: "Resume yaratish",
      fileReady: "Fayl tayyor",
      download: "Yuklab olish",
      errorUpload: "Fayl yuklashda xatolik",
      errorDownload: "Faylni yuklab olishda xatolik yuz berdi",
      errorApplication: "Ariza yuborishda xatolik yuz berdi",
      selectVacancy: "Vakansiya tanlanmagan",
      onlyPDF: "Faqat PDF fayllarni yuklashingiz mumkin",
      noVacancies: "Hozirda vakansiya mavjud emas",
      vacancySelected: "Siz \"{title}\" vakansiyasiga topshiryapsiz",
      frontendDescription: "React, TypeScript, Tailwind CSS bilan ishlash tajribasi kerak. Zamonaviy web ilovalarni yaratish.",
      backendDescription: "Node.js, Express, MongoDB bilan ishlash.",
    },
    ru: {
      siteName: "Finco",
      comrade: "Asco",
      department: "Отдел кадров",
      openChat: "Вакансии",
      placeholder: "Напишите вопрос...",
      loading: "Загружается...",
      apply: "Подать заявку",
      uploadResume: "Загрузить резюме",
      createResume: "Создать резюме",
      fileReady: "Файл готов",
      download: "Скачать",
      errorUpload: "Ошибка при загрузке файла",
      errorDownload: "Ошибка при скачивании файла",
      errorApplication: "Ошибка при отправке заявки",
      selectVacancy: "Вакансия не выбрана",
      onlyPDF: "Можно загружать только PDF файлы",
      noVacancies: "В настоящее время вакансий нет",
      vacancySelected: "Вакансия \"{title}\" выбрана",
      frontendDescription: "Требуется опыт работы с React, TypeScript, Tailwind CSS. Создание современных веб-приложений.",
      backendDescription: "Работа с Node.js, Express, MongoDB.",
    },
    en: {
      siteName: "Finco",
      department: "HR Department",
      openChat: "Job Openings",
      placeholder: "Type a question...",
      loading: "Loading...",
      apply: "Apply",
      uploadResume: "Upload Resume",
      createResume: "Create Resume",
      fileReady: "File is ready",
      download: "Download",
      errorUpload: "Error uploading file",
      errorDownload: "Error downloading file",
      errorApplication: "Error submitting application",
      selectVacancy: "No vacancy selected",
      onlyPDF: "Only PDF files can be uploaded",
      noVacancies: "No vacancies available at the moment",
      vacancySelected: "Vacancy \"{title}\" selected",
      frontendDescription: "Experience with React, TypeScript, Tailwind CSS required. Building modern web applications.",
      backendDescription: "Work with Node.js, Express, MongoDB.",
    },
  };

  window.CSW = {
    create: function (config) {
      const lang = ["uz", "ru", "en"].includes(config.lang) ? config.lang : "uz";
      const widgetConfig = {
        widgetUrl: config.widgetUrl || "",
        theme: config.theme || "",
        width: config.width || "420px",
        height: config.height || "620px",
        position: config.position || "right",
        siteName: config.siteName || "Finco",
        publicKey: config.publicKey || "",
        btnColor: config.btnColor || config.bntColor || "",
        btnTextColor: config.btnTextColor || config.textColor || "#fff",
        headerBg: config.headerBg || "",
        headerText: config.headerText || "",
        messageBg: config.messageBg || "",
        messageText: config.messageText || "",
        chatBg: config.chatBg || "",
        userMessageBg: config.userMessageBg || "",
        userMessageText: config.userMessageText || "",
        lang,
        translations,
      };

      window.WIDGET = widgetConfig; // Explicitly set window.WIDGET

      const iframe = document.createElement("iframe");
      iframe.src = widgetConfig.widgetUrl;
      iframe.style.width = widgetConfig.width;
      iframe.style.height = widgetConfig.height;
      iframe.style.position = "fixed";
      iframe.style[widgetConfig.position] = "10px";
      iframe.style.bottom = "10px";
      iframe.style.border = "none";
      iframe.style.zIndex = "1000";

      document.body.appendChild(iframe);

      iframe.onload = () => {
        iframe.contentWindow?.postMessage(
          { type: "WIDGET_CONFIG", config: widgetConfig },
          "*"
        );
      };

      return widgetConfig;
    },
  };
})();
