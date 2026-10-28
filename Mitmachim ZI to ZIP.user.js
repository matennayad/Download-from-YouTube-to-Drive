// ==UserScript==
// @name        תיקון ZI ל-ZIP במתמחים טופ - מטען נייד
// @namespace   http://tampermonkey.net/
// @version     1.7
// @description העלאת ZIP כ-ZIP אמיתי, הורדת ZI ו-AP כ-ZIP ו-APK, תצוגת קבצים מצורפים, באנר לקישורים לנושאים וספויילרים בהמשך השורה, וכוכביות בקישורים לדרייב, לג'מבו מייל ול-magicode
// @match       https://mitmachim.top/*
// @match       https://*.mitmachim.top/*
// @match       https://drive.google.com/*
// @match       https://jumbomail.me/*
// @match       https://*.jumbomail.me/*
// @match       https://send.magicode.me/*
// @icon        data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAGy0lEQVR4nNRaa2xURRT+7vaFQIVKYyDBQqBNQ0xDoAW2bcCChpgYQSNgNDGCMRBJJJqY+AcNUaMCxsTHD0UFosHEH+AfQSM/fBDTaGooMRpseQci8rC1LbawuzOe+5g7c+/M7F3a3RpPuzt3zsydOd+Zc849M3dT+J9TeSGdWraPNKayTjNdNgDMYUy0MPHvE/evmOwQuaYKmDqwqAd9/GtwGqgXLNt1/M2ZPUggx9awZMdIg5Mre4NzvpwGrGac+zKK0pvUoToL6rH2m+Qz4jseFu6X3CsHqf5NjrHnTr19R29BAJrf5xUVfdnn6XIrTVLFPYV43/5kXEzKFaHifMj2Avv7PH+eSOl/rpOoL00Zvrjz510tGSuA9u03WnIcu4nd5C69Q39MaIwHmmGynqhhJ3mlvHkcyWfKON780fl+IfYTp96t6xIyp1QAOeasoX5NchIW1ZgmrFrGNa72l+Nw0/1M5SvjxJXFeRN93wPTCrS+nmmj7kfoppSwwegkUpMTKoB501Oe5sDzgdLb+4Zy6P0zZ7P5gO8YVjqYH+wGHL749Dtzjrn8MApRx43UmtKE4FHzeDRdgS13V6KiDKOic1eB3d8N4bPOa2bQHBGzjZYev5Kqz1K53q2kFAAdorNYTie8STrgQwvLRy28S2U06H3zJ2PtkomIzmcR2tU81wJAhxjPA7Box9B0Ys/SbN6godm1KYyV3NHuX1CNNelJSLB5vfTlmjV78+npIQAnW5HWHYzJ8IbAITmKRu5QqwjEOgLhwODgCWBy2Vw6BKCaTzTamAcpKoiFU7A2Lc0JiSC4Jx8FkI4QAHl9v83mheaLLbwKYnXzVKxrnSyFjts8EAvhFIt4rj8E4IWsQuP8GGnyBBhBPNBCINqq9Xl5VPNqewjAZ7KYDZoceewAbiVrqSU5y1M6iAcJxCPtCSCE8EFW6D8H3BVwbDbPi+oDrpnOud3enmMTse/I37H5odSjcqgPMr+0mVGQ25SchLAil7L4gkjMy/0Kop1U5Fy/udQkbV6txywiUKZcgbwOXBzzKYTELPmjEMJNUHnQqjTabI6PE4hYtPH+7b6o5kJRYS0Ps/Eh2+ZHZslMjUIydYWCGP8ZiLxRkCdFIUMKe+ekbiyZ8j2qUiNAz0QUhRxa/KmLgWkryA4qFemDwuKToX2rUcgMwkd+b+3n2Nm4UXYybq3HQHWbgKb3oMsR88VA89xnhFFI+oAF8YqaQygpXf5K56k2b9xz89DsZS4EAYJHbH5a1WXzxPVbaWfC5Wf5Kd8kVv5FeyZ61K7sC9porGW0+5u5wTzO8FlNejm/7WgmMQpB5v82vz3xCnCQ1vEwCTtyAbjwMTFpq1ZRg3B9j5HQX9KmpZ8OERpfRiFkew6wWJYsnr4+AMYQ17xa5qUFnwIDR8m5t5nb2TBwg1aRZ1Ao6fsSbuS7lJgLIV8G2vAicEsdnWU0m9vn7/E/GTKnX59GYdLH5AlOL+R+JeDbcqHQy5GwArctBWaTUJ3LKIUcMvdxTej8XtwsWTUPJTrZciEoNuchts3S+Co5ay1w12+S19mBYhGzaV5IH8mFTHtPnrACnUvN/IOBar6uwWjJJkfcrFzywyh0bxcrcejiKpSUZjwcqZoSN64ILaIj03Zk3rGhjviLS6sxqWwI6ZofMCE1jMX1VSgKiVSi7kmtyWjz0E/sJADoNifOKgcz1fjo3FP44Mwmr1/vYzNRUlKikLR9xxAd41HIaGvBco13Nmo4ao/L5QSiyGTO6CjOzT3UikQciiVY3j+I0O8BcBg/7q+CYnMcKPXJHCzii2yUcfvzwGHOcZfnRaEcZ92R5YHq/eIJzYDxWwT7m58ARJY73SGAnuoZPWRT/4Q2z/Kez5eckl4Q0sXwYFNzTwgA2+jNKWefwCR07Kyy+8x1lJK6eq8h/lIFsY0+mdYuV2YJgMgpS22lxiuik61862Afjp6+jmK7w0iG43D3APZ9e9X+JPZBXKnMZF8I5VYHaXjm/Hoynz1+Z/e40dGPuCNvH7XBNceX78BY9F2YwvfjfNxszXySb8Pggda9RgAuzd1y7ifqvEg1m6hGDO+BwaH154hkt7KPqCOMNuacx8jvGtifXqTKq70vmjpyqZ1ueo3uyZk1rAwOfZmZ0fFNuQ2P5Db5bB7umS9jOwamlbfF5bUe187dfKaNXoZ+SGPNi2hPEz4mXKBhKax+r7aC8fEQ4f9OoB4f2N/6o0nOxPPmORtP1uVSvJ4UU09DzqBTYTcNC7PB8Ocb4gcb6g9BIEJySvlBR1J/V27+B811wsllT/YfaD+bT77xODAvKf0LAAD//zfEoEIAAAAGSURBVAMAWj6ybK7QrXsAAAAASUVORK5CYII=
// @homepageURL https://github.com/matennayad/Download-from-YouTube-to-Drive
// @downloadURL https://raw.githubusercontent.com/matennayad/Download-from-YouTube-to-Drive/main/Mitmachim%20ZI%20to%20ZIP.user.js
// @updateURL   https://raw.githubusercontent.com/matennayad/Download-from-YouTube-to-Drive/main/Mitmachim%20ZI%20to%20ZIP.user.js
// @run-at      document-start
// @sandbox     JavaScript
// @noframes
// @grant       unsafeWindow
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_addValueChangeListener
// @grant       GM_registerMenuCommand
// @grant       GM_xmlhttpRequest
// @connect     *
// ==/UserScript==

(function () {
    'use strict';

    const page = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;

    // display: "button" - כפתור שפותח את התצוגה, "always" - תמיד פתוח, "off" - בלי תצוגה
    const DEFAULTS = { display: "button", files: true, images: true, links: false, topics: true, fileBanners: true, unbreakLinks: true, breakLinks: true };

    function loadSettings() {
        const stored = {};
        for (const [key, value] of Object.entries(DEFAULTS)) stored[key] = GM_getValue(key, value);
        return stored;
    }

    // =====================================================================
    // כוכביות בקישורים
    // =====================================================================

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
        if (fixed !== location.href && GM_getValue("unbreakLinks", true)) location.replace(fixed);
        return;
    }

    // =====================================================================
    // העלאה: ZIP עולה כ-ZIP אמיתי
    // =====================================================================
    // השרת דוחה ZIP כי Windows מדווח עליו כ-application/x-zip-compressed, והשרת מצפה ל-application/zip.
    // שולחים ZIP אמיתי עם הסוג שהשרת מצפה לו, כך שגם מי שאין לו את הסקריפט מוריד ZIP.
    // הקוד הזה צריך לרוץ בהקשר של הדף עצמו (@sandbox JavaScript) ולפני שהאתר נטען (@run-at document-start).

    const UPLOAD_FIXES = [
        { re: /\.zip$/i, ext: ".zip", type: "application/zip" }
    ];

    function fixFile(file) {
        if (!(file instanceof page.File)) return file;
        const fix = UPLOAD_FIXES.find((f) => f.re.test(file.name));
        if (!fix) return file;
        const name = file.name.replace(fix.re, fix.ext);
        if (name === file.name && file.type === fix.type) return file;
        return new page.File([file], name, { type: fix.type, lastModified: file.lastModified });
    }

    // הודעה קטנה שמאשרת שהקובץ תוקן
    function notify(names) {
        if (!names.length) return;
        console.info("[תיקון ZI ל-ZIP] הקבצים הועלו בתור:", names.join(", "));
        showToast(`✓ הועלה בתור: ${names.join(", ")}`);
    }

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

    function fixFormData(fd) {
        const renamed = [];
        const out = new page.FormData();
        for (const [key, value] of fd.entries()) {
            const fixed = fixFile(value);
            if (fixed !== value) renamed.push(fixed.name);
            if (fixed instanceof page.File) out.append(key, fixed, fixed.name);
            else out.append(key, fixed);
        }
        notify(renamed);
        return renamed.length ? out : fd;
    }

    // בחירת קובץ דרך חלון "העלאה" - מחליפים כבר בשלב הבחירה
    page.addEventListener("change", (e) => {
        const input = e.target;
        if (!(input instanceof page.HTMLInputElement) || input.type !== "file" || !input.files?.length) return;
        const files = [...input.files];
        const fixed = files.map(fixFile);
        if (fixed.every((f, i) => f === files[i])) return;
        const dt = new page.DataTransfer();
        fixed.forEach((f) => dt.items.add(f));
        input.files = dt.files;
        notify(fixed.filter((f, i) => f !== files[i]).map((f) => f.name));
    }, true);

    // גרירה, הדבקה וכל העלאה אחרת - מתקנים ברגע השליחה
    // קישור לדרייב, לג'מבו מייל או ל-send.magicode.me נשלח לשרת עם כוכביות, כי השרת לא שומר אותם כמו שהם
    const POST_API = /\/api\/v3\/(topics|posts|chats)\b/;

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
        console.info("[תיקון ZI ל-ZIP] נוספו כוכביות לקישורים, כדי שהשרת ישמור אותם");
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
        if (body instanceof page.FormData) body = fixFormData(body);
        else body = breakLinks(this.__mfUrl, body);
        return origSend.call(this, body);
    };

    const origFetch = page.fetch;
    page.fetch = function (input, init) {
        if (init && init.body instanceof page.FormData) {
            init = { ...init, body: fixFormData(init.body) };
        } else if (init && typeof init.body === "string") {
            const body = breakLinks(typeof input === "string" ? input : input?.url || String(input), init.body);
            if (body !== init.body) init = { ...init, body };
        }
        return origFetch.call(this, input, init);
    };

    // =====================================================================
    // הורדה: קבצי ZI ו-AP יורדים כ-ZIP ו-APK
    // =====================================================================

    const UPLOAD_PATH = /\/assets\/uploads\/files\//i;

    // כל צורה של הסיומת (zi, ZI, ziP...) -> סיומת אחידה באותיות קטנות
    const NAME_FIXES = [
        { re: /\.zip?$/i, ext: ".zip" },
        { re: /\.apk?$/i, ext: ".apk" }
    ];

    function fixName(name) {
        for (const fix of NAME_FIXES) {
            if (fix.re.test(name)) return name.replace(fix.re, fix.ext);
        }
        return name;
    }

    function isSiteHost(host) {
        return host === "mitmachim.top" || host.endsWith(".mitmachim.top");
    }

    function toUrl(href) {
        if (!href) return null;
        try {
            const url = new URL(href, location.href);
            return /^https?:$/.test(url.protocol) ? url : null;
        } catch (e) {
            return null;
        }
    }

    function nameFromUrl(url) {
        let base = url.pathname.split("/").pop();
        try { base = decodeURIComponent(base); } catch (e) {}
        // השרת מוסיף מספר בתחילת השם
        return base.replace(/^\d+-/, "") || url.hostname;
    }

    // קישור שלא מחובר לדף, כדי שהאתר לא יתפוס את הלחיצה וינווט במקום להוריד
    function triggerDownload(href, name) {
        const a = document.createElement("a");
        a.href = href;
        a.download = name;
        a.setAttribute("data-ajaxify", "false");
        a.click();
    }

    document.addEventListener("click", (e) => {
        if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
        const link = e.target.closest && e.target.closest("a[href]");
        if (!link || link.classList.contains("mf-file")) return;
        const url = toUrl(link.getAttribute("href"));
        if (!url || url.origin !== location.origin || !UPLOAD_PATH.test(url.pathname)) return;
        // ההחלטה לפי הכתובת (הטקסט בפוסט אולי כבר תוקן לתצוגה), והשם לפי הטקסט שבפוסט
        const serverName = nameFromUrl(url);
        if (fixName(serverName) === serverName) return;
        e.preventDefault();
        e.stopPropagation();
        triggerDownload(url.href, fixName(nameFromLink(link, url)));
    }, true);

    // =====================================================================
    // תצוגה: קבצים מצורפים, באנרים לנושאים וספויילרים
    // =====================================================================

    const IMAGE_EXT = /\.(png|jpe?g|gif|webp|bmp|svg|avif|ico)$/i;
    const MAX_LINKS = 5;
    let settings = loadSettings();

    const TYPE_COLORS = [
        { re: /^(zip|rar|7z|tar|gz|bz2|xz)$/, color: "#e0a100" },
        { re: /^(apk|apks|xapk)$/, color: "#2fb76a" },
        { re: /^pdf$/, color: "#d93025" },
        { re: /^(doc|docx|odt|rtf)$/, color: "#2b579a" },
        { re: /^(xls|xlsx|ods|csv)$/, color: "#217346" },
        { re: /^(ppt|pptx|odp)$/, color: "#d24726" },
        { re: /^(exe|msi|bat|cmd)$/, color: "#5f6b7a" },
        { re: /^(mp3|wav|ogg|m4a|flac)$/, color: "#8e44ad" },
        { re: /^(mp4|mkv|avi|mov|webm)$/, color: "#c0392b" }
    ];

    const BROKEN_IMAGE = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21 5v6.59l-3-3.01-4 4.01-4-4-4 4-3-3.01V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2zm-3 6.42 3 3.01V19c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-6.58l3 2.99 4-4 4 4 4-3.99z"/></svg>`;
    const CLIP_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.5 6v11.5a4 4 0 0 1-8 0V5a2.5 2.5 0 0 1 5 0v10.5a1 1 0 0 1-2 0V6H10v9.5a2.5 2.5 0 0 0 5 0V5a4 4 0 0 0-8 0v12.5a5.5 5.5 0 0 0 11 0V6h-1.5z"/></svg>`;
    const TOPIC_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2zm3 4v2h10V8H7zm0 4v2h7v-2H7z"/></svg>`;
    const POST_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z"/></svg>`;
    const TOPIC_PATH = /^\/topic\/(\d+)(?:\/([^/?#]+))?/;
    const POST_PATH = /^\/post\/(\d+)/;

    const OPEN_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42L17.59 5H14V3zM5 5h6v2H5v12h12v-6h2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/></svg>`;

    const EYE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 5c-5 0-9.27 3.11-11 7.5C2.73 16.89 7 20 12 20s9.27-3.11 11-7.5C21.27 8.11 17 5 12 5zm0 12.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>`;

    const sizeCache = new Map();
    const topicCache = new Map();
    const postCache = new Map();
    const topicOriginals = new WeakMap();
    const previewCache = new Map();

    function nameFromLink(link, url) {
        const text = link.textContent.trim();
        if (/\.\w{1,5}$/.test(text) && !text.includes("/")) return text;
        return nameFromUrl(url);
    }

    function extOf(name) {
        const m = name.match(/\.(\w{1,5})$/);
        return m ? m[1].toLowerCase() : "";
    }

    function iconSvg(ext) {
        const color = (TYPE_COLORS.find((t) => t.re.test(ext)) || {}).color || "#7a8794";
        const label = ext.toUpperCase().slice(0, 4) || "FILE";
        return `<svg viewBox="0 0 48 60" aria-hidden="true">
          <path d="M6 2h26l14 14v40a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#fff" stroke="#c9ced6" stroke-width="1.5"/>
          <path d="M32 2v12a2 2 0 0 0 2 2h12" fill="#e9edf2" stroke="#c9ced6" stroke-width="1.5" stroke-linejoin="round"/>
          <rect x="0" y="32" width="38" height="15" rx="2.5" fill="${color}"/>
          <text x="19" y="43" text-anchor="middle" font-size="9.5" font-weight="700" fill="#fff" font-family="Segoe UI, Arial, sans-serif">${label}</text>
        </svg>`;
    }

    function formatSize(bytes) {
        if (!(bytes >= 0)) return "";
        const units = ["B", "KB", "MB", "GB"];
        let i = 0;
        while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }
        return `${bytes.toFixed(i && bytes < 10 ? 1 : 0)} ${units[i]}`;
    }

    function loadSize(href, el) {
        // גודל אפשר לקבל רק מקבצים שיושבים באתר עצמו
        if (new URL(href).origin !== location.origin) return;
        if (!sizeCache.has(href)) {
            sizeCache.set(href, fetch(href, { method: "HEAD" })
                .then((r) => (r.ok ? Number(r.headers.get("content-length")) : NaN))
                .catch(() => NaN));
        }
        sizeCache.get(href).then((size) => { el.textContent = formatSize(size); });
    }

    // מחליף את ZI/AP בטקסט של הקישור המקורי בתוך הפוסט
    function fixLinkText(link) {
        const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
        let last = null;
        while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) last = walker.currentNode;
        if (!last) return;
        const fixed = fixName(last.nodeValue.trimEnd());
        if (fixed !== last.nodeValue.trimEnd()) last.nodeValue = fixed;
    }

    // אימוג'ים, תמונות פרופיל ואייקונים קטנים אינם תמונות של הפוסט
    function isDecorative(img) {
        if (img.closest(".emoji, .avatar, [component='user/picture']")) return true;
        if (img.classList.contains("emoji") || /nodebb-plugin-emoji/.test(img.src)) return true;
        const width = Number(img.getAttribute("width"));
        return width > 0 && width < 40;
    }

    // תמונה בתוך ספויילר (התיבה המוסתרת שלו) - מוצגת בקבוצה נפרדת, שנפתחת רק בלחיצה
    const inSpoiler = (el) => !!el.closest('.collapse, [class*="spoiler" i]');

    function collect(content) {
        const files = new Map();
        const images = new Map();
        const links = new Map();
        const spoilerImages = new Map();

        for (const link of content.querySelectorAll("a[href]")) {
            if (link.closest(".mf-panel")) continue;
            const url = toUrl(link.getAttribute("href"));
            if (!url) continue;
            if (UPLOAD_PATH.test(url.pathname) && !IMAGE_EXT.test(url.pathname)) {
                if (!link.classList.contains("mf-filebanner")) fixLinkText(link);
                if (!files.has(url.href)) files.set(url.href, link.dataset.mfName || fixName(nameFromLink(link, url)));
                continue;
            }
            if (link.querySelector("img")) continue;
            if (IMAGE_EXT.test(url.pathname)) {
                const group = inSpoiler(link) ? spoilerImages : images;
                if (!group.has(url.href)) group.set(url.href, nameFromUrl(url));
                continue;
            }
            if (isSiteHost(url.hostname)) continue;
            if (!links.has(url.href) && links.size < MAX_LINKS) links.set(url.href, link.textContent.trim());
        }

        for (const img of content.querySelectorAll("img")) {
            if (img.closest(".mf-panel") || isDecorative(img)) continue;
            const url = toUrl(img.getAttribute("src"));
            if (!url) continue;
            // אם התמונה עטופה בקישור לגרסה המלאה שלה - לוקחים את המלאה
            const wrapper = img.closest("a[href]");
            const full = wrapper && toUrl(wrapper.getAttribute("href"));
            const src = full && IMAGE_EXT.test(full.pathname) ? full : url;
            const group = inSpoiler(img) ? spoilerImages : images;
            if (!group.has(src.href)) group.set(src.href, nameFromUrl(src));
        }
        // תמונה שמופיעה גם בפוסט וגם בספויילר - מוצגת רק עם התמונות של הפוסט
        for (const href of images.keys()) spoilerImages.delete(href);

        return { files, images, links, spoilerImages };
    }

    function stopSiteNavigation(el) {
        el.setAttribute("data-ajaxify", "false");
        el.addEventListener("click", (e) => e.stopPropagation());
    }

    function bindDownload(tile, href, name) {
        tile.href = href;
        tile.download = name;
        tile.title = `הורדת ${name}`;
        tile.setAttribute("data-ajaxify", "false");
        tile.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            triggerDownload(href, name);
        });
    }

    function section(title, count, body) {
        const wrap = document.createElement("div");
        wrap.className = "mf-section";
        const head = document.createElement("div");
        head.className = "mf-section-title";
        head.textContent = count > 1 ? `${title} (${count})` : title;
        wrap.append(head, body);
        return wrap;
    }

    function buildFileTile(href, name) {
        const tile = document.createElement("a");
        tile.className = "mf-file";
        bindDownload(tile, href, name);

        const icon = document.createElement("span");
        icon.className = "mf-file-icon";
        icon.innerHTML = iconSvg(extOf(name));

        const label = document.createElement("span");
        label.className = "mf-file-name";
        label.dir = "auto";
        label.textContent = name;

        const size = document.createElement("span");
        size.className = "mf-file-size";
        size.dir = "ltr";
        loadSize(href, size);

        tile.append(icon, label, size);
        return tile;
    }

    // תמונה שלא נטענה (חסומה או שבורה) מוחלפת בסמל
    function loadImage(container, src) {
        const img = document.createElement("img");
        img.loading = "lazy";
        img.referrerPolicy = "no-referrer";
        img.alt = "";
        img.addEventListener("error", () => {
            img.remove();
            container.classList.add("mf-broken");
            container.insertAdjacentHTML("beforeend", BROKEN_IMAGE);
        });
        img.src = src;
        container.appendChild(img);
    }

    function buildImageTile(href, name) {
        const tile = document.createElement("a");
        tile.className = "mf-file mf-image";
        bindDownload(tile, href, name);

        const thumb = document.createElement("span");
        thumb.className = "mf-thumb";
        loadImage(thumb, href);

        const label = document.createElement("span");
        label.className = "mf-file-name";
        label.dir = "auto";
        label.textContent = name;

        const size = document.createElement("span");
        size.className = "mf-file-size";
        size.dir = "ltr";
        loadSize(href, size);

        tile.append(thumb, label, size);
        return tile;
    }

    // ---- תצוגה מקדימה לקישורים לאתרים אחרים ----

    const PREVIEW_MAX_BYTES = 600000;

    // אתרים בעברית משתמשים לפעמים בקידוד windows-1255
    function decodeBytes(bytes, type) {
        let charset = (type.match(/charset=["']?([\w-]+)/i) || [])[1];
        if (!charset) {
            const head = new TextDecoder("latin1").decode(bytes.subarray(0, 4096));
            charset = (head.match(/<meta[^>]+charset=["']?([\w-]+)/i) || [])[1];
        }
        try {
            return new TextDecoder(charset || "utf-8").decode(bytes);
        } catch (e) {
            return new TextDecoder("utf-8").decode(bytes);
        }
    }

    function decodeEntities(text) {
        const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
        return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, code) => {
            if (code[0] === "#") {
                const n = code[1] === "x" || code[1] === "X" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
                return n > 0 && n < 0x110000 ? String.fromCodePoint(n) : all;
            }
            return named[code.toLowerCase()] ?? all;
        });
    }

    function parseMeta(html, base) {
        const meta = new Map();
        for (const tag of html.matchAll(/<meta\b[^>]*>/gi)) {
            const attrs = {};
            for (const a of tag[0].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
                attrs[a[1].toLowerCase()] = a[2] ?? a[3] ?? a[4];
            }
            const key = (attrs.property || attrs.name || "").toLowerCase();
            if (key && attrs.content != null && !meta.has(key)) meta.set(key, decodeEntities(attrs.content.trim()));
        }
        const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const title = meta.get("og:title") || meta.get("twitter:title") ||
            (titleTag ? decodeEntities(titleTag[1].replace(/\s+/g, " ").trim()) : "");
        const description = meta.get("og:description") || meta.get("twitter:description") || meta.get("description") || "";
        let image = meta.get("og:image") || meta.get("og:image:url") || meta.get("og:image:secure_url") ||
            meta.get("twitter:image") || meta.get("twitter:image:src") || "";
        try {
            image = image ? new URL(image, base).href : "";
        } catch (e) {
            image = "";
        }
        if (!/^https?:/.test(image)) image = "";
        if (!title && !description && !image) return null;
        return {
            title: title.slice(0, 300),
            description: description.slice(0, 400),
            image,
            siteName: (meta.get("og:site_name") || "").slice(0, 100)
        };
    }

    function fetchPreview(url) {
        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: "GET",
                url,
                responseType: "arraybuffer",
                anonymous: true,
                timeout: 8000,
                headers: { Accept: "text/html,application/xhtml+xml" },
                onload: (res) => {
                    const type = (res.responseHeaders.match(/^content-type:\s*(.*)$/im) || [])[1] || "";
                    if (res.status < 200 || res.status >= 300 || !/html/i.test(type) || !res.response) return resolve(null);
                    const bytes = new Uint8Array(res.response).subarray(0, PREVIEW_MAX_BYTES);
                    resolve(parseMeta(decodeBytes(bytes, type), res.finalUrl || url));
                },
                onerror: () => resolve(null),
                ontimeout: () => resolve(null)
            });
        });
    }

    function getPreview(href) {
        if (!previewCache.has(href)) {
            previewCache.set(href, fetchPreview(href).catch(() => null));
            if (previewCache.size > 300) previewCache.delete(previewCache.keys().next().value);
        }
        return previewCache.get(href);
    }

    function buildLinkCard(href, text) {
        const url = new URL(href);
        const card = document.createElement("a");
        card.className = "mf-link";
        card.href = href;
        card.target = "_blank";
        card.rel = "noopener noreferrer";
        stopSiteNavigation(card);

        const media = document.createElement("span");
        media.className = "mf-link-media";

        const host = url.hostname.replace(/^www\./, "");
        let path = url.pathname + url.search;
        try { path = decodeURIComponent(path); } catch (e) {}
        if (path === "/") path = "";

        // שורה: הסמל של האתר, שם האתר והכתובת, וחץ של פתיחה בלשונית חדשה
        const row = document.createElement("span");
        row.className = "mf-link-row";

        const icon = document.createElement("span");
        icon.className = "mf-link-icon";
        const favicon = document.createElement("img");
        favicon.alt = "";
        favicon.loading = "lazy";
        favicon.referrerPolicy = "no-referrer";
        favicon.addEventListener("error", () => { icon.innerHTML = GLOBE_ICON; });
        favicon.src = `${url.origin}/favicon.ico`;
        icon.appendChild(favicon);

        const body = document.createElement("span");
        body.className = "mf-link-body";
        const title = document.createElement("span");
        title.className = "mf-link-title";
        title.dir = "auto";
        // בכרטיס - שם האתר, ולא המילה שעליה לוחצים בטקסט (כמו "כאן")
        title.textContent = host;
        const desc = document.createElement("span");
        desc.className = "mf-link-desc";
        desc.dir = "auto";
        const site = document.createElement("span");
        site.className = "mf-link-site";
        site.dir = "ltr";
        // שם האתר כבר בכותרת, אז כאן רק ההמשך של הכתובת
        site.textContent = path || host;
        body.append(title, desc, site);

        const arrow = document.createElement("span");
        arrow.className = "mf-link-arrow";
        arrow.innerHTML = OPEN_ICON;

        row.append(icon, body, arrow);
        card.append(media, row);

        getPreview(href).then((p) => {
            if (!p) return;
            if (p.title) {
                // הכותרת של הדף מחליפה את שם האתר - אז שם האתר עובר לשורת הכתובת
                title.textContent = p.title;
                site.textContent = host + path;
            }
            if (p.description) desc.textContent = p.description;
            if (p.image) {
                card.classList.add("mf-has-media");
                loadImage(media, p.image);
            }
        });
        return card;
    }

    function buildSpoilerImages(spoilerImages) {
        const wrap = document.createElement("div");
        wrap.className = "mf-section mf-spoiler-images";
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "mf-subtoggle";
        toggle.innerHTML = EYE_ICON;
        const label = document.createElement("span");
        toggle.append(label);
        const setLabel = (open) => {
            label.textContent = open ? "הסתר תמונות מספויילרים" : `תמונות מספויילרים (${spoilerImages.size})`;
            toggle.setAttribute("aria-expanded", String(open));
        };
        setLabel(false);

        // התמונות נטענות רק כשפותחים, כמו הספויילר עצמו
        let grid = null;
        toggle.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!grid) {
                grid = document.createElement("div");
                grid.className = "mf-grid";
                for (const [href, name] of spoilerImages) grid.appendChild(buildImageTile(href, name));
                wrap.appendChild(grid);
                setLabel(true);
                return;
            }
            grid.hidden = !grid.hidden;
            setLabel(!grid.hidden);
        });
        wrap.appendChild(toggle);
        return wrap;
    }

    function buildBody({ files, images, links, spoilerImages }) {
        const panel = document.createElement("div");
        panel.className = "mf-body";

        if (files.size) {
            const grid = document.createElement("div");
            grid.className = "mf-grid";
            for (const [href, name] of files) grid.appendChild(buildFileTile(href, name));
            panel.appendChild(section(files.size > 1 ? "קבצים מצורפים" : "קובץ מצורף", files.size, grid));
        }
        if (images.size) {
            const grid = document.createElement("div");
            grid.className = "mf-grid";
            for (const [href, name] of images) grid.appendChild(buildImageTile(href, name));
            panel.appendChild(section(images.size > 1 ? "תמונות" : "תמונה", images.size, grid));
        }
        if (spoilerImages.size) panel.appendChild(buildSpoilerImages(spoilerImages));
        if (links.size) {
            const list = document.createElement("div");
            list.className = "mf-links";
            for (const [href, text] of links) list.appendChild(buildLinkCard(href, text));
            panel.appendChild(section(links.size > 1 ? "קישורים" : "קישור", links.size, list));
        }
        return panel;
    }

    function buildPanel(found) {
        const panel = document.createElement("div");
        panel.className = "mf-panel";
        if (settings.display === "always") {
            panel.appendChild(buildBody(found));
            return panel;
        }

        // התוכן נבנה רק בלחיצה, כך שתמונות ותצוגות מקדימות לא נטענות סתם
        const count = found.files.size + found.images.size + found.links.size + found.spoilerImages.size;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "mf-toggle";
        const label = document.createElement("span");
        button.innerHTML = CLIP_ICON;
        button.append(label);
        const setLabel = (open) => {
            label.textContent = open ? "הסתר קבצים מצורפים" : `טען קבצים מצורפים (${count})`;
            button.setAttribute("aria-expanded", String(open));
        };
        setLabel(false);

        let body = null;
        button.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!body) {
                body = buildBody(found);
                panel.appendChild(body);
                setLabel(true);
                return;
            }
            body.hidden = !body.hidden;
            setLabel(!body.hidden);
        });
        panel.appendChild(button);
        return panel;
    }

    // ---- באנר לקישורים לנושאים ולפוסטים בפורום ----

    function decodeHtml(text) {
        return new DOMParser().parseFromString(text, "text/html").documentElement.textContent;
    }

    function getTopic(tid) {
        if (!topicCache.has(tid)) {
            topicCache.set(tid, fetch(`/api/topic/${tid}`, { headers: { Accept: "application/json" } })
                .then((r) => (r.ok ? r.json() : null))
                .then((t) => t && {
                    title: decodeHtml(t.title || ""),
                    category: decodeHtml(t.category?.name || ""),
                    posts: t.postcount
                })
                .catch(() => null));
        }
        return topicCache.get(tid);
    }

    function excerpt(html) {
        const text = decodeHtml(html.replace(/<blockquote[\s\S]*?<\/blockquote>/gi, " ").replace(/<[^>]+>/g, " "));
        const clean = text.replace(/\s+/g, " ").trim();
        return clean.length > 160 ? clean.slice(0, 160) + "…" : clean;
    }

    // קישור לפוסט: הסיכום כולל את שם הנושא, הכותב ותחילת התוכן
    function getPost(pid) {
        if (!postCache.has(pid)) {
            const json = (url) => fetch(url, { headers: { Accept: "application/json" } })
                .then((r) => (r.ok ? r.json() : null));
            postCache.set(pid, json(`/api/v3/posts/${pid}/summary`)
                .then((res) => {
                    const p = res?.response;
                    if (p?.topic) {
                        return {
                            title: decodeHtml(p.topic.title || ""),
                            author: p.user?.username || "",
                            category: decodeHtml(p.category?.name || ""),
                            text: excerpt(p.content || "")
                        };
                    }
                    // גרסה בלי סיכום - לוקחים לפחות את שם הנושא
                    return json(`/api/v3/posts/${pid}`).then((r) => {
                        const tid = r?.response?.tid;
                        return tid ? getTopic(tid).then((t) => t && { title: t.title, category: t.category, author: "", text: excerpt(r.response.content || "") }) : null;
                    });
                })
                .catch(() => null));
        }
        return postCache.get(pid);
    }

    // רק קישור שמוצג ככתובת גולמית מוחלף בבאנר; קישור עם טקסט משלו נשאר כמו שהוא
    function isBareUrl(link) {
        const text = link.textContent.trim();
        return /^(https?:\/\/)?([\w-]+\.)*mitmachim\.top\//i.test(text);
    }

    function decorateTopics(content) {
        for (const link of content.querySelectorAll("a[href]:not(.mf-topic)")) {
            if (link.closest(".mf-panel")) continue;
            const url = toUrl(link.getAttribute("href"));
            if (!url || !isSiteHost(url.hostname) || !isBareUrl(link)) continue;
            const topicMatch = url.pathname.match(TOPIC_PATH);
            const postMatch = !topicMatch && url.pathname.match(POST_PATH);
            if (!topicMatch && !postMatch) continue;

            topicOriginals.set(link, link.innerHTML);
            link.classList.add("mf-topic");

            const icon = document.createElement("span");
            icon.className = "mf-topic-icon";
            icon.innerHTML = postMatch ? POST_ICON : TOPIC_ICON;

            const body = document.createElement("span");
            body.className = "mf-topic-body";
            const title = document.createElement("span");
            title.className = "mf-topic-title";
            // עד שהכותרת מגיעה מהשרת - השם מתוך הכתובת
            let slug = (topicMatch && topicMatch[2]) || "";
            try { slug = decodeURIComponent(slug); } catch (e) {}
            title.textContent = slug.replace(/-/g, " ") || (postMatch ? "פוסט בפורום" : "נושא בפורום");
            const desc = document.createElement("span");
            desc.className = "mf-topic-desc";
            desc.dir = "auto";
            const meta = document.createElement("span");
            meta.className = "mf-topic-meta";
            meta.textContent = postMatch ? "פוסט במתמחים טופ" : "נושא במתמחים טופ";
            body.append(title, desc, meta);

            link.replaceChildren(icon, body);

            if (postMatch) {
                getPost(postMatch[1]).then((post) => {
                    if (!post || !link.classList.contains("mf-topic")) return;
                    if (post.title) title.textContent = post.title;
                    desc.textContent = post.text;
                    const parts = [post.author && `פוסט של ${post.author}`, post.category].filter(Boolean);
                    if (parts.length) meta.textContent = parts.join(" · ");
                });
                continue;
            }

            getTopic(topicMatch[1]).then((topic) => {
                if (!topic || !link.classList.contains("mf-topic")) return;
                if (topic.title) title.textContent = topic.title;
                const parts = [topic.category, topic.posts > 0 ? `${topic.posts} פוסטים` : ""].filter(Boolean);
                if (parts.length) meta.textContent = parts.join(" · ");
            });
        }
    }

    // ---- באנר לקישורים לאתרים אחרים ----
    // קישור חיצוני שמופיע ככתובת גולמית מוחלף בבאנר עם הסמל של האתר, השם והכתובת

    const GLOBE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.93 6h-2.95a15.6 15.6 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.93 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14a7.9 7.9 0 0 1 0-4h3.38a16.5 16.5 0 0 0 0 4H4.26zm.81 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.99 7.99 0 0 1 5.07 16zm2.95-8H5.07a7.99 7.99 0 0 1 4.33-3.56A15.6 15.6 0 0 0 8.02 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66a14.7 14.7 0 0 1 0-4h4.68a14.7 14.7 0 0 1 0 4zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14a16.5 16.5 0 0 0 0-4h3.38a7.9 7.9 0 0 1 0 4h-3.38z"/></svg>`;

    // רק קישור שמוצג ככתובת; קישור עם טקסט משלו (כמו "כאן") נשאר כמו שהוא
    function isBareExternal(link, url) {
        const text = link.textContent.trim().replace(/\/$/, "");
        if (!text) return false;
        if (/^(https?:\/\/|www\.)/i.test(text)) return true;
        return text === url.hostname || text === url.hostname.replace(/^www\./, "");
    }

    function decorateLinks(content) {
        for (const link of content.querySelectorAll("a[href]:not(.mf-topic)")) {
            if (link.closest(".mf-panel") || link.querySelector("img")) continue;
            const url = toUrl(link.getAttribute("href"));
            if (!url || isSiteHost(url.hostname) || IMAGE_EXT.test(url.pathname) || !isBareExternal(link, url)) continue;

            topicOriginals.set(link, link.innerHTML);
            link.classList.add("mf-topic", "mf-extlink");
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            stopSiteNavigation(link);

            // הסמל של האתר; אם הוא חסום או לא קיים - סמל של גלובוס
            const icon = document.createElement("span");
            icon.className = "mf-topic-icon mf-extlink-icon";
            const favicon = document.createElement("img");
            favicon.alt = "";
            favicon.loading = "lazy";
            favicon.referrerPolicy = "no-referrer";
            favicon.addEventListener("error", () => { icon.innerHTML = GLOBE_ICON; });
            favicon.src = `${url.origin}/favicon.ico`;
            icon.appendChild(favicon);

            const host = url.hostname.replace(/^www\./, "");
            let path = url.pathname + url.search;
            try { path = decodeURIComponent(path); } catch (e) {}
            if (path === "/") path = "";

            const body = document.createElement("span");
            body.className = "mf-topic-body";
            const title = document.createElement("span");
            title.className = "mf-topic-title";
            title.dir = "auto";
            title.textContent = host;
            const desc = document.createElement("span");
            desc.className = "mf-topic-desc mf-extlink-path";
            desc.dir = "ltr";
            desc.textContent = path;
            const meta = document.createElement("span");
            meta.className = "mf-topic-meta";
            meta.textContent = "קישור לאתר חיצוני";
            body.append(title, desc, meta);

            link.replaceChildren(icon, body);

            // עם תצוגה מקדימה פעילה - הכותרת והתיאור האמיתיים של הדף
            if (!settings.links) continue;
            getPreview(url.href).then((p) => {
                if (!p || !link.classList.contains("mf-topic")) return;
                if (p.title) title.textContent = p.title;
                if (p.description) {
                    desc.classList.remove("mf-extlink-path");
                    desc.dir = "auto";
                    desc.textContent = p.description;
                }
                meta.textContent = p.siteName ? `${p.siteName} · ${host}` : host;
            });
        }
    }

    function restoreTopics(content) {
        for (const link of content.querySelectorAll("a.mf-topic:not(.mf-filebanner)")) {
            if (topicOriginals.has(link)) link.innerHTML = topicOriginals.get(link);
            link.classList.remove("mf-topic", "mf-extlink");
        }
    }

    // ---- באנר לקבצים מצורפים בתוך הפוסט ----
    // קישור לקובץ שהועלה לאתר מוצג כבאנר קטן, באותו סגנון כמו הבאנר לנושאים

    const fileOriginals = new WeakMap();

    function decorateFiles(content) {
        for (const link of content.querySelectorAll("a[href]:not(.mf-filebanner)")) {
            if (link.closest(".mf-panel") || link.classList.contains("mf-topic") || link.querySelector("img")) continue;
            const url = toUrl(link.getAttribute("href"));
            if (!url || !UPLOAD_PATH.test(url.pathname) || IMAGE_EXT.test(url.pathname)) continue;
            const name = fixName(nameFromLink(link, url));

            fileOriginals.set(link, link.innerHTML);
            link.classList.add("mf-topic", "mf-filebanner");
            link.dataset.mfName = name;
            bindDownload(link, url.href, name);

            const icon = document.createElement("span");
            icon.className = "mf-topic-icon mf-filebanner-icon";
            icon.innerHTML = iconSvg(extOf(name));

            const body = document.createElement("span");
            body.className = "mf-topic-body";
            const title = document.createElement("span");
            title.className = "mf-topic-title";
            title.dir = "auto";
            title.textContent = name;
            const meta = document.createElement("span");
            meta.className = "mf-topic-meta";
            const ext = extOf(name).toUpperCase();
            meta.textContent = ext ? `קובץ ${ext}` : "קובץ מצורף";
            const size = document.createElement("span");
            size.className = "mf-filebanner-size";
            size.dir = "ltr";
            meta.append(size);
            body.append(title, meta);

            link.replaceChildren(icon, body);
            loadSize(url.href, size);
        }
    }

    function restoreFiles(content) {
        for (const link of content.querySelectorAll("a.mf-filebanner")) {
            if (fileOriginals.has(link)) link.innerHTML = fileOriginals.get(link);
            link.classList.remove("mf-topic", "mf-filebanner");
            delete link.dataset.mfName;
        }
    }

    // ---- ספויילר בהמשך השורה ----
    // באתר כל ספויילר הוא כפתור בפסקה משלו, ואחריו תיבה מוסתרת שמחוברת אליו לפי id:
    // <p><button class="btn extended-markdown-spoiler" data-bs-target="#spoilerN">…</button></p>
    // <div class="collapse" id="spoilerN"><div class="card card-body spoiler">…</div></div>
    // כיוון שהחיבור הוא לפי id, אפשר להעביר את הכפתור לסוף השורה הקודמת בלי לשבור את הפתיחה,
    // והתיבה נשארת במקומה ונפתחת מתחת לשורה.

    const SPOILER = '[class*="spoiler" i]';
    const isRendered = (el) => (el.checkVisibility ? el.checkVisibility() : el.getClientRects().length > 0);

    // רק טקסט שרואים על המסך, ולא טקסט מוסתר בתוך ספויילר
    function hasTextBefore(content, el) {
        const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            const node = walker.currentNode;
            if (!(el.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_PRECEDING)) break;
            const parent = node.parentElement;
            if (!node.nodeValue.trim() || parent.closest(SPOILER)) continue;
            if (isRendered(parent)) return true;
        }
        return false;
    }

    function spoilerTarget(btn) {
        const controls = btn.getAttribute("aria-controls");
        const selector = btn.getAttribute("data-bs-target") || btn.getAttribute("data-target") ||
            (controls ? `#${CSS.escape(controls)}` : "");
        try {
            return selector ? document.querySelector(selector) : null;
        } catch (e) {
            return null;
        }
    }

    // רווחים, פסקאות ריקות ותיבות ספויילר סגורות - מה שלא נראה על המסך
    function isSkippable(node) {
        if (node.nodeType === Node.TEXT_NODE) return !node.nodeValue.trim();
        if (node.nodeType !== Node.ELEMENT_NODE) return true;
        if (node.nodeName === "BR") return false;
        if (!isRendered(node)) return true;
        return !node.textContent.trim() && !node.querySelector("img, video, iframe, button");
    }

    // המקום שבו נגמרת השורה האחרונה של האלמנט שלפני הספויילר
    function lineEnd(el) {
        if (el.matches("ol, ul")) {
            const li = el.lastElementChild;
            return li && li.matches("li") ? lineEnd(li) : null;
        }
        if (el.matches("li")) {
            const last = el.lastElementChild;
            return last && last === el.lastChild && last.matches("ol, ul") ? lineEnd(last) || el : el;
        }
        // ציטוט לא נחשב שורה קודמת: ספויילר שבא אחריו הוא לא חלק מהציטוט, ונשאר כפתור רגיל
        if (el.matches("p, h1, h2, h3, h4, h5, h6")) return el;
        return null;
    }

    function inlineSpoilers(content) {
        for (const btn of content.querySelectorAll(`button${SPOILER}, .btn${SPOILER}`)) {
            if (btn.dataset.mfChecked) continue;
            btn.dataset.mfChecked = "1";
            // ספויילר שלא ידוע איך הוא נפתח - לא נוגעים בו
            if (!spoilerTarget(btn)) continue;
            // הודעה שמתחילה בספויילר נשארת כרגיל
            if (!hasTextBefore(content, btn)) continue;

            // הפסקה שמכילה רק את הכפתור
            let outer = btn;
            while (outer.parentElement !== content && outer.parentElement.textContent.trim() === btn.textContent.trim()) {
                outer = outer.parentElement;
            }

            let prev = outer.previousSibling;
            while (prev && isSkippable(prev)) prev = prev.previousSibling;
            const target = prev && prev.nodeType === Node.ELEMENT_NODE ? lineEnd(prev) : null;
            if (!target) continue;

            // ספויילרים ברצף מגיעים כולם לאותה שורה, אחד אחרי השני
            btn.classList.add("mf-spoiler-btn");
            target.append(" ", btn);
            if (outer !== btn && !outer.textContent.trim()) outer.classList.add("mf-hidden-br");
        }
    }

    // קישור שנשמר עם כוכביות מקבל את הכתובת המתוקנת, וכך גם הבאנר שלו מוצג בלי הכוכביות
    function fixStars() {
        for (const link of document.querySelectorAll(MfStars.SELECTOR)) {
            if (MfStars.isOriginalLink(link) || !MfStars.isBroken(link.getAttribute("href") || "")) continue;
            // באנר שנבנה לפני התיקון - בונים אותו מחדש מהכתובת המתוקנת
            if (link.classList.contains("mf-topic") && topicOriginals.has(link)) {
                link.innerHTML = topicOriginals.get(link);
                link.classList.remove("mf-topic", "mf-extlink");
            }
            MfStars.fixLink(link);
        }
    }

    function restoreStars() {
        for (const link of document.querySelectorAll(MfStars.SELECTOR)) {
            if (!MfStars.isOriginalLink(link)) continue;
            link.classList.remove("mf-topic", "mf-extlink");
            MfStars.restoreLink(link);
        }
    }

    function scan() {
        if (settings.unbreakLinks) fixStars();
        else restoreStars();
        for (const content of document.querySelectorAll('[component="post/content"]')) {
            inlineSpoilers(content);
            if (settings.fileBanners) decorateFiles(content);
            else restoreFiles(content);
            if (settings.topics) {
                decorateTopics(content);
                decorateLinks(content);
            } else {
                restoreTopics(content);
            }

            const found = collect(content);
            for (const kind of Object.keys(found)) {
                const setting = kind === "spoilerImages" ? "images" : kind;
                if (!settings[setting] || settings.display === "off") found[kind].clear();
            }

            const key = settings.display + "||" + Object.values(found).map((m) => [...m.keys()].join("|")).join("||");
            const existing = content.querySelector(":scope > .mf-panel");
            if (existing && existing.dataset.key === key) continue;
            existing?.remove();
            if (!found.files.size && !found.images.size && !found.links.size && !found.spoilerImages.size) continue;

            const panel = buildPanel(found);
            panel.dataset.key = key;
            content.appendChild(panel);
        }
    }

    // =====================================================================
    // חלון הגדרות (נפתח מתפריט Tampermonkey)
    // =====================================================================

    const PROFILE_URL = "https://mitmachim.top/user/%D7%9E%D7%98%D7%A2%D7%9F-%D7%A0%D7%99%D7%99%D7%93";

    const SETTINGS_HTML = `
      <div class="mfs-dialog" role="dialog" aria-modal="true" aria-label="הגדרות">
        <button type="button" class="mfs-close" aria-label="סגירה">✕</button>
        <h2>תיקון ZI ל-ZIP במתמחים טופ</h2>
        <p class="mfs-sub">הגדרות התצוגה בסוף כל פוסט באתר</p>

        <section class="mfs-card">
          <div class="mfs-row mfs-static">
            <span class="mfs-text"><span class="mfs-name">אופן התצוגה</span>
            <span class="mfs-desc">איך יופיעו הקבצים המצורפים מתחת לכל פוסט</span></span>
          </div>
          <div class="mfs-modes" role="radiogroup" aria-label="אופן התצוגה">
            <label class="mfs-mode"><input type="radio" name="display" value="button">
              <span class="mfs-mode-name">כפתור "טען קבצים מצורפים"</span><span class="mfs-mode-desc">נפתח רק בלחיצה</span></label>
            <label class="mfs-mode"><input type="radio" name="display" value="always">
              <span class="mfs-mode-name">הצג תמיד</span><span class="mfs-mode-desc">כל הקבצים פתוחים</span></label>
            <label class="mfs-mode"><input type="radio" name="display" value="off">
              <span class="mfs-mode-name">לא להציג</span><span class="mfs-mode-desc">בלי תצוגה בכלל</span></label>
          </div>
        </section>

        <section class="mfs-card mfs-kinds">
          <label class="mfs-row"><span class="mfs-text"><span class="mfs-name">קבצים מצורפים</span>
            <span class="mfs-desc">קבצים שהועלו לאתר מוצגים כאייקונים עם שם וגודל. לחיצה מורידה את הקובץ.</span></span>
            <input type="checkbox" class="mfs-switch" data-key="files"></label>
          <label class="mfs-row"><span class="mfs-text"><span class="mfs-name">תמונות</span>
            <span class="mfs-desc">התמונות שבפוסט מוצגות גם כתמונות ממוזערות. לחיצה מורידה את התמונה.</span></span>
            <input type="checkbox" class="mfs-switch" data-key="images"></label>
          <label class="mfs-row"><span class="mfs-text"><span class="mfs-name">תצוגה מקדימה לקישורים</span>
            <span class="mfs-desc">קישורים לאתרים אחרים מוצגים ככרטיס עם כותרת, תיאור ותמונה. בפעם הראשונה Tampermonkey יבקש אישור לגשת לאתרים המקושרים.</span></span>
            <input type="checkbox" class="mfs-switch" data-key="links"></label>
        </section>

        <section class="mfs-card">
          <label class="mfs-row"><span class="mfs-text"><span class="mfs-name">באנר לקבצים מצורפים בתוך הפוסט</span>
            <span class="mfs-desc">קישור לקובץ שהועלה לאתר מוצג כבאנר קטן עם סוג הקובץ, השם והגודל. לחיצה מורידה את הקובץ.</span></span>
            <input type="checkbox" class="mfs-switch" data-key="fileBanners"></label>
          <label class="mfs-row"><span class="mfs-text"><span class="mfs-name">באנר לקישורים</span>
            <span class="mfs-desc">קישור שמופיע ככתובת ארוכה מוחלף בבאנר: לנושא או לפוסט במתמחים - עם שם הנושא, ולאתר אחר - עם הסמל והשם של האתר.</span></span>
            <input type="checkbox" class="mfs-switch" data-key="topics"></label>
        </section>

        <section class="mfs-card">
          <label class="mfs-row"><span class="mfs-text"><span class="mfs-name">הסרת כוכביות מקישורים</span>
            <span class="mfs-desc">קישור לדרייב, לג'מבו מייל או ל-send.magicode.me שנשמר באתר עם כוכביות (* # @ &amp;) מוצג ונפתח בלי הכוכביות. גם דף שגיאה שנפתח מקישור כזה עובר מיד לקובץ האמיתי.</span></span>
            <input type="checkbox" class="mfs-switch" data-key="unbreakLinks"></label>
          <label class="mfs-row"><span class="mfs-text"><span class="mfs-name">הוספת כוכביות בשליחת פוסט</span>
            <span class="mfs-desc">השרת לא שומר קישורים לאתרים האלה, אז מדביקים קישור רגיל והסקריפט מכניס לתוכו כוכביות ברגע השליחה. מי שאין לו את הסקריפט רואה את הכוכביות ומוחק אותן מהכתובת בעצמו.</span></span>
            <input type="checkbox" class="mfs-switch" data-key="breakLinks"></label>
        </section>

        <section class="mfs-card mfs-info">
          <span class="mfs-name">תיקון סיומות</span>
          <span class="mfs-desc">פועל תמיד: ZIP עולה לאתר כ-ZIP אמיתי, כך שגם מי שאין לו את הסקריפט מוריד ZIP. קבצים בסיומת ZI או AP יורדים ומוצגים כ-ZIP ו-APK.</span>
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
        const kinds = overlay.querySelector(".mfs-kinds");
        const showMode = (mode) => kinds.classList.toggle("mfs-disabled", mode === "off");

        for (const radio of overlay.querySelectorAll('input[name="display"]')) {
            radio.checked = radio.value === settings.display;
            radio.addEventListener("change", () => {
                GM_setValue("display", radio.value);
                applySetting("display", radio.value);
                showMode(radio.value);
                saved();
            });
        }
        showMode(settings.display);

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
.mf-panel {
  margin-top: 12px;
}

.mf-body {
  margin-top: 8px;
  padding-top: 4px;
  border-top: 1px solid var(--bs-border-color, rgba(128, 128, 128, 0.25));
}

/* ---- כפתור "טען קבצים מצורפים" ---- */

.mf-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px 4px 14px;
  border: 1px solid rgba(13, 110, 253, 0.35);
  border-radius: 999px;
  background: rgba(13, 110, 253, 0.12);
  color: #0b5ed7;
  font: inherit;
  font-weight: 500;
  font-size: 13px;
  line-height: 1.6;
  cursor: pointer;
  transition: color 0.12s, border-color 0.12s, background-color 0.12s;
}

.mf-toggle:hover,
.mf-toggle:focus-visible {
  border-color: rgba(13, 110, 253, 0.6);
  background: rgba(13, 110, 253, 0.22);
  outline: none;
}

.mf-toggle[aria-expanded="true"] {
  background: rgba(13, 110, 253, 0.2);
}

/* בערכת נושא כהה - כחול בהיר יותר כדי שיהיה קריא */
[data-bs-theme="dark"] .mf-toggle {
  color: #6ea8fe;
  background: rgba(13, 110, 253, 0.22);
}

.mf-toggle svg {
  width: 15px;
  height: 15px;
  transform: rotate(45deg);
}

.mf-section {
  margin-top: 10px;
}

.mf-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--bs-secondary-color, #6c757d);
  margin-bottom: 8px;
}

/* ---- קבצים ותמונות ---- */

.mf-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mf-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 116px;
  padding: 10px 6px 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--bs-body-color, inherit) !important;
  text-decoration: none !important;
  text-align: center;
  transition: background-color 0.12s, border-color 0.12s;
}

.mf-file:hover,
.mf-file:focus-visible {
  background: rgba(13, 110, 253, 0.08);
  border-color: rgba(13, 110, 253, 0.35);
  outline: none;
}

.mf-file:active {
  background: rgba(13, 110, 253, 0.16);
}

.mf-file-icon svg {
  display: block;
  width: 44px;
  height: 55px;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.12));
}

.mf-file-name {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.3;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mf-file-size {
  margin-top: 2px;
  font-size: 11px;
  color: var(--bs-secondary-color, #6c757d);
  min-height: 1em;
}

.mf-thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 76px;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(128, 128, 128, 0.12);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}

.mf-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* תמונה חסומה או שלא נטענה */
.mf-broken {
  color: var(--bs-secondary-color, #8a939c);
}

.mf-broken svg {
  width: 32px;
  height: 32px;
  opacity: 0.6;
}

/* ---- כרטיסי קישורים ---- */
/* רשת של כרטיסים: הסמל של האתר בריבוע צבעוני, שם האתר והכתובת, וחץ של פתיחה בלשונית חדשה */

.mf-links {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 8px;
  max-width: 760px;
}

.mf-link {
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid var(--bs-border-color, rgba(128, 128, 128, 0.25));
  border-radius: 12px;
  overflow: hidden;
  background: var(--bs-body-bg, #fff);
  color: var(--bs-body-color, inherit) !important;
  text-decoration: none !important;
  transition: background-color 0.15s, border-color 0.15s, box-shadow 0.15s;
}

.mf-link:hover,
.mf-link:focus-visible {
  border-color: rgba(13, 110, 253, 0.45);
  background: rgba(13, 110, 253, 0.05);
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.12);
  outline: none;
}

.mf-link-media {
  display: none;
}

.mf-has-media .mf-link-media {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150px;
  background: rgba(128, 128, 128, 0.12);
}

.mf-link-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.mf-link-media.mf-broken svg {
  width: 40px;
  height: 40px;
}

.mf-link-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
}

.mf-link-icon {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: rgba(13, 110, 253, 0.1);
  color: var(--bs-link-color, #0d6efd);
}

.mf-link-icon img {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  object-fit: contain;
}

.mf-link-icon svg {
  width: 20px;
  height: 20px;
}

.mf-link-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.mf-link-title {
  font-size: 14px;
  line-height: 1.35;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mf-link-desc {
  font-size: 12px;
  line-height: 1.35;
  color: var(--bs-secondary-color, #6c757d);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mf-link-desc:empty {
  display: none;
}

.mf-link-site {
  font-size: 12px;
  color: var(--bs-secondary-color, #6c757d);
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mf-link-arrow {
  flex: none;
  display: flex;
  color: var(--bs-secondary-color, #8a939c);
  opacity: 0.7;
  transition: color 0.15s, opacity 0.15s;
}

.mf-link-arrow svg {
  width: 16px;
  height: 16px;
  transform: scaleX(-1);
}

.mf-link:hover .mf-link-arrow {
  color: var(--bs-link-color, #0d6efd);
  opacity: 1;
}

/* ---- באנר לנושא בפורום ---- */

a.mf-topic {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 520px;
  max-width: 100%;
  margin: 4px 0;
  padding: 10px 14px;
  border: 1px solid var(--bs-border-color, rgba(128, 128, 128, 0.3));
  border-inline-start: 4px solid var(--bs-link-color, #0d6efd);
  border-radius: 10px;
  background: var(--bs-tertiary-bg, rgba(128, 128, 128, 0.06));
  color: var(--bs-body-color, inherit) !important;
  text-decoration: none !important;
  transition: background-color 0.12s, box-shadow 0.12s;
}

a.mf-topic:hover,
a.mf-topic:focus-visible {
  background: rgba(13, 110, 253, 0.08);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  outline: none;
}

.mf-topic-icon {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: rgba(13, 110, 253, 0.12);
  color: var(--bs-link-color, #0d6efd);
}

.mf-topic-icon svg {
  width: 20px;
  height: 20px;
}

.mf-topic-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.mf-topic-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mf-topic-desc {
  font-size: 13px;
  line-height: 1.4;
  color: var(--bs-body-color, inherit);
  opacity: 0.8;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mf-topic-desc:empty {
  display: none;
}

.mf-topic-meta {
  font-size: 12px;
  color: var(--bs-secondary-color, #6c757d);
}

/* ---- ספויילר בתצוגה המכווצת של הפוסט שמגיבים אליו ---- */
/* הכפתור המלא גבוה מהשורה היחידה של החלונית ונחתך - מקטינים אותו לתגית שנכנסת בשורה */

[component="post/parent"][data-collapsed="true"] [component="post/parent/content"] [class*="spoiler" i] {
  display: inline !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  background: none !important;
}

[component="post/parent"][data-collapsed="true"] [component="post/parent/content"] [class*="spoiler" i][class*="content" i],
[component="post/parent"][data-collapsed="true"] [component="post/parent/content"] [class*="spoiler" i][class*="body" i] {
  display: none !important;
}

[component="post/parent"][data-collapsed="true"] [component="post/parent/content"] .btn,
[component="post/parent"][data-collapsed="true"] [component="post/parent/content"] button {
  display: inline-flex !important;
  align-items: center;
  gap: 4px;
  height: auto !important;
  min-height: 0 !important;
  margin: 0 !important;
  padding: 0 8px !important;
  border-radius: 999px !important;
  font-size: 11px !important;
  line-height: 18px !important;
  vertical-align: text-bottom;
  /* לחיצה עוברת לחלונית עצמה ופותחת אותה, כמו לחיצה על כל מקום אחר בה */
  pointer-events: none;
}

[component="post/parent"][data-collapsed="true"] [component="post/parent/content"] .btn i,
[component="post/parent"][data-collapsed="true"] [component="post/parent/content"] .btn svg,
[component="post/parent"][data-collapsed="true"] [component="post/parent/content"] button i,
[component="post/parent"][data-collapsed="true"] [component="post/parent/content"] button svg {
  font-size: 11px !important;
  width: 1em;
  height: 1em;
}

/* ---- תמונה שהודבקה באמצע שורה ---- */
/* תמונה אחרי תיוג או כמה מילים מופיעה בשורה משלה מתחת לטקסט, ולא לידו */

[component="post/content"] img:not(.emoji):not([class*="emoji"]):not(.mf-panel img) {
  display: block;
  margin-top: 6px;
  margin-bottom: 6px;
}

/* החלונית המכווצת מעמעמת את התוכן שלה - הספויילר נשאר כחול מלא כמו במקור */
[component="post/parent"][data-collapsed="true"]:has([class*="spoiler" i]),
[component="post/parent"][data-collapsed="true"] [component="post/parent/content"]:has([class*="spoiler" i]),
[component="post/parent"][data-collapsed="true"] [component="post/parent/content"] [class*="spoiler" i],
[component="post/parent"][data-collapsed="true"] [component="post/parent/content"] [class*="spoiler" i] .btn,
[component="post/parent"][data-collapsed="true"] [component="post/parent/content"] [class*="spoiler" i] button,
[component="post/parent"][data-collapsed="true"] [component="post/parent/content"] .btn-primary {
  opacity: 1 !important;
  filter: none !important;
}

[component="post/parent"][data-collapsed="true"] [component="post/parent/content"] [class*="spoiler" i] .btn,
[component="post/parent"][data-collapsed="true"] [component="post/parent/content"] [class*="spoiler" i] button,
[component="post/parent"][data-collapsed="true"] [component="post/parent/content"] .btn-primary {
  background-color: var(--bs-primary, #0d6efd) !important;
  border-color: var(--bs-primary, #0d6efd) !important;
  color: #fff !important;
}

/* ---- ספויילר בתוך פוסט ---- */
/* ספויילר שיש לפניו טקסט עובר לסוף השורה הקודמת (content.js) ומוצג כתגית כחולה בגודל האותיות. */
/* הודעה שמתחילה בספויילר נשארת כמו שהיא. */

.mf-hidden-br {
  display: none !important;
}

.mf-spoiler-btn {
  display: inline-flex !important;
  align-items: center;
  gap: 0.35em;
  height: auto !important;
  min-height: 0 !important;
  margin: 0 0 0 0 !important;
  margin-inline-start: 6px !important;
  padding: 0.05em 0.85em !important;
  border-radius: 999px !important;
  font-size: 0.9em !important;
  line-height: 1.6 !important;
  background-color: var(--bs-primary, #0d6efd) !important;
  border-color: var(--bs-primary, #0d6efd) !important;
  color: #fff !important;
  opacity: 1 !important;
  vertical-align: baseline;
}

.mf-spoiler-btn:hover {
  background-color: #0b5ed7 !important;
}

.mf-spoiler-btn i,
.mf-spoiler-btn svg {
  font-size: 1em !important;
  width: 1em;
  height: 1em;
}

/* ---- תגית לקובץ מצורף בתוך הפוסט ---- */
/* תגית קטנה ומעוגלת בתוך השורה: אייקון קטן, שם הקובץ והגודל */

a.mf-topic.mf-filebanner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: auto;
  max-width: 100%;
  margin: 2px 0;
  padding: 3px 12px 3px 10px;
  border: 1px solid var(--bs-border-color, rgba(128, 128, 128, 0.25));
  border-radius: 999px;
  background: var(--bs-tertiary-bg, #f0f2f5);
  vertical-align: middle;
}

a.mf-topic.mf-filebanner:hover,
a.mf-topic.mf-filebanner:focus-visible {
  background: rgba(13, 110, 253, 0.1);
  border-color: rgba(13, 110, 253, 0.35);
  box-shadow: none;
}

.mf-filebanner .mf-topic-icon {
  width: auto;
  height: auto;
  background: none;
}

.mf-filebanner .mf-topic-icon svg {
  width: 15px;
  height: 19px;
}

.mf-filebanner .mf-topic-body {
  flex-direction: row;
  align-items: baseline;
  gap: 6px;
}

.mf-filebanner .mf-topic-title {
  display: block;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mf-filebanner .mf-topic-meta {
  font-size: 12px;
  white-space: nowrap;
}

/* הגודל באנגלית בתוך שורה בעברית - מבודד כדי שלא יתערבב עם "קובץ ZIP" */
.mf-filebanner-size {
  unicode-bidi: isolate;
}

.mf-filebanner-size:not(:empty)::after {
  content: " ·";
}

/* הנקודה בצד ימין של הגודל, צמודה ל-"ZIP" - הרווח בצד ימין */
.mf-filebanner-size:not(:empty) {
  margin-right: 0.35em;
}

/* ---- באנר לקישור לאתר חיצוני ---- */

.mf-topic-icon.mf-extlink-icon img {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  object-fit: contain;
}

/* הכתובת: שורה אחת מקוצרת, מיושרת לימין כמו שאר הבאנר */
.mf-topic-desc.mf-extlink-path {
  display: block;
  font-size: 12px;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mf-extlink-path:empty {
  display: none;
}

/* ---- תמונות מספויילרים ---- */
/* באנר קטן מתחת לתמונות של הפוסט; התמונות שבתוך הספויילרים נפתחות רק בלחיצה עליו */

.mf-subtoggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px 4px 12px;
  border: 1px dashed rgba(13, 110, 253, 0.45);
  border-radius: 999px;
  background: rgba(13, 110, 253, 0.06);
  color: #0b5ed7;
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.6;
  cursor: pointer;
  transition: background-color 0.12s, border-color 0.12s;
}

.mf-subtoggle:hover,
.mf-subtoggle:focus-visible {
  background: rgba(13, 110, 253, 0.14);
  border-color: rgba(13, 110, 253, 0.7);
  outline: none;
}

.mf-subtoggle[aria-expanded="true"] {
  border-style: solid;
  background: rgba(13, 110, 253, 0.12);
}

[data-bs-theme="dark"] .mf-subtoggle {
  color: #6ea8fe;
}

.mf-subtoggle svg {
  width: 16px;
  height: 16px;
}

.mf-spoiler-images .mf-grid {
  margin-top: 8px;
}

/* ---- הודעת אישור בהעלאה ---- */

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

.mfs-kinds.mfs-disabled {
  opacity: 0.5;
}

.mfs-modes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 0 16px 14px;
}

.mfs-mode {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 10px 12px;
  border: 1px solid var(--mfs-border);
  border-radius: 10px;
  cursor: pointer;
}

.mfs-mode input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.mfs-mode-name {
  font-size: 14px;
  font-weight: 600;
}

.mfs-mode-desc {
  font-size: 12px;
  color: var(--mfs-muted);
}

.mfs-mode:hover,
.mfs-mode:has(input:checked) {
  border-color: var(--mfs-accent);
}

.mfs-mode:has(input:checked) {
  background: color-mix(in srgb, var(--mfs-accent) 10%, transparent);
  box-shadow: inset 0 0 0 1px var(--mfs-accent);
}

.mfs-mode:has(input:focus-visible) {
  outline: 2px solid var(--mfs-accent);
  outline-offset: 2px;
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

@media (max-width: 480px) {
  .mfs-modes {
    grid-template-columns: 1fr;
  }
}
    `;

    function addStyle() {
        const style = document.createElement("style");
        style.id = "mf-style";
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
