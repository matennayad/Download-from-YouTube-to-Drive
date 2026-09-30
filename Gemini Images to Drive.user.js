// ==UserScript==
// @name         תמונות גמיני לדרייב - מטען נייד
// @namespace    http://tampermonkey.net/
// @version      1.0
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

    // key -> { prompt, image (dataURL) או image_url, ts }
    const pending = new Map();

    const uploadingKeys = new Set();
    const uploadedKeys = new Set();

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
    // זיהוי תמונות שנוצרו על ידי גמיני
    // ============================================================
    // ההיגיון: תמונה שגמיני יצר היא <img> גדול (מעל MIN_IMAGE_SIZE)
    // שמוצגת בתוך בלוק התשובה של המודל (model-response), עם מקור
    // blob:, data: או googleusercontent. תמונות שהמשתמש עצמו העלה
    // מוצגות בתוך הודעת המשתמש (user-query) ולכן מסוננות החוצה.
    // תמונות תוצר עשויות להיות עטופות בכפתור (פתיחה במסך מלא) -
    // זה לא פוסל אותן. אייקונים ואווטארים מסוננים לפי גודל.

    function isGeneratedImageCandidate(img) {

        if (!img || img.tagName !== "IMG") return false;

        const w = img.naturalWidth || 0;
        const h = img.naturalHeight || 0;
        if (w < MIN_IMAGE_SIZE || h < MIN_IMAGE_SIZE) return false;

        const src = img.currentSrc || img.src || "";
        if (!src) return false;

        const srcType =
            src.startsWith("blob:") ? "blob" :
            src.startsWith("data:image") ? "data" :
            /googleusercontent\.com/.test(src) ? "guser" : "";

        if (!srcType) return false;

        // תמונות שהמשתמש העלה בעצמו מוצגות בהודעת המשתמש - לא תוצרי גמיני
        if (img.closest("user-query, [class*='user-query']")) return false;

        // תוצרי גמיני מוצגים בתוך בלוק התשובה של המודל
        if (img.closest("model-response, [class*='model-response']")) {
            return true;
        }

        // מחוץ לתשובת המודל נחשבים רק blob/data - כתובות googleusercontent
        // מחוץ לתשובה הן בדרך כלל לוגואים ואיורי פתיחה, לא תוצרים
        return srcType === "blob" || srcType === "data";
    }

    // ניסיון לשלוף את טקסט ההנחיה שהובילה לתמונה: הודעת המשתמש
    // שמופיעה בעמוד לפני התשובה שמכילה את התמונה
    function findPromptFor(img) {

        const container =
            img.closest("model-response") ||
            img.closest('[class*="model-response"]') ||
            img.closest('[class*="conversation-container"]') ||
            img;

        const queries = document.querySelectorAll(
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

        const text = (best.innerText || "").trim().replace(/\s+/g, " ");

        return text.substring(0, 200);
    }

    // מוריד את התמונה מהדפדפן ל-dataURL. אם ההורדה נכשלת מחזיר null
    // ואז נשתמש בכתובת הפומבית כגיבוי (השרת ישלוף אותה).
    function fetchAsDataURL(src) {
        return new Promise(function (resolve) {
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
                    .catch(function () { resolve(null); });
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

    // בונה רשומת העלאה מאלמנט תמונה. מחזיר Promise שמתפוגג לרשומה או null.
    async function buildEntry(img) {

        const src = img.currentSrc || img.src || "";
        if (!src) return null;

        const prompt = findPromptFor(img);

        // מפתח לפי המקור כבר עכשיו - כדי לא לתפוס את אותה תמונה
        // שוב בזמן שההורדה ל-dataURL מתבצעת
        const srcKey = keyForSrc(src);

        if (src.startsWith("data:image")) {
            return {
                key: keyForDataURL(src),
                srcKey: srcKey,
                image: src,
                image_url: "",
                prompt: prompt
            };
        }

        const dataURL = await fetchAsDataURL(src);

        if (dataURL) {
            return {
                key: keyForDataURL(dataURL),
                srcKey: srcKey,
                image: dataURL,
                image_url: "",
                prompt: prompt
            };
        }

        // גיבוי: השרת ישלוף את התמונה מהכתובת הפומבית
        const httpSrc = src.startsWith("https://") ? src : "";

        if (!httpSrc) return null;

        return {
            key: srcKey,
            srcKey: srcKey,
            image: "",
            image_url: httpSrc,
            prompt: prompt
        };
    }

    // ============================================================
    // סריקה והעלאה
    // ============================================================

    async function scanForImages() {

        const imgs = document.querySelectorAll("img");

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
        }
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
            scanForImages().then(uploadAllPending);
        };

        optionsDiv.appendChild(autoBtn);
        optionsDiv.appendChild(manualBtn);

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
