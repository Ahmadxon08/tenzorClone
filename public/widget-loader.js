(function (global) {
  function createWidget(opts) {
    var cfg = Object.assign(
      {
        width: "370px",
        height: "500px",
        collapsedWidth: "200px",
        collapsedHeight: "36px",

        widgetUrl: (function () {
          try {
            return window.location.origin + "/widget.html";
          } catch {
            return "/widget.html";
          }
        })(),
        position: "right",
        theme: "",
        id: "",
        siteName: "",
        publicKey: "",
        btnColor: "",
        btnTextColor: "",
        headerBg: "",
        headerText: "",
        messageBg: "",
        messageText: "",
        chatBg: "",
        userMessageBg: "",
        userMessageText: "",
        bntColor: "",
        textColor: "",
      },
      opts || {}
    );

    if (!cfg.btnColor && cfg.bntColor) cfg.btnColor = cfg.bntColor;
    if (!cfg.btnTextColor && cfg.textColor) cfg.btnTextColor = cfg.textColor;
    if (cfg.openWidget === undefined && cfg.autoOpen !== undefined) {
      cfg.openWidget = cfg.autoOpen;
    }
    if (!cfg.vacancyTitle && cfg.title) {
      cfg.vacancyTitle = cfg.title;
    }
    try {
      cfg.sourceUrl = window.location.href || "";
      cfg.sourceOrigin = window.location.origin || "";
      cfg.referrer = document.referrer || "";
    } catch (err) {
      cfg.sourceUrl = cfg.sourceUrl || "";
      cfg.sourceOrigin = cfg.sourceOrigin || "";
      cfg.referrer = cfg.referrer || "";
    }

    // Global styles (bir martalik)
    if (!document.getElementById("csw-widget-styles")) {
      var style = document.createElement("style");
      style.id = "csw-widget-styles";
      style.innerHTML = `
        .csw-widget-iframe-wrap{
          position: fixed;
          bottom: 0;
          right: 16px;
          z-index: 2147483646;
          transition: width .25s ease, height .25s ease, transform .25s ease, opacity .25s ease, background .2s ease, box-shadow .2s ease, border-radius .2s ease, border-color .2s ease;
          /* COLLAPSED holatda mutlaqo shaffof, oq blok ko'rinmaydi */
          background: transparent !important;
          border-radius: 20px 20px 0 0;
          box-shadow: none;
          border: 0;
          overflow: hidden;
        }
        /* EXPANDED bo'lganda klass qo'shamiz */
        .csw-widget-iframe-wrap.is-expanded{
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(2,6,23,0.35);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .csw-widget-iframe {
          width:100%; height:100%; border:0; display:block;
          background: transparent !important; /* iframe ichiga oq fon o'tmaydi */
        }
      `;
      document.head.appendChild(style);
    }

    var wrap = document.createElement("div");
    wrap.className = "csw-widget-iframe-wrap";
    
    var isOpen = cfg.openWidget === "true" || cfg.openWidget === true;
    
    wrap.style.width = isOpen ? cfg.width : cfg.collapsedWidth;
    wrap.style.height = isOpen ? cfg.height : cfg.collapsedHeight;
    
    if (isOpen) {
      wrap.classList.add("is-expanded");
    }
    wrap.style[cfg.position === "left" ? "left" : "right"] = "16px";
    if (cfg.position === "left") {
      wrap.style.right = "";
    }

    var iframe = document.createElement("iframe");
    iframe.className = "csw-widget-iframe";
    iframe.loading = "lazy";
    iframe.setAttribute("title", "JobX widget");
    iframe.setAttribute("allowTransparency", "true");
    iframe.setAttribute("allow", "clipboard-read; clipboard-write");
iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups");
    iframe.style.background = "transparent";

    // Query params
    var params = new URLSearchParams();
    params.set("theme", cfg.theme || "");
    params.set("id", cfg.id || "");
    if (cfg.siteName) params.set("siteName", cfg.siteName);
    if (cfg.publicKey) params.set("publicKey", cfg.publicKey);
    if (cfg.btnColor) params.set("btnColor", cfg.btnColor);
    if (cfg.btnTextColor) params.set("btnTextColor", cfg.btnTextColor);
    if (cfg.headerBg) params.set("headerBg", cfg.headerBg);
    if (cfg.headerText) params.set("headerText", cfg.headerText);
    if (cfg.messageBg) params.set("messageBg", cfg.messageBg);
    if (cfg.messageText) params.set("messageText", cfg.messageText);
    if (cfg.chatBg) params.set("chatBg", cfg.chatBg);
    if (cfg.userMessageBg) params.set("userMessageBg", cfg.userMessageBg);
    if (cfg.userMessageText) params.set("userMessageText", cfg.userMessageText);
    if (cfg.bntColor) params.set("bntColor", cfg.bntColor);
    if (cfg.textColor) params.set("textColor", cfg.textColor);
    if (cfg.sourceUrl) params.set("sourceUrl", cfg.sourceUrl);
    if (cfg.sourceOrigin) params.set("sourceOrigin", cfg.sourceOrigin);
    if (cfg.referrer) params.set("referrer", cfg.referrer);
    if (cfg.vacancyId) params.set("vacancyId", cfg.vacancyId);
if (cfg.vacancyTitle) params.set("title", cfg.vacancyTitle);
if (cfg.openWidget) params.set("openWidget", cfg.openWidget);
    params.set("transparent", "1");

    iframe.src = cfg.widgetUrl + "?" + params.toString();
    
    // Add favicon to the iframe
    iframe.onload = function() {
      const link = iframe.contentDocument.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      link.href = '/jobX.svg';
      iframe.contentDocument.head.appendChild(link);
    };

    wrap.appendChild(iframe);
    document.body.appendChild(wrap);
    function applyExpandedStyles(isExpanded) {
      if (isExpanded) {
        wrap.classList.add("is-expanded");
      } else {
        wrap.classList.remove("is-expanded");
      }
    }
    function expand() {
      wrap.style.width = cfg.width;
      wrap.style.height = cfg.height;
      applyExpandedStyles(true);
      iframe.contentWindow.postMessage({ type: "CSW_OPEN" }, "*");
    }
    function collapse() {
      wrap.style.width = cfg.collapsedWidth;
      wrap.style.height = cfg.collapsedHeight;
      applyExpandedStyles(false);
    }

    // iframe ichidan signallar
    function onMsg(ev) {
      var data = ev && ev.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "CSW_OPEN") expand();
      else if (data.type === "CSW_CLOSE") collapse();
      else if (data.type === "CSW_TOGGLE") {
        var expandedNow =
          wrap.style.width === cfg.width && wrap.style.height === cfg.height;
        expandedNow ? collapse() : expand();
      }
    }
    window.addEventListener("message", onMsg, false);

    // INIT
    iframe.onload = function () {
      // Boshlanishda collapsed holatni qat'iy ushlab turamiz (oq blok yo'q bo'lsin)
      if (cfg.openWidget === "true" || cfg.openWidget === true) {
    expand(); 
  } else {
    collapse(); 
  }
      try {
        var origin = new URL(cfg.widgetUrl, window.location.origin).origin;
        iframe.contentWindow.postMessage(
          { type: "CSW_INIT", payload: cfg },
          origin
        );
      } catch (e) {
        try {
          iframe.contentWindow.postMessage(
            { type: "CSW_INIT", payload: cfg },
            "*"
          );
        } catch (e2) {}
      }
    };

    var inst = {
      iframe: iframe,
      open: expand,
      close: collapse,
      toggle: function () {
        var expandedNow =
          wrap.style.width === cfg.width && wrap.style.height === cfg.height;
        expandedNow ? collapse() : expand();
      },
      destroy: function () {
        window.removeEventListener("message", onMsg, false);
        wrap.remove();
      },
    };

    global.CSW = global.CSW || {};
    global.CSW._instance = inst;
    global.CSW._initialized = true;

    return inst;
  }

  global.CSW = global.CSW || {};
  global.CSW.create = createWidget;

  try {
    var scriptTag =
      document.currentScript ||
      (function () {
        var s = document.getElementsByTagName("script");
        return s[s.length - 1];
      })();
    var get = (name) =>
      scriptTag && scriptTag.getAttribute && scriptTag.getAttribute(name);

    var dataUrl = get("data-widget-url");
    var dataTheme = get("data-theme");
    var dataWidth = get("data-width");
    var dataHeight = get("data-height");
    var dataCollapsedW = get("data-collapsed-width");
    var dataCollapsedH = get("data-collapsed-height");
    var dataPos = get("data-position");
    var dataSite = get("data-site-name");
    var dataPublic = get("data-public-key");
    var dataBtn = get("data-btn-color");
    var dataBtnText = get("data-btn-text-color");
    var dataHeaderBg = get("data-header-bg");
    var dataHeaderText = get("data-header-text");
    var dataMessageBg = get("data-message-bg");
    var dataMessageText = get("data-message-text");
    var dataChatBg = get("data-chat-bg");
    var dataUserMessageBg = get("data-user-message-bg");
    var dataUserMessageTx = get("data-user-message-text");
    var dataBnt = get("data-bnt-color");
    var dataText = get("data-text-color");

    setTimeout(function () {
      if (!global.CSW._initialized) {
        var cfg = {};
        if (dataUrl) cfg.widgetUrl = dataUrl;
        if (dataTheme) cfg.theme = dataTheme;
        if (dataWidth) cfg.width = dataWidth;
        if (dataHeight) cfg.height = dataHeight;
        if (dataCollapsedW) cfg.collapsedWidth = dataCollapsedW;
        if (dataCollapsedH) cfg.collapsedHeight = dataCollapsedH;
        if (dataPos) cfg.position = dataPos;
        if (dataSite) cfg.siteName = dataSite;
        if (dataPublic) cfg.publicKey = dataPublic;
        if (dataBtn) cfg.btnColor = dataBtn;
        if (dataBtnText) cfg.btnTextColor = dataBtnText;
        if (dataHeaderBg) cfg.headerBg = dataHeaderBg;
        if (dataHeaderText) cfg.headerText = dataHeaderText;
        if (dataMessageBg) cfg.messageBg = dataMessageBg;
        if (dataMessageText) cfg.messageText = dataMessageText;
        if (dataChatBg) cfg.chatBg = dataChatBg;
        if (dataUserMessageBg) cfg.userMessageBg = dataUserMessageBg;
        if (dataUserMessageTx) cfg.userMessageText = dataUserMessageTx;
        if (dataBnt) cfg.bntColor = dataBnt;
        if (dataText) cfg.textColor = dataText;

        try {
          cfg.sourceUrl = window.location.href || "";
          cfg.sourceOrigin = window.location.origin || "";
          cfg.referrer = document.referrer || "";
        } catch (e) {}
        var inst = createWidget(cfg);
        global.CSW._initialized = true;
        global.CSW._instance = inst;
      }
    }, 50);
  } catch (e) {
    console.error("CSW auto-init error", e);
  }
})(window);
