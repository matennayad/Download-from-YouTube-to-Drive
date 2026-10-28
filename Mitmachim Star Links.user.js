// ==UserScript==
// @name        מסיר ומוסיף כוכב*ות - מטען נייד
// @namespace   http://tampermonkey.net/
// @version     1.0
// @description מוסיף כוכביות לקישורים לדרייב, לג'מבו מייל ול-send.magicode.me בשליחת פוסט במתמחים טופ, ומסיר אותן בקריאה ובלחיצה
// @match       https://mitmachim.top/*
// @match       https://*.mitmachim.top/*
// @match       https://drive.google.com/*
// @match       https://jumbomail.me/*
// @match       https://*.jumbomail.me/*
// @match       https://send.magicode.me/*
// @icon        data:image/png;base64,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
// @homepageURL https://github.com/matennayad/Download-from-YouTube-to-Drive
// @downloadURL https://raw.githubusercontent.com/matennayad/Download-from-YouTube-to-Drive/main/Mitmachim%20Star%20Links.user.js
// @updateURL   https://raw.githubusercontent.com/matennayad/Download-from-YouTube-to-Drive/main/Mitmachim%20Star%20Links.user.js
// @run-at      document-start
// @sandbox     JavaScript
// @noframes
// @grant       unsafeWindow
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_addValueChangeListener
// @grant       GM_registerMenuCommand
// ==/UserScript==

(function () {
    'use strict';

    const page = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;

    const DEFAULTS = { unbreakLinks: true, breakLinks: true };

    function loadSettings() {
        const stored = {};
        for (const [key, value] of Object.entries(DEFAULTS)) stored[key] = GM_getValue(key, value);
        return stored;
    }

    let settings = loadSettings();

    // כוכביות בקישורים: השרת של מתמחים לא שומר קישורים לדרייב, לג'מבו מייל ול-send.magicode.me,
    // אז מכניסים לתוך הקישור רצף כוכביות - והוא נשמר כקישור "שבור".
    // מי שבלי התוסף מוחק את הכוכביות מהכתובת בעצמו, ומי שעם התוסף מקבל את הקישור המתוקן.
    const MfStars = (() => {
        const HOSTS = /^(?:[\w-]+\.)*(?:drive\.google\.com|jumbomail\.me|send\.magicode\.me)$/i;
        const MARKS = "*".repeat(10);
        // רצף סימונים: כל רצף שיש בו כוכבית, או שניים ומעלה מ-# @ & ברצף (# בודד יכול להיות חלק מקישור תקין)
        const MARK_RUN = /[*#@&]*\*[*#@&]*|[#@&]{2,}/g;
        const URL_PARTS = /^(https?:\/\/)([^/?]*)(.*)$/i;
        const HOST_WORD = "(?:[\\w-]+\\.)*(?:drive\\.google\\.com|jumbomail\\.me|send\\.magicode\\.me)";

        // הכתובת בלי הסימונים, רק לאתרים שהשרת חוסם
        function clean(href) {
            const m = String(href).replace(/%2a/gi, "*").match(URL_PARTS);
            if (!m) return href;
            const host = m[2].replace(MARK_RUN, "");
            if (!HOSTS.test(host)) return href;
            const fixed = m[1] + host + m[3].replace(MARK_RUN, "");
            return fixed === m[0] ? href : fixed;
        }

        const isBroken = (href) => clean(href) !== href;

        // רצף כוכביות באמצע המזהה של הקובץ (הקטע הארוך ביותר בכתובת)
        function breakUrl(href) {
            const m = href.match(URL_PARTS);
            if (!m || !HOSTS.test(m[2]) || /[*]/.test(m[3])) return href;
            let best = null;
            for (const part of m[3].matchAll(/[\w-]{4,}/g)) {
                if (!best || part[0].length > best[0].length) best = part;
            }
            if (!best) return href;
            const at = best.index + Math.floor(best[0].length / 2);
            return m[1] + m[2] + m[3].slice(0, at) + MARKS + m[3].slice(at);
        }

        // שובר את כל הקישורים לאתרים החסומים בטקסט של הפוסט (Markdown)
        const URL_IN_TEXT = new RegExp(`(?:https?:\\/\\/)?${HOST_WORD}\\/[^\\s<>()\\[\\]"'\`]*`, "gi");

        function breakText(text) {
            return String(text).replace(URL_IN_TEXT, (url, offset, all) => {
                // תווים שנחשבים לסוף משפט ולא לחלק מהקישור
                const tail = (url.match(/[.,;:!?]+$/) || [""])[0];
                const body = tail ? url.slice(0, -tail.length) : url;
                const before = all[offset - 1] || "";
                if (before && /[\w./@-]/.test(before)) return url;
                const full = /^https?:/i.test(body) ? body : "https://" + body;
                const broken = breakUrl(full);
                if (broken === full) return url;

                // [טקסט](כתובת) או <כתובת> - הכוכביות בתוך הכתובת לא נחשבות להדגשה
                if ((before === "(" && all[offset - 2] === "]") || (before === "<" && all[offset + body.length] === ">")) {
                    return (full === body ? broken : broken.replace(/^https:\/\//, "")) + tail;
                }
                // בתוך הטקסט של קישור - כוכביות עם \ לפניהן, כדי שיוצגו כמו שהן
                if (before === "[") return broken.replace(/\*/g, "\\*") + tail;
                // כתובת חופשית - עוטפים ב-<> כדי ששני קישורים באותו פוסט לא יהפכו את מה שביניהם להדגשה
                return `<${broken}>${tail}`;
            });
        }

        // כתובות שבורות בתוך טקסט שמוצג על המסך
        const BROKEN_IN_TEXT = new RegExp(`(?:https?:\\/\\/)?${HOST_WORD}[^\\s<>"']*`, "gi");

        function cleanText(text) {
            return String(text).replace(BROKEN_IN_TEXT, (url) => {
                if (!/[*#@&]/.test(url)) return url;
                const full = /^https?:/i.test(url) ? url : "https://" + url;
                const fixed = clean(full);
                return full === url ? fixed : fixed.replace(/^https:\/\//, "");
            });
        }

        // קישור בדף: הכתובת והטקסט שלו בלי הסימונים. מחזיר true אם הקישור שונה
        const originals = new WeakMap();
        const SELECTOR = 'a[href*="drive.google" i], a[href*="jumbomail" i], a[href*="magicode" i]';

        function fixLink(link) {
            if (originals.has(link)) return false;
            const raw = link.getAttribute("href");
            if (!raw || !isBroken(raw)) return false;
            originals.set(link, { href: raw, html: link.innerHTML });
            link.setAttribute("href", clean(raw));
            link.title = link.title || "הקישור תוקן אוטומטית (הוסרו הכוכביות)";
            const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
                const node = walker.currentNode;
                const fixed = cleanText(node.nodeValue);
                if (fixed !== node.nodeValue) node.nodeValue = fixed;
            }
            return true;
        }

        function restoreLink(link) {
            const orig = originals.get(link);
            if (!orig) return false;
            originals.delete(link);
            link.setAttribute("href", orig.href);
            link.innerHTML = orig.html;
            if (link.title === "הקישור תוקן אוטומטית (הוסרו הכוכביות)") link.removeAttribute("title");
            return true;
        }

        function fixAll(root = document) {
            for (const link of root.querySelectorAll(SELECTOR)) fixLink(link);
        }

        function restoreAll(root = document) {
            for (const link of root.querySelectorAll(SELECTOR)) restoreLink(link);
        }

        const isOriginalLink = (link) => originals.has(link);
        const originalHtml = (link) => originals.get(link)?.html;

        return { HOSTS, SELECTOR, clean, isBroken, breakUrl, breakText, cleanText, fixLink, restoreLink, fixAll, restoreAll, isOriginalLink, originalHtml };
    })();

    // דף שנפתח מקישור שבור (בדרייב, בג'מבו מייל או ב-magicode) - עוברים מיד לכתובת בלי הכוכביות.
    // באתרים האלה הסקריפט לא עושה שום דבר אחר
    if (!/(^|\.)mitmachim\.top$/i.test(location.hostname)) {
        const fixed = MfStars.clean(location.href);
        if (fixed !== location.href && settings.unbreakLinks) location.replace(fixed);
        return;
    }

    // =====================================================================
    // שליחת פוסט: הקישורים נשלחים לשרת עם כוכביות
    // =====================================================================
    // הקוד הזה צריך לרוץ בהקשר של הדף עצמו (@sandbox JavaScript) ולפני שהאתר נטען (@run-at document-start).

    const POST_API = /\/api\/v3\/(topics|posts|chats)\b/;

    function showToast(text) {
        if (!document.body) return;
        const toast = document.createElement("div");
        toast.className = "mf-toast";
        toast.textContent = text;
        toast.dir = "rtl";
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.opacity = "0"; }, 3500);
        setTimeout(() => toast.remove(), 3900);
    }

    function breakLinks(url, body) {
        if (typeof body !== "string" || !settings.breakLinks || !POST_API.test(String(url))) return body;
        let data;
        try { data = JSON.parse(body); } catch (e) { return body; }
        if (!data || typeof data !== "object") return body;
        let changed = false;
        for (const key of ["content", "message"]) {
            if (typeof data[key] !== "string") continue;
            const broken = MfStars.breakText(data[key]);
            if (broken !== data[key]) { data[key] = broken; changed = true; }
        }
        if (!changed) return body;
        console.info("[מסיר ומוסיף כוכב*ות] נוספו כוכביות לקישורים, כדי שהשרת ישמור אותם");
        showToast("✓ הקישור נשמר עם כוכביות - מי שיש לו את הסקריפט יקבל אותו מתוקן");
        return JSON.stringify(data);
    }

    const origOpen = page.XMLHttpRequest.prototype.open;
    page.XMLHttpRequest.prototype.open = function (method, url) {
        this.__mfUrl = url;
        return origOpen.apply(this, arguments);
    };

    const origSend = page.XMLHttpRequest.prototype.send;
    page.XMLHttpRequest.prototype.send = function (body) {
        return origSend.call(this, breakLinks(this.__mfUrl, body));
    };

    const origFetch = page.fetch;
    page.fetch = function (input, init) {
        if (init && typeof init.body === "string") {
            const body = breakLinks(typeof input === "string" ? input : input?.url || String(input), init.body);
            if (body !== init.body) init = { ...init, body };
        }
        return origFetch.call(this, input, init);
    };

    // =====================================================================
    // קריאה: קישורים שנשמרו עם כוכביות מוצגים ונפתחים בלי הכוכביות
    // =====================================================================

    function scan() {
        if (settings.unbreakLinks) MfStars.fixAll();
        else MfStars.restoreAll();
    }

    // =====================================================================
    // חלון הגדרות (נפתח מתפריט Tampermonkey)
    // =====================================================================

    const PROFILE_URL = "https://mitmachim.top/user/%D7%9E%D7%98%D7%A2%D7%9F-%D7%A0%D7%99%D7%99%D7%93";
    const FULL_POST_URL = "https://mitmachim.top/post/1270728";

    const SETTINGS_HTML = `
      <div class="mfs-dialog" role="dialog" aria-modal="true" aria-label="הגדרות">
        <button type="button" class="mfs-close" aria-label="סגירה">✕</button>
        <h2>מסיר ומוסיף כוכב*ות</h2>
        <p class="mfs-sub">קישורים לדרייב, לג'מבו מייל ול-send.magicode.me במתמחים טופ</p>

        <section class="mfs-card">
          <label class="mfs-row"><span class="mfs-text"><span class="mfs-name">הסרת כוכביות מקישורים</span>
            <span class="mfs-desc">קישור שנשמר באתר עם כוכביות (* # @ &amp;) מוצג ונפתח בלי הכוכביות. גם דף שגיאה שנפתח מקישור כזה עובר מיד לקובץ האמיתי.</span></span>
            <input type="checkbox" class="mfs-switch" data-key="unbreakLinks"></label>
          <label class="mfs-row"><span class="mfs-text"><span class="mfs-name">הוספת כוכביות בשליחת פוסט</span>
            <span class="mfs-desc">השרת לא שומר קישורים לאתרים האלה, אז מדביקים קישור רגיל והסקריפט מכניס לתוכו כוכביות ברגע השליחה. מי שאין לו את הסקריפט רואה את הכוכביות ומוחק אותן מהכתובת בעצמו.</span></span>
            <input type="checkbox" class="mfs-switch" data-key="breakLinks"></label>
        </section>

        <section class="mfs-card mfs-promo">
          <span class="mfs-text"><span class="mfs-name">מומלץ: התוסף המלא למתמחים טופ</span>
            <span class="mfs-desc">הכלי הזה הוא חלק מהתוסף המלא, שמוסיף גם תיקון ZIP ו-APK בהורדה ובהעלאה, תצוגה של קבצים, תמונות וקישורים בסוף כל פוסט, באנרים לקישורים ועוד. מי שמתקין את התוסף המלא לא צריך את הכלי הזה בנפרד.</span></span>
          <a class="mfs-promo-btn" href="${FULL_POST_URL}" target="_blank" rel="noopener" data-ajaxify="false">לפרטים והתקנה</a>
        </section>

        <p class="mfs-status" role="status"></p>
        <footer class="mfs-footer">
          <span>פותח על ידי מטען נייד</span>
          <span>לפרופיל שלי במתמחים לחצו <a href="${PROFILE_URL}" target="_blank" rel="noopener" data-ajaxify="false">כאן</a></span>
        </footer>
      </div>`;

    function openSettings() {
        if (document.querySelector(".mfs-overlay")) return;
        const overlay = document.createElement("div");
        overlay.className = "mfs-overlay";
        overlay.dir = "rtl";
        overlay.innerHTML = SETTINGS_HTML;
        document.body.appendChild(overlay);

        const status = overlay.querySelector(".mfs-status");
        let statusTimer = null;
        const saved = () => {
            status.textContent = "נשמר";
            clearTimeout(statusTimer);
            statusTimer = setTimeout(() => { status.textContent = ""; }, 2000);
        };

        for (const box of overlay.querySelectorAll(".mfs-switch")) {
            box.checked = !!settings[box.dataset.key];
            box.addEventListener("change", () => {
                GM_setValue(box.dataset.key, box.checked);
                applySetting(box.dataset.key, box.checked);
                saved();
            });
        }

        const close = () => {
            overlay.remove();
            document.removeEventListener("keydown", onKey, true);
        };
        const onKey = (e) => { if (e.key === "Escape") close(); };
        document.addEventListener("keydown", onKey, true);
        overlay.querySelector(".mfs-close").addEventListener("click", close);
        overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
        overlay.querySelector(".mfs-close").focus();
    }

    function applySetting(key, value) {
        if (settings[key] === value) return;
        settings = { ...settings, [key]: value };
        if (document.body) scan();
    }

    GM_registerMenuCommand("הגדרות", openSettings);

    // שינוי בחלון ההגדרות בלשונית אחת מתעדכן מיד בכל הלשוניות הפתוחות
    if (typeof GM_addValueChangeListener === "function") {
        for (const key of Object.keys(DEFAULTS)) {
            GM_addValueChangeListener(key, (name, oldValue, newValue, remote) => {
                if (remote) applySetting(key, newValue);
            });
        }
    }

    // =====================================================================
    // הפעלה
    // =====================================================================

    const CSS_TEXT = `
.mf-toast {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 2147483647;
  max-width: 420px;
  padding: 10px 16px;
  border-radius: 10px;
  background: #0b5ed7;
  color: #fff;
  font: 14px/1.4 "Segoe UI", Arial, sans-serif;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  transition: opacity 0.3s;
  word-break: break-all;
}

/* ---- חלון ההגדרות ---- */

.mfs-overlay {
  --mfs-bg: #f4f6f9;
  --mfs-card: #ffffff;
  --mfs-text: #1f2933;
  --mfs-muted: #66727f;
  --mfs-border: #e1e6ec;
  --mfs-accent: #0d6efd;
  --mfs-off: #c3cad3;
  position: fixed;
  inset: 0;
  z-index: 2147483646;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  padding: 40px 16px;
  background: rgba(15, 20, 25, 0.45);
  font: 15px/1.5 "Segoe UI", Arial, sans-serif;
}

[data-bs-theme="dark"] .mfs-overlay {
  --mfs-bg: #15181c;
  --mfs-card: #1f2329;
  --mfs-text: #e6e9ed;
  --mfs-muted: #9aa5b1;
  --mfs-border: #2e343c;
  --mfs-accent: #4d94ff;
  --mfs-off: #4a525c;
}

.mfs-dialog {
  position: relative;
  width: 560px;
  max-width: 100%;
  padding: 24px 20px 16px;
  border-radius: 14px;
  background: var(--mfs-bg);
  color: var(--mfs-text);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  text-align: right;
}

.mfs-dialog * {
  box-sizing: border-box;
}

.mfs-dialog h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--mfs-text);
}

.mfs-sub {
  margin: 4px 0 18px;
  color: var(--mfs-muted);
}

.mfs-close {
  position: absolute;
  top: 14px;
  left: 14px;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--mfs-muted);
  font-size: 16px;
  cursor: pointer;
}

.mfs-close:hover,
.mfs-close:focus-visible {
  background: var(--mfs-border);
  outline: none;
}

.mfs-card {
  margin-bottom: 14px;
  border: 1px solid var(--mfs-border);
  border-radius: 12px;
  background: var(--mfs-card);
}

.mfs-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0;
  padding: 14px 16px;
  cursor: pointer;
}

.mfs-row + .mfs-row {
  border-top: 1px solid var(--mfs-border);
}

.mfs-static {
  cursor: default;
  padding-bottom: 8px;
}

.mfs-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mfs-name {
  font-weight: 600;
}

.mfs-desc {
  font-size: 13px;
  color: var(--mfs-muted);
}

.mfs-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 16px;
}

.mfs-switch {
  appearance: none;
  flex: none;
  position: relative;
  width: 42px;
  height: 24px;
  margin: 0;
  border-radius: 12px;
  background: var(--mfs-off);
  cursor: pointer;
  transition: background 0.15s;
}

.mfs-switch::after {
  content: "";
  position: absolute;
  top: 3px;
  right: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  transition: transform 0.15s;
}

.mfs-switch:checked {
  background: var(--mfs-accent);
}

.mfs-switch:checked::after {
  transform: translateX(-18px);
}

.mfs-switch:focus-visible {
  outline: 2px solid var(--mfs-accent);
  outline-offset: 2px;
}

.mfs-status {
  min-height: 1.4em;
  margin: 0;
  font-size: 13px;
  color: var(--mfs-muted);
  text-align: center;
}

.mfs-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 13px;
  color: var(--mfs-muted);
}

.mfs-footer a {
  color: var(--mfs-accent);
  font-weight: 600;
}

.mfs-promo {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-color: rgba(13, 110, 253, 0.35);
  background: rgba(13, 110, 253, 0.07);
}

.mfs-promo-btn {
  flex: none;
  padding: 7px 14px;
  border-radius: 999px;
  background: #0d6efd;
  color: #fff !important;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none !important;
  white-space: nowrap;
}

.mfs-promo-btn:hover,
.mfs-promo-btn:focus-visible {
  filter: brightness(1.1);
}

@media (max-width: 480px) {
  .mfs-promo {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
}
    `;

    function addStyle() {
        const style = document.createElement("style");
        style.id = "mf-stars-style";
        style.textContent = CSS_TEXT;
        (document.head || document.documentElement).appendChild(style);
    }

    function start() {
        addStyle();
        let pending = null;
        new MutationObserver(() => {
            if (pending) return;
            pending = setTimeout(() => { pending = null; scan(); }, 150);
        }).observe(document.documentElement, { childList: true, subtree: true });
        scan();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
})();
