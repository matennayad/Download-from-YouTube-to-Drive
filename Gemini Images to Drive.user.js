// ==UserScript==
// @name         תמונות גמיני לדרייב - מטען נייד
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  כל תמונה שגמיני יוצר נשלחת אוטומטית לשרת החיצוני ועולה לדרייב - כך התמונות נשמרות אצלך בדרייב ולא רק בהתכתבות
// @match       https://gemini.google.com/*
// @homepageURL https://github.com/matennayad/Download-from-YouTube-to-Drive
// @downloadURL https://raw.githubusercontent.com/matennayad/Download-from-YouTube-to-Drive/main/Gemini%20Images%20to%20Drive.user.js
// @updateURL   https://raw.githubusercontent.com/matennayad/Download-from-YouTube-to-Drive/main/Gemini%20Images%20to%20Drive.user.js
// @run-at      document-idle
// @noframes
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    'use strict';

    // אותו Web App שמשמש את תוסף היוטיוב - אותו אימות מכשיר, אותו לוג
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwT34zd8XK8pmEnALIacYVLq0N6_3QDE9F_qCNFD4c5yhTgPi32Yj1FWA6FpiJSLqXH/exec";

    // כמה פעמים בשנייה סורקים את העמוד לתמונות חדשות
    const SCAN_INTERVAL_MS = 2500;

    // תמונה נחשבת "תמונה שנוצרה" רק אם היא לפחות בגודל הזה (פיקסלים) -
    // כדי לא לתפוס אייקונים ואווטארים
    const MIN_IMAGE_SIZE = 200;

    // כמה תמונות ממתינות אפשר לצבור לפני אימות (הישנות נזרקות)
    const MAX_PENDING = 20;

    // כמה מזהי העלאות לזכור בזיכרון הסשן כדי שלא נעלה פעמיים את אותה תמונה
    const MAX_UPLOADED_KEYS = 300;

    // timeout לבקשות זולות (אימות). להעלאת תמונה אין timeout - היא עלולה
    // להתארך בשרת (שליפה מה-CDN + העלאה לדרייב).
    const CHEAP_REQUEST_TIMEOUT_MS = 60000;

    // ============================================================
    // מצב
    // ============================================================

    let authed = false;
    let authCheckInFlight = false;
    let lastAuthAttempt = 0;
    let uploadInFlight = 0;
    let autoMode = GM_getValue("geminiAutoMode", "1") === "1";

    // הפרש מינימלי בין ניסיונות אימות שקטים - כדי שכשל רשת מתמשך
    // לא ינפץ את השרת בבקשות כל שתי שניות וחצי
    const AUTH_RETRY_COOLDOWN_MS = 60000;

    // כמה ניסיונות העלאה מקסימום לכל תמונה לפני שנזרוק אותה מהתור
    const MAX_UPLOAD_TRIES = 5;

    // כמה זמן לחכות אחרי שתמונת blob נצפתה לראשונה לפני עיבוד -
    // נותן לגמיני זמן להציג פלייסהולדר (עם תמונת gg שבורה לצדו)
    // אם התצוגה נכשלה, כך שנספיק לזהות את זה לפני שחילצנו מה-canvas
    const BLOB_SETTLE_MS = 3000;

    // key -> { prompt, image (dataURL) או image_url, ts }
    const pending = new Map();

    // כתובות תוצר שכבר שויכו להעלאה - כדי שאותה תמונה לא תעלה פעמיים
    const consumedSourceURLs = new Set();

    const uploadingKeys = new Set();
    const uploadedKeys = new Set();

    // זמן הצפייה הראשון של כל תמונת blob - להשהיית עיבוד עד שהתצוגה מתייצבת
    const blobFirstSeenAt = new WeakMap();

    function trimKeySet(set, max) {
        while (set.size > max) {
            set.delete(set.values().next().value);
        }
    }

    // ============================================================
    // עזרי אחסון
    // ============================================================

    function getEmail() {
        return (GM_getValue("userEmail", "") || "").trim();
    }

    function getDeviceToken() {
        return GM_getValue("deviceToken", "") || "";
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((email || "").trim());
    }

    // זיכרון אימות ממתין - כמו בתוסף היוטיוב: אם ריעננת את העמוד אחרי
    // שנשלח קוד למייל, חלונית הקוד נפתחת מחדש בלי לשלוח קוד נוסף
    const PENDING_VERIFICATION_KEY = "geminiPendingVerification";
    const PENDING_VERIFICATION_TTL_MS = 15 * 60 * 1000;

    function setPendingVerification(email) {
        GM_setValue(PENDING_VERIFICATION_KEY, JSON.stringify({
            email: email || "",
            ts: Date.now()
        }));
    }

    function getPendingVerification() {
        try {
            const data = JSON.parse(GM_getValue(PENDING_VERIFICATION_KEY, ""));
            if (data && data.email &&
                (Date.now() - data.ts) < PENDING_VERIFICATION_TTL_MS) {
                return data.email;
            }
        } catch (e) {}
        return "";
    }

    function clearPendingVerification() {
        GM_setValue(PENDING_VERIFICATION_KEY, "");
    }

    // ============================================================
    // חדירה ל-Shadow DOM
    // ============================================================
    // חלקים מהממשק של גמיני בנויים מ-web components עם shadow roots,
    // ו-querySelectorAll רגיל לא רואה אותם בכלל. הפונקציות כאן מחפשות
    // לעומק, כולל בתוך שורשי צל.

    function deepQueryAll(root, selector, out) {
        out = out || [];
        if (!root) return out;

        try {
            root.querySelectorAll(selector).forEach(function (el) {
                out.push(el);
            });
        } catch (e) {}

        const all = root.querySelectorAll("*");
        for (const el of all) {
            if (el.shadowRoot) deepQueryAll(el.shadowRoot, selector, out);
        }

        return out;
    }

    // closest שחוצה גבולות shadow root - כי closest רגיל עוצר בגבול
    function composedClosest(el, selector) {
        let node = el;
        while (node) {
            try {
                if (node.matches && node.matches(selector)) return node;
            } catch (e) {}
            if (node.parentElement) {
                node = node.parentElement;
                continue;
            }
            const root = node.getRootNode ? node.getRootNode() : null;
            node = root && root.host ? root.host : null;
        }
        return null;
    }

    // ============================================================
    // זיהוי תמונות שנוצרו על ידי גמיני
    // ============================================================
    // ההיגיון: תמונה שגמיני יצר היא <img> גדולה (מעל MIN_IMAGE_SIZE)
    // ממקור blob:, data: או googleusercontent, שמופיעה בעמוד השיחה
    // ולא בתוך הודעת המשתמש. איורי פתיחה ולוגואים קטנים מסוננים
    // לפי גודל, ותמונות שהמשתמש העלה מסוננות לפי user-query.

    function isGeneratedImageCandidate(img) {

        if (!img || img.tagName !== "IMG") return false;

        const src = img.currentSrc || img.src || "";
        if (!src) return false;

        // גודל טבעי או גודל מוצג. תמונה שנכשלה בטעינה (למשל חסימת
        // נטפרי על שרת התמונות) מדווחת naturalWidth=0 אבל עדיין
        // מוצגת בעמוד - גם אותה רוצים לתפוס, כי השרת יכול לשלוף
        // אותה לבד מהכתובת.
        const loaded = (img.naturalWidth || 0) > 0;
        const w = loaded ? img.naturalWidth : (img.clientWidth || 0);
        const h = loaded ? img.naturalHeight : (img.clientHeight || 0);
        const broken = img.complete && (img.naturalWidth || 0) === 0;

        // תמונת תוצר שנכשלה בטעינה עם כתובת תוצר של גמיני (/gg/):
        // הכתובת שווה זהב גם אם המקום שנשאר לה בעמוד מכווץ
        // (בלי תמונה טעונה אין יחס-גובה, והעמוד מכווץ את הגובה).
        const brokenGenerated =
            broken && /googleusercontent\.com\/gg\//.test(src) &&
            w >= MIN_IMAGE_SIZE;

        if (w < MIN_IMAGE_SIZE || h < MIN_IMAGE_SIZE) {
            if (!brokenGenerated) return false;
        }

        const srcType =
            src.startsWith("blob:") ? "blob" :
            src.startsWith("data:image") ? "data" :
            /googleusercontent\.com/.test(src) ? "guser" : "";

        if (!srcType) return false;

        // תמונות שהמשתמש העלה בעצמו מוצגות בהודעת המשתמש - לא תוצרי גמיני
        if (composedClosest(img, "user-query, [class*='user-query']")) return false;

        // תוצרי גמיני: כל תמונה גדולה מהמקורות הללו שאינה בהודעת המשתמש.
        // בעבר חייבנו model-response סביב, אבל גמיני משנה את מבנה ה-DOM
        // תדיר והסתמכות עליו גרמה לפספוס תמונות.
        return true;
    }

    // ניסיון לשלוף את טקסט ההנחיה שהובילה לתמונה: הודעת המשתמש
    // שמופיעה בעמוד לפני התשובה שמכילה את התמונה
    function findPromptFor(img) {

        const container =
            composedClosest(img, "model-response") ||
            composedClosest(img, "[class*='model-response']") ||
            composedClosest(img, "[class*='conversation-container']") ||
            img;

        const queries = deepQueryAll(
            document,
            "user-query, [class*='user-query']"
        );

        let best = null;

        queries.forEach(function (q) {
            // השאילתה מופיעה בעמוד לפני התשובה
            if (q.compareDocumentPosition(container) &
                Node.DOCUMENT_POSITION_FOLLOWING) {
                best = q;
            }
        });

        if (!best) return "";

        const text = (best.innerText || best.textContent || "")
            .trim()
            .replace(/\s+/g, " ");

        return text.substring(0, 200);
    }

    // חילוץ התמונה ל-dataURL בכמה שיטות, מהמהירה והאמינה ביותר:
    // 1. Canvas - ציור התמונה וחילוץ הבייטים מהזיכרון. עובד מצוין
    //    ל-blob: (התמונות של גמיני) בלי רשת בכלל, ועוקף חסימות CSP
    //    שגמיני מטיל על fetch מהדף.
    // 2. fetch רגיל - ל-https עם כשרון CORS או ל-data:.
    // 3. GM_xmlhttpRequest - יוצא מהרחבת טמפרמונקי ועוקף גם CORS;
    //    רלוונטי רק ל-https, כי blob: קיים רק בתוך הדף.
    // מחזיר null אם כל השיטות נכשלו.
    function imageToDataURL(img, src) {
        return new Promise(function (resolve) {

            // שיטה 1: canvas מהזיכרון
            try {
                if (img.naturalWidth > 0) {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);

                    // וידוא שהציור הצליח באמת - דוגמים פיקסלים ומוודאים
                    // שלא הכל שקוף (כך נראה canvas ריק או מזוהם שהצליח
                    // להתחמק מהחריגה)
                    let opaque = false;
                    const data = ctx.getImageData(
                        0, 0, canvas.width, canvas.height
                    ).data;
                    for (let i = 3; i < data.length; i += 4 * 997) {
                        if (data[i] > 0) { opaque = true; break; }
                    }
                    if (!opaque) throw new Error("canvas empty");

                    const canvasURL = canvas.toDataURL("image/png");
                    if (canvasURL && canvasURL.indexOf("data:image") === 0) {
                        resolve(canvasURL);
                        return;
                    }
                }
            } catch (e) {
                // canvas מזוהם או שגיאה - ממשיכים לשיטה הבאה
            }

            // שיטה 2: fetch רגיל
            try {
                fetch(src)
                    .then(function (r) { return r.blob(); })
                    .then(function (blob) {
                        const reader = new FileReader();
                        reader.onload = function () {
                            resolve(reader.result || null);
                        };
                        reader.onerror = function () { resolve(null); };
                        reader.readAsDataURL(blob);
                    })
                    .catch(function () {

                        // שיטה 3: GM_xmlhttpRequest - רק ל-https
                        if (!src.startsWith("https://")) { resolve(null); return; }

                        GM_xmlhttpRequest({
                            method: "GET",
                            url: src,
                            responseType: "blob",
                            timeout: 60000,
                            onload: function (resp) {
                                try {
                                    const reader = new FileReader();
                                    reader.onload = function () {
                                        resolve(reader.result || null);
                                    };
                                    reader.onerror = function () { resolve(null); };
                                    reader.readAsDataURL(resp.response);
                                } catch (e) { resolve(null); }
                            },
                            onerror: function () { resolve(null); },
                            ontimeout: function () { resolve(null); }
                        });
                    });
            } catch (e) {
                resolve(null);
            }
        });
    }

    // מפתח ייחודי לתמונה כדי למנוע העלאות כפולות
    function keyForDataURL(dataURL) {
        // דגימה מתחילת התוכן + אורך: זיהוי זהה לתמונה זהה בתוך הסשן
        return "b64:" + dataURL.length + ":" + dataURL.substring(0, 128);
    }

    function keyForSrc(src) {
        return "src:" + src;
    }

    // ============================================================
    // איתור כתובת המקור האמיתית של תמונת blob בתוך התשובה
    // ============================================================
    // תמונות גמיני מוצגות בדף דרך blob: - אבל בתוך התשובה עצמה
    // (למשל <img> שנכשלה בטעינה, או קישור הורדה) מופיעה גם
    // כתובת googleusercontent אמיתית. השרת שלנו - בלי סינון
    // נטפרי - שולף ממנה את התמונה המקורית במלוא איכותה, גם כשהתצוגה
    // בדפדפן נכשלה בגלל הסינון.

    // מאתר את התשובה (ה-container) שאליה שייכת התמונה
    function responseContainerFor(img) {
        return composedClosest(img, "model-response") ||
            composedClosest(img, "[class*='model-response']") ||
            composedClosest(img, "[class*='conversation-container']") ||
            document;
    }

    // כתובות תוצר של גמיני (gg/labs-ai) בתוך אלמנט - בין אם זו תמונה
    // שנכשלה בטעינה בדפדפן (נטפרי) ובין אם קישור הורדה. אלה הכתובות
    // שהשרת שלנו שולף מהן את התמונה האמיתית ישירות מגוגל, בלי סינון.
    function findGeneratedURLsIn(container) {

        const urls = [];
        const seen = {};

        function push(u) {
            if (!u || seen[u]) return;
            if (!/googleusercontent\.com\/(gg|labs-ai)\//.test(u)) return;
            seen[u] = true;
            urls.push(u);
        }

        deepQueryAll(container, "img").forEach(function (img) {
            push(img.currentSrc || img.src || "");
        });

        deepQueryAll(container, "a[href]").forEach(function (a) {
            push(a.getAttribute("href") || "");
        });

        return urls;
    }

    // האם התשובה מכילה תמונת תוצר שנכשלה בטעינה - סימן שמה שמוצג
    // במקומה הוא פלייסהולדר של גמיני ולא התמונה עצמה
    function containerHasBrokenGeneratedImage(container) {

        const imgs = deepQueryAll(container, "img");

        for (const img of imgs) {
            const src = img.currentSrc || img.src || "";
            if (/googleusercontent\.com\/(gg|labs-ai)\//.test(src) &&
                img.complete && (img.naturalWidth || 0) === 0) {
                return true;
            }
        }

        return false;
    }

    function rememberConsumedSourceURL(url) {
        consumedSourceURLs.add(url);
        trimKeySet(consumedSourceURLs, MAX_UPLOADED_KEYS);
    }

    // האם הכתובת היא כתובת תוצר של גמיני (gg/labs-ai)
    function isGeneratedSrc(src) {
        return /googleusercontent\.com\/(gg|labs-ai)\//.test(src || "");
    }

    // האם כתובת המקור כבר נתפסה/ממתינה/הועלתה - לא לתפוס פעמיים
    function urlAlreadyQueued(url) {
        const key = keyForSrc(url);
        return consumedSourceURLs.has(url) ||
            uploadedKeys.has(key) ||
            uploadingKeys.has(key) ||
            pending.has(key);
    }

    // בונה רשומת העלאה מאלמנט תמונה. מחזיר Promise שמתפוגג לרשומה או null.
    // עדיפות העלאה: כתובת מקור אמיתית של גוגל (השרת שולף בעצמו - איכות
    // מלאה ובלי חסימת נטפרי) ורק אחר כך בייטים מהדפדפן (canvas).
    async function buildEntry(img) {

        const src = img.currentSrc || img.src || "";
        if (!src) return null;

        const prompt = findPromptFor(img);

        // תמונה שנכשלה בטעינה בדפדפן (למשל נטפרי חוסם את שרת התמונות
        // של גוגל) - הכתובת עצמה עדיין תקינה, והשרת ישלוף ממנה.
        const broken = img.complete && (img.naturalWidth || 0) === 0;

        // מפתח לפי המקור כבר עכשיו - כדי לא לתפוס את אותה תמונה
        // שוב בזמן שהחילוץ מתבצע
        const srcKey = keyForSrc(src);

        // 1) המקור עצמו הוא כתובת תוצר של גמיני - השרת ישלוף ממנה ישירות
        // מגוגל, גם אם התצוגה בדפדפן נכשלה
        if (isGeneratedSrc(src)) {
            if (urlAlreadyQueued(src)) return null;
            rememberConsumedSourceURL(src);
            return {
                key: srcKey,
                srcKey: srcKey,
                image: "",
                image_url: src,
                prompt: prompt
            };
        }

        // 2) תמונת blob:
        if (src.startsWith("blob:")) {

            const container = responseContainerFor(img);

            // פלייסהולדר: בתשובה יש תמונת תוצר שגוגל שלחה והדפדפן לא
            // הצליח להציג (נטפרי). מה שמוצג במקומה הוא מוזאיקת השגיאה
            // שגמיני מייצר - אסור לחלץ אותה ל-canvas ולהעלות אותה.
            // מעלים רק את כתובת המקור אם נמצאה בתשובה.
            if (containerHasBrokenGeneratedImage(container)) {

                const urls = findGeneratedURLsIn(container);

                for (const u of urls) {
                    if (urlAlreadyQueued(u)) continue;
                    rememberConsumedSourceURL(u);
                    return {
                        key: keyForSrc(u),
                        srcKey: srcKey,
                        image: "",
                        image_url: u,
                        prompt: prompt
                    };
                }

                // אין כתובת מקור - מוותרים במקום להעלות את הפלייסהולדר
                return null;
            }

            // blob תקין של תמונה שמוצגת באמת - מחלצים את הבייטים מהתצוגה
            if (!broken) {
                const dataURL = await imageToDataURL(img, src);

                if (dataURL) {
                    return {
                        key: keyForDataURL(dataURL),
                        srcKey: srcKey,
                        image: dataURL,
                        image_url: "",
                        prompt: prompt
                    };
                }
            }

            // blob שבור או שלא ניתן לחילוץ - אין מה לעשות איתו
            return null;
        }

        // 3) כתובת googleusercontent אחרת (לא gg) שנטענה בהצלחה -
        // גם אותה השרת יכול לשלוף בעצמו
        if (!broken && /googleusercontent\.com/.test(src)) {
            if (urlAlreadyQueued(src)) return null;
            return {
                key: srcKey,
                srcKey: srcKey,
                image: "",
                image_url: src,
                prompt: prompt
            };
        }

        // 4) תמונת data: שנטענה בהצלחה
        if (!broken && src.startsWith("data:image")) {
            return {
                key: keyForDataURL(src),
                srcKey: srcKey,
                image: src,
                image_url: "",
                prompt: prompt
            };
        }

        return null;
    }

    // ============================================================
    // סריקה והעלאה
    // ============================================================

    async function scanForImages() {

        const imgs = deepQueryAll(document, "img");

        let found = 0;

        for (const img of imgs) {

            if (!isGeneratedImageCandidate(img)) continue;

            const src = img.currentSrc || img.src || "";
            const srcKey = keyForSrc(src);

            // כבר הועלתה / בהעלאה / ממתינה - לא נוגעים
            if (uploadedKeys.has(srcKey)) continue;
            if (uploadingKeys.has(srcKey)) continue;
            if (pending.has(srcKey)) continue;

            let dupKey = false;
            pending.forEach(function (entry) {
                if (entry.srcKey === srcKey) dupKey = true;
            });
            if (dupKey) continue;

            // השהיה קצרה לתמונות blob שזה עתה נצפו - נותן לגמיני זמן
            // להציג פלייסהולדר אם התצוגה נכשלה, לפני שנחלץ מה-canvas
            if (src.startsWith("blob:")) {
                const firstSeen = blobFirstSeenAt.get(img);
                if (!firstSeen) {
                    blobFirstSeenAt.set(img, Date.now());
                    continue;
                }
                if (Date.now() - firstSeen < BLOB_SETTLE_MS) continue;
            }

            const entry = await buildEntry(img);

            if (!entry) continue;

            // תמונה זהה שכבר הועלתה בסשן (למשל גמיני הציג אותה שוב
            // עם blob URL חדש) - לא מעלים פעמיים
            if (uploadedKeys.has(entry.key)) {
                uploadedKeys.add(srcKey);
                continue;
            }

            if (uploadingKeys.has(entry.key) || pending.has(entry.key)) {
                uploadedKeys.add(srcKey);
                continue;
            }

            addPending(entry);
            found++;
        }

        return found;
    }

    function addPending(entry) {

        // הגבלת גודל התור - הישנות ביותר נזרקות
        while (pending.size >= MAX_PENDING) {
            const oldestKey = pending.keys().next().value;
            pending.delete(oldestKey);
        }

        pending.set(entry.key, entry);
        uploadedKeys.add(entry.srcKey);
        trimKeySet(uploadedKeys, MAX_UPLOADED_KEYS);

        updateStatusLabel();

        // מצב אוטומטי + מאומת = מעלים מיד
        if (authed && autoMode) {
            uploadEntry(entry);
        }
    }

    function uploadEntry(entry) {

        if (uploadingKeys.has(entry.key) || uploadedKeys.has(entry.key)) {
            return;
        }

        const email = getEmail();

        if (!authed || !email) {
            // עדיין לא מאומתים - התמונה נשארת בתור ותועלה אחרי האימות
            return;
        }

        uploadingKeys.add(entry.key);
        entry.tries = (entry.tries || 0) + 1;
        uploadInFlight++;
        updateStatusLabel();

        const payload = {
            action: "uploadGeminiImage",
            email: email,
            deviceToken: getDeviceToken(),
            prompt: entry.prompt || "",
            image: entry.image || "",
            image_url: entry.image_url || ""
        };

        requestJson(payload, {
            onload: function (res) {
                finishUpload();

                if (res.deviceToken) {
                    GM_setValue("deviceToken", res.deviceToken);
                }

                if (res.success) {
                    uploadedKeys.add(entry.key);
                    pending.delete(entry.key);
                    showToast("✅ התמונה הועלתה לדרייב", res.driveLink || "");
                    updateStatusLabel();
                    return;
                }

                if (res.needsVerification) {
                    // אימות פג - מחזירים את התמונה לתור ופותחים חלונית קוד
                    uploadingKeys.delete(entry.key);
                    setPendingVerification(email);
                    authed = false;
                    showVerificationCodeModal(email);
                    updateStatusLabel();
                    return;
                }

                uploadingKeys.delete(entry.key);
                showToast("❌ ההעלאה נכשלה: " + (res.error || "שגיאה לא ידועה"));
                updateStatusLabel();
            },
            onerror: function () {
                finishUpload();
                uploadingKeys.delete(entry.key);
                // נשארת בתור - הסריקה הבאה לא תרים אותה שוב, אבל
                // העלאה ידנית תנסה שוב
                showToast("❌ אין תשובה מהשרת - התמונה תישמר לניסיון חוזר");
                updateStatusLabel();
            },
            onBadJson: function (response) {
                finishUpload();
                uploadingKeys.delete(entry.key);
                showToast("❌ תשובה לא תקינה מהשרת - ייתכן שה-Web App לא פרוס");
                updateStatusLabel();
            }
        });
    }

    function finishUpload() {
        uploadInFlight = Math.max(0, uploadInFlight - 1);
    }

    // מעלה את כל מה שממתין (כפתור ידני או אחרי אימות).
    // תמונות שנכשלו יותר מדי פעמים מושמטות - לא לרדוף אחרי שגיאה קבועה.
    function uploadAllPending() {
        if (!authed || !getEmail()) return;
        const entries = Array.from(pending.values());
        entries.forEach(function (entry) {
            if ((entry.tries || 0) >= MAX_UPLOAD_TRIES) return;
            uploadEntry(entry);
        });
    }

    // ============================================================
    // שכבת התקשורת מול השרת
    // ============================================================

    function requestJson(payload, handlers, options) {

        const opts = options || {};

        GM_xmlhttpRequest({
            method: "POST",
            url: WEB_APP_URL,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify(payload),
            timeout: opts.timeoutMs,
            onload: function (response) {
                let res = null;
                try {
                    res = JSON.parse(response.responseText);
                } catch (e) {
                    console.error("שגיאה בפענוח JSON:", e, response.responseText);
                    if (handlers.onBadJson) handlers.onBadJson(response);
                    return;
                }
                if (handlers.onload) handlers.onload(res, response);
            },
            onerror: function (err) {
                console.error("שגיאת תקשורת בבקשה לשרת:", err);
                if (handlers.onerror) handlers.onerror(err);
            },
            ontimeout: function () {
                console.error("timeout בבקשה לשרת");
                if (handlers.onerror) handlers.onerror({ type: "timeout" });
            }
        });
    }

    // ============================================================
    // אימות מכשיר - זהה לתוסף היוטיוב
    // ============================================================

    function checkAuthAndContinue(email, onSuccess) {

        if (authCheckInFlight) return;
        if (Date.now() - lastAuthAttempt < AUTH_RETRY_COOLDOWN_MS) {
            // בקשת אימות נשלחה לאחרונה - ממתינים במקום להציף
            return;
        }
        lastAuthAttempt = Date.now();
        authCheckInFlight = true;
        setLoading(true);

        requestJson(
            {
                action: "checkStatus",
                email: email,
                deviceToken: getDeviceToken()
            },
            {
                onload: function (res) {
                    authCheckInFlight = false;
                    setLoading(false);

                    if (res.deviceToken) {
                        GM_setValue("deviceToken", res.deviceToken);
                    }

                    if (res.success && res.authenticated) {
                        clearPendingVerification();
                        authed = true;
                        updateStatusLabel();
                        if (onSuccess) onSuccess();
                        return;
                    }

                    if (res.needsVerification) {
                        setPendingVerification(email);
                        showVerificationCodeModal(email, onSuccess);
                        return;
                    }

                    showToast("❌ " + (res.error || "האימות נכשל"));
                },
                onerror: function () {
                    authCheckInFlight = false;
                    setLoading(false);
                    showToast("❌ אין תשובה מהשרת");
                },
                onBadJson: function () {
                    authCheckInFlight = false;
                    setLoading(false);
                    showToast("❌ תשובה לא תקינה מהשרת - ה-Web App לא פרוס בגרסה העדכנית?");
                }
            },
            { timeoutMs: CHEAP_REQUEST_TIMEOUT_MS }
        );
    }

    function submitVerificationCode(email, code, onSuccess) {

        setLoading(true);

        requestJson(
            {
                action: "checkStatus",
                email: email,
                deviceToken: getDeviceToken(),
                verificationCode: code
            },
            {
                onload: function (res) {
                    setLoading(false);

                    if (res.deviceToken) {
                        GM_setValue("deviceToken", res.deviceToken);
                    }

                    if (res.success && res.authenticated) {
                        clearPendingVerification();
                        authed = true;
                        updateStatusLabel();
                        showToast("🔓 האימות הצליח");
                        if (onSuccess) onSuccess();
                        return;
                    }

                    if (res.needsVerification) {
                        showVerificationCodeModal(
                            email,
                            onSuccess,
                            res.error || "קוד שגוי, נסה שוב:"
                        );
                        return;
                    }

                    showToast("❌ " + (res.error || "האימות נכשל"));
                },
                onerror: function () {
                    setLoading(false);
                    showToast("❌ אין תשובה מהשרת");
                },
                onBadJson: function () {
                    setLoading(false);
                    showToast("❌ תשובה לא תקינה מהשרת");
                }
            },
            { timeoutMs: CHEAP_REQUEST_TIMEOUT_MS }
        );
    }

    // ============================================================
    // ממשק משתמש
    // ============================================================

    function createFloatingMenu() {

        if (document.getElementById("gemini-drive-container")) return;

        const container = document.createElement("div");
        container.id = "gemini-drive-container";
        Object.assign(container.style, {
            position: "fixed", bottom: "20px", left: "20px",
            zIndex: "999999", display: "flex", flexDirection: "column",
            alignItems: "center", gap: "8px",
            fontFamily: "Arial, sans-serif"
        });

        // לוח האפשרויות
        const optionsDiv = document.createElement("div");
        optionsDiv.id = "gemini-drive-options";
        Object.assign(optionsDiv.style, {
            display: "none", flexDirection: "column", gap: "6px",
            backgroundColor: "rgba(255, 255, 255, 0.95)", padding: "10px",
            borderRadius: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
            direction: "rtl", minWidth: "210px"
        });

        const autoBtn = document.createElement("button");
        autoBtn.id = "gemini-drive-auto-btn";
        Object.assign(autoBtn.style, {
            background: "#34A853", color: "white", border: "none",
            padding: "8px 14px", borderRadius: "12px", fontWeight: "bold",
            cursor: "pointer", fontSize: "13px"
        });
        autoBtn.onclick = function () {
            autoMode = !autoMode;
            GM_setValue("geminiAutoMode", autoMode ? "1" : "0");
            updateAutoButton();
            if (autoMode && authed) uploadAllPending();
        };

        const manualBtn = document.createElement("button");
        manualBtn.innerText = "📤 העלה תמונות שנאספו עכשיו";
        Object.assign(manualBtn.style, {
            background: "#3182CE", color: "white", border: "none",
            padding: "8px 14px", borderRadius: "12px", fontWeight: "bold",
            cursor: "pointer", fontSize: "13px"
        });
        manualBtn.onclick = function () {
            if (!authed) {
                const email = getEmail();
                if (!email) {
                    showEmailModal();
                    return;
                }
                checkAuthAndContinue(email, uploadAllPending);
                return;
            }
            scanForImages().then(function (added) {
                uploadAllPending();
                if (!added && pending.size === 0) {
                    showToast("🤷 לא נמצאו תמונות חדשות בעמוד - גלול למעלה וודא שהתמונה מוצגת");
                }
            });
        };

        const diagBtn = document.createElement("button");
        diagBtn.innerText = "🔍 אבחון - מה התוסף רואה בעמוד";
        Object.assign(diagBtn.style, {
            background: "#DD6B20", color: "white", border: "none",
            padding: "8px 14px", borderRadius: "12px", fontWeight: "bold",
            cursor: "pointer", fontSize: "13px"
        });
        diagBtn.onclick = runDiagnostics;

        optionsDiv.appendChild(autoBtn);
        optionsDiv.appendChild(manualBtn);
        optionsDiv.appendChild(diagBtn);

        // מדבקת סטטוס
        const statusDiv = document.createElement("div");
        statusDiv.id = "gemini-drive-status";
        Object.assign(statusDiv.style, {
            display: "none", backgroundColor: "rgba(255, 255, 255, 0.95)",
            padding: "5px 12px", borderRadius: "12px", fontSize: "12px",
            fontWeight: "bold", color: "#B7791F", maxWidth: "260px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)", textAlign: "center"
        });

        // הכפתור הראשי
        const mainBtn = document.createElement("div");
        mainBtn.id = "gemini-drive-btn";
        mainBtn.innerText = "🖼️";
        mainBtn.title = "תמונות גמיני לדרייב";
        Object.assign(mainBtn.style, {
            width: "54px", height: "54px", cursor: "pointer",
            borderRadius: "50%", background: "rgba(255,255,255,0.95)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "26px", boxShadow: "0 4px 8px rgba(0,0,0,0.25)",
            transition: "transform 0.2s", userSelect: "none"
        });
        mainBtn.onmouseenter = function () {
            mainBtn.style.transform = "scale(1.08)";
        };
        mainBtn.onmouseleave = function () {
            mainBtn.style.transform = "scale(1)";
        };

        mainBtn.onclick = function () {

            if (optionsDiv.style.display === "flex") {
                optionsDiv.style.display = "none";
                return;
            }

            let email = getEmail();

            if (!email) {
                showEmailModal();
                return;
            }

            // אימות ממתין למייל הזה? חלונית הקוד נפתחת ישירות
            if (getPendingVerification() === email && !authed) {
                showVerificationCodeModal(email, function () {
                    optionsDiv.style.display = "flex";
                    uploadAllPending();
                });
                return;
            }

            if (authed) {
                optionsDiv.style.display = "flex";
                updateAutoButton();
                return;
            }

            checkAuthAndContinue(email, function () {
                optionsDiv.style.display = "flex";
                updateAutoButton();
                uploadAllPending();
            });
        };

        container.appendChild(optionsDiv);
        container.appendChild(statusDiv);
        container.appendChild(mainBtn);
        document.body.appendChild(container);

        updateAutoButton();
        updateStatusLabel();
    }

    function updateAutoButton() {
        const btn = document.getElementById("gemini-drive-auto-btn");
        if (!btn) return;
        btn.innerText = autoMode
            ? "🟢 העלאה אוטומטית - פעילה (לחץ לכיבוי)"
            : "🔴 העלאה אוטומטית - כבויה (לחץ להפעלה)";
        btn.style.background = autoMode ? "#34A853" : "#718096";
    }

    function updateStatusLabel() {

        const label = document.getElementById("gemini-drive-status");
        if (!label) return;

        let text = "";

        if (uploadInFlight > 0) {
            text = "⏳ מעלה " + uploadInFlight + " תמונה/ות לדרייב...";
        } else if (!authed && pending.size > 0) {
            text = "🖼️ " + pending.size + " תמונות ממתינות - לחץ על הכפתור והתחבר";
        } else if (!authed) {
            text = "";
        } else if (uploadingKeys.size === 0 && pending.size > 0 && !autoMode) {
            text = "🖼️ " + pending.size + " תמונות בתור (העלאה אוטומטית כבויה)";
        }

        label.innerText = text;
        label.style.display = text ? "block" : "none";
    }

    function setLoading(isLoading) {
        const btn = document.getElementById("gemini-drive-btn");
        if (!btn) return;
        btn.style.opacity = isLoading ? "0.5" : "1";
    }

    // חלונית הזנת מייל
    function showEmailModal() {

        closeCurrentOverlay();

        const overlay = createOverlay();

        const modal = createModal();

        const title = document.createElement("h2");
        title.innerText = "📧 הזנת מייל מורשה";
        Object.assign(title.style, { margin: "0 0 10px 0", color: "#333" });

        const desc = document.createElement("p");
        desc.innerText = "הכנס את כתובת המייל המאושרת שלך - אליה יישלח קוד אימות בפעם הראשונה:";
        Object.assign(desc.style, { color: "#666", fontSize: "14px", lineHeight: "1.5" });

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "email@gmail.com";
        Object.assign(input.style, {
            width: "90%", padding: "10px", margin: "12px 0", fontSize: "15px",
            borderRadius: "8px", border: "1px solid #ccc", textAlign: "center",
            outline: "none", direction: "ltr"
        });

        const errorDiv = document.createElement("div");
        Object.assign(errorDiv.style, {
            color: "#C53030", fontSize: "13px", fontWeight: "bold",
            minHeight: "16px", marginBottom: "5px", display: "none"
        });

        const btnRow = document.createElement("div");
        Object.assign(btnRow.style, { display: "flex", gap: "10px" });

        const okBtn = document.createElement("button");
        okBtn.innerText = "אישור";
        Object.assign(okBtn.style, buttonStyle("#3182CE"));

        const cancelBtn = document.createElement("button");
        cancelBtn.innerText = "ביטול";
        Object.assign(cancelBtn.style, buttonStyle("#E2E8F0", "#333"));
        cancelBtn.onclick = closeCurrentOverlay;

        okBtn.onclick = function () {
            const cleaned = (input.value || "").trim().toLowerCase();
            if (!isValidEmail(cleaned)) {
                errorDiv.innerText = "הכתובת אינה תקינה.";
                errorDiv.style.display = "block";
                return;
            }
            GM_setValue("userEmail", cleaned);
            GM_setValue("deviceToken", "");
            clearPendingVerification();
            closeCurrentOverlay();
            checkAuthAndContinue(cleaned, function () {
                openOptions();
                uploadAllPending();
            });
        };

        input.onkeydown = function (e) {
            if (e.key === "Enter") { e.preventDefault(); okBtn.click(); }
            if (e.key === "Escape") { e.preventDefault(); cancelBtn.click(); }
        };

        btnRow.appendChild(okBtn);
        btnRow.appendChild(cancelBtn);

        modal.appendChild(title);
        modal.appendChild(desc);
        modal.appendChild(input);
        modal.appendChild(errorDiv);
        modal.appendChild(btnRow);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        input.focus();
    }

    // חלונית קוד אימות - 6 ספרות
    function showVerificationCodeModal(email, onSuccess, errorText) {

        closeCurrentOverlay();

        const overlay = createOverlay();
        const modal = createModal();

        const title = document.createElement("h2");
        title.innerText = "🔑 אימות מכשיר";
        Object.assign(title.style, { margin: "0 0 10px 0", color: "#333" });

        const desc = document.createElement("p");
        desc.innerText = errorText ||
            ("שלחנו קוד אימות בן 6 ספרות ל" + email + ". הכנס אותו כאן:");
        Object.assign(desc.style, { color: "#666", fontSize: "14px" });

        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 6;
        input.inputMode = "numeric";
        input.placeholder = "------";
        Object.assign(input.style, {
            width: "60%", padding: "10px", margin: "12px 0", fontSize: "20px",
            borderRadius: "8px", border: "1px solid #ccc", textAlign: "center",
            outline: "none", direction: "ltr", letterSpacing: "6px"
        });

        const btnRow = document.createElement("div");
        Object.assign(btnRow.style, { display: "flex", gap: "10px" });

        const okBtn = document.createElement("button");
        okBtn.innerText = "אישור";
        Object.assign(okBtn.style, buttonStyle("#3182CE"));

        const cancelBtn = document.createElement("button");
        cancelBtn.innerText = "ביטול";
        Object.assign(cancelBtn.style, buttonStyle("#E2E8F0", "#333"));
        cancelBtn.onclick = closeCurrentOverlay;

        okBtn.onclick = function () {
            const code = (input.value || "").trim();
            if (!/^\d{6}$/.test(code)) {
                input.focus();
                return;
            }
            closeCurrentOverlay();
            submitVerificationCode(email, code, function () {
                openOptions();
                // אחרי אימות מוצלח - מעלים את כל מה שהצטבר
                uploadAllPending();
                if (onSuccess) onSuccess();
            });
        };

        input.onkeydown = function (e) {
            if (e.key === "Enter") { e.preventDefault(); okBtn.click(); }
            if (e.key === "Escape") { e.preventDefault(); cancelBtn.click(); }
        };

        btnRow.appendChild(okBtn);
        btnRow.appendChild(cancelBtn);

        modal.appendChild(title);
        modal.appendChild(desc);
        modal.appendChild(input);
        modal.appendChild(btnRow);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        input.focus();
    }

    // טוסט הודעה עם קישור אופציונלי לדרייב
    function showToast(text, linkUrl) {

        const toast = document.createElement("div");
        Object.assign(toast.style, {
            position: "fixed", bottom: "90px", left: "20px", zIndex: "9999998",
            backgroundColor: "rgba(30, 30, 30, 0.92)", color: "#fff",
            padding: "10px 16px", borderRadius: "12px", fontSize: "13px",
            fontFamily: "Arial, sans-serif", direction: "rtl",
            maxWidth: "320px", boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            whiteSpace: "pre-line"
        });

        if (linkUrl) {
            const link = document.createElement("a");
            link.href = linkUrl;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.innerText = "📂 פתח בדרייב";
            Object.assign(link.style, {
                display: "block", marginTop: "6px", color: "#7FBAFF",
                fontWeight: "bold", textDecoration: "underline"
            });
            toast.innerText = text;
            toast.appendChild(link);
        } else {
            toast.innerText = text;
        }

        document.body.appendChild(toast);
        setTimeout(function () { toast.remove(); }, 6000);
    }

    // ============================================================
    // עזרי UI
    // ============================================================

    let currentOverlay = null;

    function closeCurrentOverlay() {
        if (currentOverlay && currentOverlay.parentNode) {
            currentOverlay.parentNode.removeChild(currentOverlay);
        }
        currentOverlay = null;
    }

    function createOverlay() {
        const overlay = document.createElement("div");
        currentOverlay = overlay;
        Object.assign(overlay.style, {
            position: "fixed", top: "0", left: "0", right: "0", bottom: "0",
            backgroundColor: "rgba(0, 0, 0, 0.7)", zIndex: "9999999",
            display: "flex", justifyContent: "center", alignItems: "center",
            fontFamily: "Arial, sans-serif"
        });
        return overlay;
    }

    function createModal() {
        const modal = document.createElement("div");
        Object.assign(modal.style, {
            backgroundColor: "#fff", padding: "28px", borderRadius: "15px",
            textAlign: "center", maxWidth: "380px", width: "100%",
            boxShadow: "0 5px 20px rgba(0,0,0,0.3)", direction: "rtl"
        });
        return modal;
    }

    function buttonStyle(bg, color) {
        return {
            background: bg, color: color || "white", border: "none",
            padding: "9px 18px", borderRadius: "12px", fontWeight: "bold",
            cursor: "pointer", flex: "1", fontSize: "14px"
        };
    }

    function openOptions() {
        const optionsDiv = document.getElementById("gemini-drive-options");
        if (optionsDiv) {
            updateAutoButton();
            optionsDiv.style.display = "flex";
        }
    }

    // ============================================================
    // אבחון - מה הסריקה באמת רואה בעמוד
    // ============================================================

    function runDiagnostics() {

        const imgs = deepQueryAll(document, "img");
        const lines = [];
        let candidates = 0;

        imgs.forEach(function (img) {

            const src = img.currentSrc || img.src || "";
            if (!src) return;

            const w = img.naturalWidth || 0;
            const h = img.naturalHeight || 0;
            const cw = img.clientWidth || 0;
            const ch = img.clientHeight || 0;
            const loaded = w > 0;
            const broken = img.complete && w === 0;
            const pass = isGeneratedImageCandidate(img);

            if (pass) candidates++;

            // מציגים רק תמונות גדולות או שנפסלו שהן דווקא גדולות במסך -
            // אייקונים זעירים ממילא לא מעניינים
            if (!pass && Math.max(w, cw) < 100 && Math.max(h, ch) < 100) return;

            const srcType =
                src.startsWith("blob:") ? "blob" :
                src.startsWith("data:image") ? "data" :
                /googleusercontent\.com/.test(src) ? "guser" :
                /gstatic\.com/.test(src) ? "gstatic" : "אחר";

            // זיהוי פלייסהולדר: התשובה מכילה תמונת תוצר שנכשלה בטעינה
            let placeholderInfo = "";
            if (pass) {
                const container = responseContainerFor(img);
                if (containerHasBrokenGeneratedImage(container)) {
                    const urls = findGeneratedURLsIn(container);
                    placeholderInfo =
                        "\n     🚩 פלייסהולדר! כתובות מקור בתשובה: " +
                        (urls.length ? urls.join(" , ") : "(לא נמצאו)");
                }
            }

            lines.push(
                (pass ? "✅ תיתפס" : "❌ נפסלה") +
                " | " + srcType +
                " | גודל " + w + "x" + h +
                (loaded ? "" : " (טעינה נכשלה" + (cw ? ", מוצג " + cw + "x" + ch : "") + ")") +
                " | " + src.substring(0, 70) +
                placeholderInfo
            );
        });

        // כתובות תוצר של גמיני ביומן הרשת - אלה שהשרת יכול לשלוף
        let ggURLs = [];
        try {
            performance.getEntriesByType("resource").forEach(function (e) {
                if (/googleusercontent\.com\/(gg|labs-ai)\//.test(e.name || "")) {
                    ggURLs.push(e.name);
                }
            });
        } catch (e) {}

        const summary =
            "סה\"כ תמונות בעמוד: " + imgs.length +
            "\nמועמדות להעלאה: " + candidates +
            "\nכתובות תוצר ביומן הרשת: " + ggURLs.length +
            (ggURLs.length ? "\n" + ggURLs.join("\n") : "");

        showDiagModal(summary, lines);
    }

    function showDiagModal(summary, lines) {

        closeCurrentOverlay();

        const overlay = createOverlay();
        const modal = createModal();
        modal.style.maxWidth = "520px";
        modal.style.textAlign = "right";

        const title = document.createElement("h2");
        title.innerText = "🔍 אבחון סריקת תמונות";
        Object.assign(title.style, { margin: "0 0 10px 0", color: "#333" });

        const sum = document.createElement("p");
        sum.innerText = summary;
        Object.assign(sum.style, { color: "#333", fontSize: "14px", fontWeight: "bold" });

        const pre = document.createElement("pre");
        pre.innerText = lines.length ? lines.join("\n") : "(אין תמונות גדולות בעמוד)";
        Object.assign(pre.style, {
            maxHeight: "260px", overflow: "auto", fontSize: "11px",
            background: "#F7FAFC", padding: "10px", borderRadius: "8px",
            whiteSpace: "pre-wrap", wordBreak: "break-all", direction: "ltr",
            textAlign: "left"
        });

        const copyBtn = document.createElement("button");
        copyBtn.innerText = "📋 העתק לשיתוף עם התמיכה";
        Object.assign(copyBtn.style, buttonStyle("#3182CE"));
        copyBtn.onclick = function () {
            const text = summary + "\n" + lines.join("\n");
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text);
                copyBtn.innerText = "✅ הועתק";
            }
        };

        const closeBtn = document.createElement("button");
        closeBtn.innerText = "סגור";
        Object.assign(closeBtn.style, buttonStyle("#E2E8F0", "#333"));
        closeBtn.onclick = closeCurrentOverlay;

        const row = document.createElement("div");
        Object.assign(row.style, { display: "flex", gap: "10px", marginTop: "12px" });
        row.appendChild(copyBtn);
        row.appendChild(closeBtn);

        modal.appendChild(title);
        modal.appendChild(sum);
        modal.appendChild(pre);
        modal.appendChild(row);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    // ============================================================
    // הפעלה
    // ============================================================

    createFloatingMenu();

    // סריקה מחזורית: גם מאתרת תמונות חדשות וגם מחזירה את הכפתור
    // אם העמוד הוחלף (SPA)
    setInterval(function () {

        createFloatingMenu();

        // התחברות שקטה: אם יש מייל וטוקן אבל עדיין לא אימתנו בסשן
        if (!authed && getEmail() && getDeviceToken() &&
            !getPendingVerification() &&
            (Date.now() - lastAuthAttempt >= AUTH_RETRY_COOLDOWN_MS)) {
            checkAuthAndContinue(getEmail(), function () {
                if (autoMode) uploadAllPending();
            });
        }

        scanForImages().then(function () {
            // אחרי סריקה: אם מאומתים ומצב אוטומטי - להעלות מהתור
            if (authed && autoMode && uploadInFlight === 0) {
                uploadAllPending();
            }
            updateStatusLabel();
        });

    }, SCAN_INTERVAL_MS);

})();
