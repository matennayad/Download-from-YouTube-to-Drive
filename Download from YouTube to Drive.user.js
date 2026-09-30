// ==UserScript==
// @name        הורדה לדרייב-יוטיוב מאת מטען נייד
// @namespace   http://tampermonkey.net/
// @version     5.0
// @description כפתור הורדה ישירה לדרייב - סרטון בודד או ערוץ שלם, עם אימות מכשיר וחוויית משתמש משופרת
// @match       *://*.youtube.com/*
// @homepageURL https://github.com/matennayad/Download-from-YouTube-to-Drive
// @downloadURL https://raw.githubusercontent.com/matennayad/Download-from-YouTube-to-Drive/main/Download%20from%20YouTube%20to%20Drive.user.js
// @updateURL   https://raw.githubusercontent.com/matennayad/Download-from-YouTube-to-Drive/main/Download%20from%20YouTube%20to%20Drive.user.js
// @grant       GM_xmlhttpRequest
// @grant       GM_setValue
// @grant       GM_getValue
// ==/UserScript==

(function () {
    'use strict';

    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwT34zd8XK8pmEnALIacYVLq0N6_3QDE9F_qCNFD4c5yhTgPi32Yj1FWA6FpiJSLqXH/exec";

    // כמה סרטונים יורדים לכל היותר בבקשת ערוץ אחת.
    // חייב להתאים ל-MAX_VIDEOS_PER_CHANNEL_REQUEST בשרת (channels.gs).
    // בגרסה 4.1 היה כאן 20 והשרת הריץ 30: התצוגה המקדימה הבטיחה 30
    // ובפועל ירדו רק 20. מעכשיו שני הצדדים על 30.
    const MAX_VIDEOS_PER_CHANNEL_REQUEST = 30;

    // כל כמה זמן בודקים התקדמות של עבודת ערוץ
    const JOB_POLL_INTERVAL_MS = 15000;

    // timeout לבקשות "זולות" (אימות, תצוגה מקדימה, סטטוס עבודה).
    // להורדת סרטון בודד אין timeout: ההורדה עצמה עלולה להמשיך לרוץ
    // בשרת גם אחרי שהתשובה מתאחרת, וניתוק מוקדם מדי היה גורם
    // למשתמש לבקש שוב ולבזבז מכסה.
    const CHEAP_REQUEST_TIMEOUT_MS = 60000;

    // הגבלת גודל הלוג המקומי לכל ערוץ. מעבר לכך - הישנים ביותר נזרקים,
    // כדי שערוץ ענק לא ינפח את האחסון של הדפדפן.
    const MAX_IDS_PER_CHANNEL_LOG = 3000;

    // כמה זמן להמתין לפני שמחזירים את הכפתור אחרי יציאה ממסך מלא
    const FULLSCREEN_RETURN_DELAY_MS = 350;

    // ============================================================
    // הסתרה במסך מלא
    // ============================================================
    // במסך מלא הכפתור הציף על הסרטון. עכשיו: מקשיבים ל-fullscreenchange,
    // מסתירים מיד בכניסה ומחזירים עם השהיה קטנה ביציאה.

    function getFullscreenElement() {
        return document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement ||
            null;
    }

    function handleFullscreenChange() {
        const container = document.getElementById('drive-download-container');
        if (!container) return;

        if (getFullscreenElement()) {
            container.style.display = 'none';
        } else {
            setTimeout(function () {
                const current = document.getElementById('drive-download-container');
                if (!current) return;
                if (getFullscreenElement()) return; // חזרו למסך מלא בינתיים
                current.style.display = 'flex';
            }, FULLSCREEN_RETURN_DELAY_MS);
        }
    }

    // בזמן שהכפתור מוסתר, ה-setInterval ממשיך לקרוא ל-createFloatingMenu
    // ומחזיר אותו למסך. הפונקציה הזאת מחזירה את ההסתרה אחרי כל יצירה.
    function ensureFullscreenVisibility() {
        const container = document.getElementById('drive-download-container');
        if (container && getFullscreenElement()) {
            container.style.display = 'none';
        }
    }

    // ============================================================
    // תצוגת שגיאות
    // ============================================================

    // תצוגת שגיאה שהגיעה מהשרת.
    //
    // בעבר כל שגיאה שלא הופיעה ברשימה קצרה של מחרוזות מוכרות הוחלפה
    // בהודעה "יוטיוב חסם אותנו, נסו בעוד 20 דקות". זה הסתיר את הסיבה
    // האמיתית והציג למשתמש מידע שגוי - למשל כשהתקלה הייתה בהגדרות
    // ולא ביוטיוב בכלל. עכשיו מוצג מה שהשרת באמת אמר.
    //
    // הודעות מהשרת שלנו כתובות בעברית ומיועדות למשתמש, אז הן מוצגות
    // כמו שהן. שגיאה טכנית באנגלית (yt-dlp, חריגה בקוד) מקבלת הסבר
    // בעברית, והטקסט המקורי מופיע מתחתיו כדי שאפשר יהיה לדווח עליו.
    function showServerError(errText, fallbackTitle) {

        const text = (errText || '').toString().trim();

        if (!text) {
            showModal('❌', fallbackTitle || 'שגיאה',
                'השרת לא החזיר סיבה.\n\n' +
                'כדאי לבדוק בגיליון "לוג שגיאות ובקשות" מה נרשם שם.');
            return;
        }

        // עברית = הודעה שנכתבה עבור המשתמש
        if (/[\u0590-\u05FF]/.test(text)) {
            showModal('❌', fallbackTitle || 'שגיאה', text);
            return;
        }

        showModal('❌', 'ההורדה נכשלה',
            'ההורדה נכשלה מסיבה טכנית.\n' +
            'לרוב זה זמני - כדאי לנסות שוב בעוד כמה דקות.\n\n' +
            'פירוט:\n' + text.substring(0, 300));
    }

    // כשאין תשובה מהשרת בכלל - תקלת רשת, timeout או פריסה שלא עודכנה
    function showConnectionError() {
        showModal('❌', 'אין תשובה מהשרת',
            'לא הצלחנו לקבל תשובה מהשרת.\n\n' +
            'אם זה חוזר: לוודא שה-Web App פרוס בגרסה העדכנית, ' +
            'ושיש חיבור לאינטרנט.');
    }

    // חלונית "תשובה לא תקינה מהשרת" - אותו טקסט בכל המסלולים
    function showBadJsonError(response) {
        showModal('❌', 'תשובה לא תקינה מהשרת',
            'השרת החזיר משהו שאינו JSON.\n\n' +
            'לרוב זה אומר שה-Web App לא פרוס בגרסה העדכנית.\n\n' +
            'תחילת התשובה:\n' +
            ((response && response.responseText) || '').substring(0, 200));
    }

    let isRequestInFlight = false;

    let activePollTimer = null;

    // ============================================================
    // זיהוי עמוד ערוץ / פלייליסט
    // ============================================================

    // מחזיר כתובת ערוץ נקייה, או null אם אנחנו לא בעמוד ערוץ
    function getChannelUrlFromPage() {

        const path = window.location.pathname;

        const search = window.location.search;

        // פלייליסט
        if (path === '/playlist' && /[?&]list=/.test(search)) {
            const listId = new URLSearchParams(search).get('list');
            if (listId) {
                return 'https://www.youtube.com/playlist?list=' + listId;
            }
        }

        // ערוץ: /@handle  /channel/UC..  /c/name  /user/name
        const match = path.match(
            /^\/(@[\w\-.]+|channel\/[\w\-]+|c\/[\w\-.]+|user\/[\w\-.]+)/
        );

        if (match) {
            return 'https://www.youtube.com/' + match[1];
        }

        return null;
    }

    function isChannelPage() {
        return !!getChannelUrlFromPage();
    }

    // ============================================================
    // הלוג המקומי: אילו סרטונים כבר ירדו מהערוץ הזה
    // ============================================================
    // נשמר בדפדפן של המשתמש (GM_setValue) ונשלח לשרת בבקשה הבאה,
    // כדי שלא יורידו פעמיים את אותו סרטון.

    function channelLogKey(channelUrl, format) {

        const clean = (channelUrl || '')
            .toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .replace(/\/$/, '');

        return 'chlog::' + clean + '::' + format;
    }

    function getChannelLog(channelUrl, format) {

        try {
            const raw = GM_getValue(
                channelLogKey(channelUrl, format),
                '[]'
            );
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    function addToChannelLog(channelUrl, format, ids) {

        if (!ids || !ids.length) return;

        const existing = getChannelLog(channelUrl, format);
        const merged = {};

        existing.concat(ids).forEach(function (id) {
            if (id) merged[id] = true;
        });

        // הגבלת גודל: אם נצברו יותר מדי מזהים - הישנים ביותר נזרקים
        let keys = Object.keys(merged);

        if (keys.length > MAX_IDS_PER_CHANNEL_LOG) {
            keys = keys.slice(keys.length - MAX_IDS_PER_CHANNEL_LOG);
        }

        GM_setValue(
            channelLogKey(channelUrl, format),
            JSON.stringify(keys)
        );
    }

    // מאפשר למשתמש לאפס את הזיכרון ולהוריד את הערוץ מההתחלה
    function clearChannelLog(channelUrl, format) {
        GM_setValue(channelLogKey(channelUrl, format), '[]');
    }

    // ולידציה בסיסית למייל - לא שולחים לשרת מה שברור שרע
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((email || '').trim());
    }

    // ============================================================
    // זיכרון אימות ממתין
    // ============================================================
    // כשהשרת שולח קוד אימות למייל, שומרים כאן את הכתובת. אם המשתמש
    // רענן את העמוד (או עבר למייל וחזר דרך רענון) והחלונית נעלמה -
    // היא נפתחת מחדש מיד בטעינה, בלי בקשה חוזרת שתשלח מייל נוסף
    // ותפגע בקוד שכבר נשלח. הזיכרון פג תוקף אחרי רבע שעה.

    const PENDING_VERIFICATION_KEY = "pendingVerification";

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
    // התפריט הצף
    // ============================================================

    function createFloatingMenu() {
        if (document.getElementById('drive-download-container')) return;

        const container = document.createElement('div');
        container.id = 'drive-download-container';
        Object.assign(container.style, {
            position: 'fixed', bottom: '20px', left: '20px',
            zIndex: '999999', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '10px'
        });

        // אם נכנסנו למסך מלא לפני שהכפתור נוצר - הוא נולד מוסתר
        if (getFullscreenElement()) {
            container.style.display = 'none';
        }

        const optionsDiv = document.createElement('div');
        optionsDiv.id = 'drive-download-options';
        Object.assign(optionsDiv.style, {
            display: 'none', flexDirection: 'row', gap: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '10px',
            borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
        });

        const videoBtn = document.createElement('img');
        videoBtn.src = 'https://i.postimg.cc/gc19BRzZ/Gemini-Generated-Image-wcg6lawcg6lawcg6.jpg';
        Object.assign(videoBtn.style, getImgStyle('70px'));
        videoBtn.onclick = () => startDownloadFlow('video', optionsDiv);
        addHoverEffect(videoBtn);

        const audioBtn = document.createElement('img');
        audioBtn.src = 'https://i.postimg.cc/kMLrh8J6/Gemini-Generated-Image-1a7koh1a7koh1a7k.jpg';
        Object.assign(audioBtn.style, getImgStyle('70px'));
        audioBtn.onclick = () => startDownloadFlow('audio', optionsDiv);
        addHoverEffect(audioBtn);

        optionsDiv.appendChild(videoBtn);
        optionsDiv.appendChild(audioBtn);

        const mainBtn = document.createElement('img');
        mainBtn.id = 'drive-download-btn';
        mainBtn.src = 'https://i.postimg.cc/2jgpXvkB/Gemini-Generated-Image-uwb0qfuwb0qfuwb0.jpg';
        Object.assign(mainBtn.style, getImgStyle('90px'));

        mainBtn.onclick = () => {
            if (isRequestInFlight) return; // מתעלמים מלחיצות בזמן טעינה

            let email = GM_getValue("userEmail", "");

            if (!email) {
                showInputModal("📧 הזנת מייל מורשה", "הכנס את כתובת המייל שלך לשימוש בתוסף:", (inputEmail) => {
                    const cleaned = (inputEmail || '').trim().toLowerCase();

                    if (cleaned) {
                        GM_setValue("userEmail", cleaned);
                        GM_setValue("deviceToken", ""); // מייל חדש = אימות מכשיר מאפס
                        clearPendingVerification();
                        checkAuthAndShowOptions(cleaned, optionsDiv);
                    }
                }, {
                    validate: function (v) {
                        const cleaned = (v || '').trim().toLowerCase();
                        if (!cleaned) return 'נא להזין כתובת מייל.';
                        if (!isValidEmail(cleaned)) return 'הכתובת אינה תקינה - ודאו @ וסיומת דומיין.';
                        return null;
                    }
                });
                return;
            }

            // אם האופציות כבר גלויות - רק סוגרים אותן, בלי לבדוק סטטוס שוב
            if (optionsDiv.style.display === 'flex') {
                optionsDiv.style.display = 'none';
                return;
            }

            // אימות מכשיר ממתין למייל הזה? פותחים את חלונית הקוד ישירות,
            // בלי בקשה חוזרת שתשלח מייל נוסף ותפגע בקוד הקודם
            if (getPendingVerification() === email) {
                showVerificationCodeModal(email, optionsDiv);
                return;
            }

            checkAuthAndShowOptions(email, optionsDiv);
        };
        addHoverEffect(mainBtn);

        container.appendChild(optionsDiv);
        container.appendChild(mainBtn);
        document.body.appendChild(container);

        ensureFullscreenVisibility();
    }

    function getImgStyle(height) {
        return {
            height: height,
            cursor: 'pointer',
            borderRadius: '25px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s',
            objectFit: 'cover'
        };
    }

    function addHoverEffect(imgElement) {
        imgElement.onmouseenter = () => imgElement.style.transform = 'scale(1.05)';
        imgElement.onmouseleave = () => imgElement.style.transform = 'scale(1)';
    }

    // ============================================================
    // חלוניות
    // ============================================================

    let currentOverlay = null;

    function closeCurrentOverlay() {
        if (currentOverlay && currentOverlay.parentNode) {
            currentOverlay.parentNode.removeChild(currentOverlay);
        }
        currentOverlay = null;
    }

    // חלונית הודעה, עם תמיכה אופציונלית בקישור לחיץ (לדרייב)
    function showModal(emoji, headingText, descriptionText, linkUrl) {
        closeCurrentOverlay();

        const overlay = document.createElement('div');
        currentOverlay = overlay;
        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: '9999999',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            fontFamily: 'Arial, sans-serif'
        });

        const modal = document.createElement('div');
        Object.assign(modal.style, {
            backgroundColor: '#fff', padding: '30px', borderRadius: '15px',
            textAlign: 'center', maxWidth: '400px', boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
            direction: 'rtl'
        });

        const icon = document.createElement('div');
        icon.innerText = emoji;
        icon.style.fontSize = '40px';
        icon.style.marginBottom = '10px';

        const title = document.createElement('h2');
        title.innerText = headingText;
        title.style.margin = '0 0 10px 0';
        title.style.color = '#333';

        const desc = document.createElement('p');
        desc.innerText = descriptionText;
        desc.style.color = '#666';
        desc.style.lineHeight = '1.5';
        desc.style.fontSize = '15px';
        desc.style.whiteSpace = 'pre-line';

        modal.appendChild(icon);
        modal.appendChild(title);
        modal.appendChild(desc);

        // קישור לחיץ לדרייב, אם סופק
        if (linkUrl) {
            const linkBtn = document.createElement('a');
            linkBtn.href = linkUrl;
            linkBtn.target = '_blank';
            linkBtn.rel = 'noopener noreferrer';
            linkBtn.innerText = '📂 פתח את הקובץ בדרייב';
            Object.assign(linkBtn.style, {
                display: 'block', background: '#34A853', color: 'white', textDecoration: 'none',
                padding: '12px 20px', borderRadius: '20px', fontWeight: 'bold', fontSize: '15px',
                margin: '15px 0'
            });
            modal.appendChild(linkBtn);
        }

        const devBox = document.createElement('div');
        Object.assign(devBox.style, { margin: '20px 0', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' });

        const devText1 = document.createElement('div');
        devText1.innerText = 'פותח על ידי מטען נייד ממתמחים טופ';
        Object.assign(devText1.style, { color: '#444', fontWeight: 'bold', marginBottom: '8px', fontSize: '15px' });

        const devText2 = document.createElement('div');
        devText2.innerText = 'לפרופיל שלי לחצו ';
        Object.assign(devText2.style, { color: '#555', fontSize: '14px' });

        const devLink = document.createElement('a');
        devLink.href = 'https://mitmachim.top/user/%D7%9E%D7%98%D7%A2%D7%9F-%D7%A0%D7%99%D7%99%D7%93';
        devLink.target = '_blank';
        devLink.innerText = 'כאן';
        Object.assign(devLink.style, { color: '#3182CE', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' });

        const fingerIcon = document.createElement('span');
        fingerIcon.innerText = ' 👉';

        devText2.appendChild(devLink);
        devText2.appendChild(fingerIcon);

        devBox.appendChild(devText1);
        devBox.appendChild(devText2);

        const closeBtn = document.createElement('button');
        closeBtn.innerText = 'סגור';
        Object.assign(closeBtn.style, {
            background: '#3182CE', color: 'white', border: 'none', padding: '10px 20px',
            borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', width: '100%',
            fontSize: '16px', marginTop: '10px'
        });

        closeBtn.onclick = closeCurrentOverlay;

        modal.appendChild(devBox);
        modal.appendChild(closeBtn);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    // חלונית קלט. inputProps (אופציונלי) מאפשר לכוון את השדה:
    // למשל maxlength לקוד אימות או inputmode מספרי.
    function showInputModal(headingText, descriptionText, onSubmitCallback, inputProps) {
        closeCurrentOverlay();

        const overlay = document.createElement('div');
        currentOverlay = overlay;
        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: '9999999',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            fontFamily: 'Arial, sans-serif'
        });

        const modal = document.createElement('div');
        Object.assign(modal.style, {
            backgroundColor: '#fff', padding: '30px', borderRadius: '15px',
            textAlign: 'center', maxWidth: '400px', width: '100%', boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
            direction: 'rtl'
        });

        const title = document.createElement('h2');
        title.innerText = headingText;
        title.style.margin = '0 0 10px 0';
        title.style.color = '#333';

        const desc = document.createElement('p');
        desc.innerText = descriptionText;
        desc.style.color = '#666';
        desc.style.lineHeight = '1.5';
        desc.style.fontSize = '15px';
        desc.style.whiteSpace = 'pre-line';

        const input = document.createElement('input');
        input.type = 'text';
        Object.assign(input.style, {
            width: '90%', padding: '10px', margin: '15px 0', fontSize: '16px',
            borderRadius: '8px', border: '1px solid #ccc', textAlign: 'center', outline: 'none'
        });

        // שדרוג: בדיקת תקינות בתוך החלונית - קלט שגוי מציג הודעה במקום,
        // במקום לסגור את החלונית בשקט כאילו לא קרה כלום
        const errorDiv = document.createElement('div');
        Object.assign(errorDiv.style, {
            color: '#C53030', fontSize: '14px', fontWeight: 'bold',
            minHeight: '18px', marginBottom: '5px', display: 'none'
        });

        if (inputProps) {
            if (inputProps.maxLength) input.maxLength = inputProps.maxLength;
            if (inputProps.inputMode) input.inputMode = inputProps.inputMode;
            if (inputProps.placeholder) input.placeholder = inputProps.placeholder;
        }

        const btnContainer = document.createElement('div');
        Object.assign(btnContainer.style, { display: 'flex', gap: '10px', marginTop: '10px' });

        const submitBtn = document.createElement('button');
        submitBtn.innerText = 'אישור';
        Object.assign(submitBtn.style, {
            background: '#3182CE', color: 'white', border: 'none', padding: '10px 20px',
            borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', flex: '1', fontSize: '16px'
        });

        const cancelBtn = document.createElement('button');
        cancelBtn.innerText = 'ביטול';
        Object.assign(cancelBtn.style, {
            background: '#E2E8F0', color: '#333', border: 'none', padding: '10px 20px',
            borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', flex: '1', fontSize: '16px'
        });

        submitBtn.onclick = () => {
            const val = input.value;

            if (inputProps && typeof inputProps.validate === 'function') {
                const error = inputProps.validate(val);
                if (error) {
                    errorDiv.innerText = error;
                    errorDiv.style.display = 'block';
                    input.focus();
                    return;
                }
            }

            closeCurrentOverlay();
            if (onSubmitCallback) onSubmitCallback(val);
        };

        cancelBtn.onclick = closeCurrentOverlay;

        // שדרוג: Enter מגיש, Escape מבטל - בלי לגעת בעכבר
        input.onkeydown = function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitBtn.click();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelBtn.click();
            }
        };

        btnContainer.appendChild(submitBtn);
        btnContainer.appendChild(cancelBtn);

        modal.appendChild(title);
        modal.appendChild(desc);
        modal.appendChild(input);
        modal.appendChild(errorDiv);
        modal.appendChild(btnContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        input.focus();
    }

    // חלונית התקדמות (מתעדכנת במקום להיפתח מחדש)
    function showProgressModal(headingText, descriptionText, percent) {

        const existingHeading = document.getElementById('drive-progress-heading');

        if (existingHeading && currentOverlay && currentOverlay.parentNode) {

            existingHeading.innerText = headingText;

            const desc = document.getElementById('drive-progress-desc');
            if (desc) desc.innerText = descriptionText;

            const bar = document.getElementById('drive-progress-bar');
            if (bar) bar.style.width = (percent || 0) + '%';

            return;
        }

        closeCurrentOverlay();

        const overlay = document.createElement('div');
        currentOverlay = overlay;
        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: '9999999',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            fontFamily: 'Arial, sans-serif'
        });

        const modal = document.createElement('div');
        Object.assign(modal.style, {
            backgroundColor: '#fff', padding: '30px', borderRadius: '15px',
            textAlign: 'center', maxWidth: '400px', minWidth: '320px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.3)', direction: 'rtl'
        });

        const emojiEl = document.createElement('div');
        emojiEl.innerText = '⬇️';
        emojiEl.style.fontSize = '40px';

        const heading = document.createElement('h2');
        heading.id = 'drive-progress-heading';
        heading.innerText = headingText;
        heading.style.margin = '10px 0';

        const desc = document.createElement('p');
        desc.id = 'drive-progress-desc';
        desc.innerText = descriptionText;
        desc.style.whiteSpace = 'pre-line';
        desc.style.color = '#444';

        const barOuter = document.createElement('div');
        Object.assign(barOuter.style, {
            width: '100%', height: '10px', backgroundColor: '#eee',
            borderRadius: '5px', overflow: 'hidden', margin: '15px 0'
        });

        const bar = document.createElement('div');
        bar.id = 'drive-progress-bar';
        Object.assign(bar.style, {
            width: (percent || 0) + '%', height: '100%',
            backgroundColor: '#4caf50', transition: 'width 0.4s'
        });

        barOuter.appendChild(bar);

        const hideBtn = document.createElement('button');
        hideBtn.innerText = 'סגור חלונית (ההורדה תמשיך)';
        Object.assign(hideBtn.style, {
            padding: '8px 16px', border: 'none', borderRadius: '8px',
            backgroundColor: '#eee', cursor: 'pointer', fontSize: '14px'
        });
        hideBtn.onclick = closeCurrentOverlay;

        modal.appendChild(emojiEl);
        modal.appendChild(heading);
        modal.appendChild(desc);
        modal.appendChild(barOuter);
        modal.appendChild(hideBtn);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    // חלונית אישור (כן / ביטול)
    function showConfirmModal(emoji, headingText, descriptionText, confirmLabel, onConfirm) {

        closeCurrentOverlay();

        const overlay = document.createElement('div');
        currentOverlay = overlay;
        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: '9999999',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            fontFamily: 'Arial, sans-serif'
        });

        const modal = document.createElement('div');
        Object.assign(modal.style, {
            backgroundColor: '#fff', padding: '30px', borderRadius: '15px',
            textAlign: 'center', maxWidth: '420px', boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
            direction: 'rtl'
        });

        const emojiEl = document.createElement('div');
        emojiEl.innerText = emoji;
        emojiEl.style.fontSize = '40px';

        const heading = document.createElement('h2');
        heading.innerText = headingText;
        heading.style.margin = '10px 0';

        const desc = document.createElement('p');
        desc.innerText = descriptionText;
        desc.style.whiteSpace = 'pre-line';
        desc.style.color = '#444';

        const btnContainer = document.createElement('div');
        Object.assign(btnContainer.style, {
            display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px'
        });

        const okBtn = document.createElement('button');
        okBtn.innerText = confirmLabel || 'אישור';
        Object.assign(okBtn.style, {
            padding: '10px 20px', border: 'none', borderRadius: '8px',
            backgroundColor: '#4caf50', color: '#fff', cursor: 'pointer', fontSize: '15px'
        });
        okBtn.onclick = function () {
            closeCurrentOverlay();
            if (onConfirm) onConfirm();
        };

        const cancelBtn = document.createElement('button');
        cancelBtn.innerText = 'ביטול';
        Object.assign(cancelBtn.style, {
            padding: '10px 20px', border: 'none', borderRadius: '8px',
            backgroundColor: '#eee', cursor: 'pointer', fontSize: '15px'
        });
        cancelBtn.onclick = closeCurrentOverlay;

        btnContainer.appendChild(okBtn);
        btnContainer.appendChild(cancelBtn);

        modal.appendChild(emojiEl);
        modal.appendChild(heading);
        modal.appendChild(desc);
        modal.appendChild(btnContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    // ============================================================
    // שכבת התקשורת מול השרת
    // ============================================================
    // requestJson שולח POST, מפענח JSON, ומפנה ל-handlers:
    //   onload(res, response) - תשובה תקינה שפוענחה
    //   onerror(err)          - שגיאת רשת / timeout
    //   onBadJson(response)   - השרת החזיר משהו שאינו JSON
    // options.timeoutMs - קובע timeout. בלי זה - בלי timeout
    // (הורדת סרטון בודד לא מקבלת timeout, ראו הסבר למעלה).

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
                console.error("שגיאת תקשורת מוחלטת בבקשה לשרת:", err);
                if (handlers.onerror) handlers.onerror(err);
            },
            ontimeout: function () {
                console.error("timeout בבקשה לשרת");
                if (handlers.onerror) handlers.onerror({ type: "timeout" });
            }
        });
    }

    // ============================================================
    // אימות מכשיר
    // ============================================================

    // בודק מול השרת האם המכשיר הזה מאומת למייל הזה, לפני שמציגים וידאו/אודיו בכלל
    function checkAuthAndShowOptions(email, optionsDiv) {
        setLoadingState(true);

        requestJson(
            {
                action: "checkStatus",
                email: email,
                deviceToken: GM_getValue("deviceToken", "")
            },
            {
                onload: function (res) {
                    setLoadingState(false);

                    if (res.deviceToken) {
                        GM_setValue("deviceToken", res.deviceToken);
                    }

                    if (res.success && res.authenticated) {
                        clearPendingVerification();
                        optionsDiv.style.display = 'flex';
                        return;
                    }

                    if (res.needsVerification) {
                        // השרת שלח קוד למייל - שומרים את המצב כדי שאחרי רענון
                        // החלונית תיפתח שוב בלי לשלוח קוד חדש
                        setPendingVerification(email);
                        showVerificationCodeModal(email, optionsDiv);
                        return;
                    }

                    showServerError(res.error);
                },
                onerror: function () {
                    setLoadingState(false);
                    showConnectionError();
                },
                onBadJson: function (response) {
                    setLoadingState(false);
                    showBadJsonError(response);
                }
            },
            { timeoutMs: CHEAP_REQUEST_TIMEOUT_MS }
        );
    }

    // חלונית הזנת קוד האימות - מקום אחד לכל המסלולים (אימות ראשוני,
    // קוד שגוי, ערוץ, והמשך אחרי רענון עמוד)
    function showVerificationCodeModal(email, optionsDiv, errorText) {
        showInputModal(
            "🔑 אימות מכשיר חדש",
            errorText || "שלחנו קוד אימות בן 6 ספרות למייל שלך. הכנס אותו כאן:",
            function (codeInput) {
                const code = (codeInput || '').trim();
                if (/^\d{6}$/.test(code)) {
                    submitVerificationCode(email, code,
                        optionsDiv || document.getElementById('drive-download-options'));
                }
            },
            {
                maxLength: 6,
                inputMode: 'numeric',
                placeholder: '------',
                validate: function (v) {
                    return /^\d{6}$/.test((v || '').trim())
                        ? null
                        : 'נא להזין בדיוק 6 ספרות.';
                }
            }
        );
    }

    // שולח קוד אימות שהוזן, ואם תקין - מקבל טוקן מכשיר ומציג את כפתורי הפורמט
    function submitVerificationCode(email, code, optionsDiv) {
        setLoadingState(true);

        requestJson(
            {
                action: "checkStatus",
                email: email,
                deviceToken: GM_getValue("deviceToken", ""),
                verificationCode: code
            },
            {
                onload: function (res) {
                    setLoadingState(false);

                    if (res.deviceToken) {
                        GM_setValue("deviceToken", res.deviceToken);
                    }

                    if (res.success && res.authenticated) {
                        clearPendingVerification();
                        if (optionsDiv) optionsDiv.style.display = 'flex';
                        return;
                    }

                    if (res.needsVerification) {
                        // קוד שגוי - שואלים שוב, הפעם עם הודעה שמציינת שהקוד שגוי
                        showVerificationCodeModal(email, optionsDiv,
                            res.error || "קוד שגוי, נסה שוב:");
                        return;
                    }

                    showServerError(res.error);
                },
                onerror: function () {
                    setLoadingState(false);
                    showConnectionError();
                },
                onBadJson: function (response) {
                    setLoadingState(false);
                    showBadJsonError(response);
                }
            },
            { timeoutMs: CHEAP_REQUEST_TIMEOUT_MS }
        );
    }

    // מצב טעינה: נועל את הכפתורים חזותית ומונע לחיצות כפולות
    function setLoadingState(isLoading) {
        isRequestInFlight = isLoading;
        const btn = document.getElementById('drive-download-btn');
        if (!btn) return;

        if (isLoading) {
            btn.style.opacity = '0.5';
            btn.style.filter = 'grayscale(60%)';
            btn.style.animation = 'drive-download-pulse 1s infinite';
            if (!document.getElementById('drive-download-pulse-style')) {
                const style = document.createElement('style');
                style.id = 'drive-download-pulse-style';
                style.innerText = '@keyframes drive-download-pulse { 0% { transform: scale(1); } 50% { transform: scale(0.93); } 100% { transform: scale(1); } }';
                document.head.appendChild(style);
            }
        } else {
            btn.style.opacity = '1';
            btn.style.filter = 'none';
            btn.style.animation = 'none';
        }
    }

    // ============================================================
    // בחירת הזרימה: סרטון בודד או ערוץ שלם
    // ============================================================

    function startDownloadFlow(format, optionsDiv) {

        if (isChannelPage()) {
            startChannelFlow(format, optionsDiv);
        } else {
            triggerDownload(format, optionsDiv);
        }
    }

    // ============================================================
    // ערוץ: קודם בדיקה כמה סרטונים חדשים יש, ואז אישור המשתמש
    // ============================================================

    function startChannelFlow(format, optionsDiv) {

        if (isRequestInFlight) return;

        const channelUrl = getChannelUrlFromPage();

        if (!channelUrl) {
            showModal('❌', 'שגיאה', 'לא זוהתה כתובת ערוץ בעמוד הזה.');
            return;
        }

        const email = GM_getValue("userEmail", "");
        const skipIds = getChannelLog(channelUrl, format);

        optionsDiv.style.display = 'none';
        setLoadingState(true);

        requestJson(
            {
                action: "channel_preview",
                url: channelUrl,
                email: email,
                format: format,
                deviceToken: GM_getValue("deviceToken", ""),
                skipIds: skipIds
            },
            {
                onload: function (res) {
                    setLoadingState(false);

                    if (res.deviceToken) {
                        GM_setValue("deviceToken", res.deviceToken);
                    }

                    if (res.needsVerification) {
                        setPendingVerification(email);
                        showVerificationCodeModal(email, optionsDiv);
                        return;
                    }

                    if (!res.success) {
                        showModal('❌', 'שגיאה', res.error || 'לא הצלחנו לקרוא את הערוץ.');
                        return;
                    }

                    if (!res.willDownload) {
                        showConfirmModal(
                            'ℹ️',
                            'אין סרטונים חדשים',
                            'כל ' + (res.alreadyDownloaded || 0) + ' הסרטונים שנסרקו ' +
                            'בערוץ "' + (res.channel || '') + '" כבר ירדו עבורך.\n\n' +
                            'לאפס את הזיכרון ולהוריד את הערוץ מההתחלה?',
                            'אפס והורד שוב',
                            function () {
                                clearChannelLog(channelUrl, format);
                                startChannelFlow(format, optionsDiv);
                            }
                        );
                        return;
                    }

                    showConfirmModal(
                        '📺',
                        'הורדת ערוץ: ' + (res.channel || ''),
                        'נמצאו ' + res.remaining + ' סרטונים שעדיין לא ירדו.\n' +
                        'בבקשה הזו יירדו ' + res.willDownload + ' סרטונים ' +
                        '(' + (format === 'video' ? 'וידאו' : 'אודיו') + ').\n' +
                        (res.alreadyDownloaded
                            ? 'המערכת תדלג על ' + res.alreadyDownloaded + ' שכבר ירדו.\n'
                            : '') +
                        '\nההורדה רצה ברקע ואפשר להמשיך לגלוש.',
                        'התחל הורדה',
                        function () {
                            submitChannelJob(channelUrl, format, skipIds, email);
                        }
                    );
                },
                onerror: function () {
                    setLoadingState(false);
                    showModal('❌', 'שגיאה', 'לא הצלחנו להתחבר לשרת.');
                },
                onBadJson: function (response) {
                    setLoadingState(false);
                    showBadJsonError(response);
                }
            },
            { timeoutMs: CHEAP_REQUEST_TIMEOUT_MS }
        );
    }

    function submitChannelJob(channelUrl, format, skipIds, email) {

        setLoadingState(true);

        requestJson(
            {
                action: "channel_download",
                url: channelUrl,
                email: email,
                format: format,
                // הטוקן נקרא כאן, בזמן השליחה, ולא בתחילת הזרימה:
                // אם התצוגה המקדימה הנפיקה טוקן חדש - נשתמש בו.
                deviceToken: GM_getValue("deviceToken", ""),
                skipIds: skipIds
            },
            {
                onload: function (res) {
                    setLoadingState(false);

                    if (res.deviceToken) {
                        GM_setValue("deviceToken", res.deviceToken);
                    }

                    if (res.error === "limit_reached") {
                        showModal('⚠️', 'הסתיימה המכסה היומית',
                            'המערכת הגיעה למכסה היומית של 200 קבצים.\nניתן לנסות שוב לאחר חצות.');
                        return;
                    }

                    // מצב תחרות: בין התצוגה המקדימה לאישור ירדו כל הסרטונים
                    // (למשל ממכשיר אחר) והשרת מדווח שאין מה להוריד.
                    if (res.nothingNew) {
                        showConfirmModal(
                            'ℹ️',
                            'אין סרטונים חדשים',
                            (res.message || 'כל הסרטונים בערוץ הזה כבר ירדו עבורך בעבר.') + '\n\n' +
                            'לאפס את הזיכרון ולהוריד את הערוץ מההתחלה?',
                            'אפס והורד שוב',
                            function () {
                                clearChannelLog(channelUrl, format);
                                startChannelFlow(format, document.getElementById('drive-download-options'));
                            }
                        );
                        return;
                    }

                    if (!res.success || !res.jobId) {
                        showModal('❌', 'שגיאה', res.error || 'לא הצלחנו לפתוח את העבודה.');
                        return;
                    }

                    // שומרים את העבודה הפעילה כדי להמשיך לעקוב גם אחרי רענון
                    GM_setValue("activeJob", JSON.stringify({
                        jobId: res.jobId,
                        channelUrl: channelUrl,
                        format: format,
                        channel: res.channel || ''
                    }));

                    showProgressModal(
                        'העבודה התחילה',
                        'ערוץ: ' + (res.channel || '') + '\n' +
                        '0 מתוך ' + res.total + ' סרטונים',
                        0
                    );

                    pollJob(res.jobId, channelUrl, format);
                },
                onerror: function () {
                    setLoadingState(false);
                    showModal('❌', 'שגיאה', 'לא הצלחנו להתחבר לשרת.');
                },
                onBadJson: function (response) {
                    setLoadingState(false);
                    showBadJsonError(response);
                }
            },
            { timeoutMs: CHEAP_REQUEST_TIMEOUT_MS }
        );
    }

    // ============================================================
    // מעקב אחרי התקדמות העבודה
    // ============================================================

    function pollJob(jobId, channelUrl, format) {

        if (activePollTimer) {
            clearTimeout(activePollTimer);
            activePollTimer = null;
        }

        requestJson(
            {
                action: "job_status",
                jobId: jobId,
                email: GM_getValue("userEmail", "")
            },
            {
                onload: function (res) {

                    // תשובה לא תקינה חד-פעמית - ממשיכים לדגום, זו לא סוף העבודה
                    if (!res || !res.success) {
                        if (res && res.error && /לא נמצאה/.test(res.error)) {
                            GM_setValue("activeJob", "");
                            showModal('❌', 'שגיאה', res.error || 'העבודה לא נמצאה.');
                            return;
                        }
                        scheduleNextPoll(jobId, channelUrl, format);
                        return;
                    }

                    // שומרים בלוג המקומי כל מה שכבר ירד, גם באמצע העבודה -
                    // כך גם סגירת הדפדפן באמצע לא תגרום להורדה כפולה
                    addToChannelLog(channelUrl, format, res.downloadedIds || []);

                    if (res.status === 'done' ||
                        res.status === 'error' ||
                        res.status === 'cancelled') {

                        GM_setValue("activeJob", "");

                        const title = res.status === 'error'
                            ? 'העבודה נעצרה'
                            : (res.status === 'cancelled'
                                ? 'ההורדה בוטלה'
                                : 'הורדת הערוץ הסתיימה');

                        showModal(
                            res.status === 'done' ? '✅' : '⚠️',
                            title,
                            '✅ ירדו: ' + res.done + '\n' +
                            '❌ נכשלו: ' + res.failed + '\n' +
                            '⛔ נחסמו: ' + res.blocked + '\n' +
                            (res.remainingAfter
                                ? '\nנשארו עוד ' + res.remainingAfter +
                                  ' סרטונים בערוץ - אפשר ללחוץ שוב.\n'
                                : '') +
                            (res.error ? '\n' + res.error : '') +
                            '\nפירוט מלא נמצא בקובץ log.txt בתוך התיקייה.',
                            res.folderLink
                        );

                        return;
                    }

                    showProgressModal(
                        'מוריד את הערוץ...',
                        (res.channel ? 'ערוץ: ' + res.channel + '\n' : '') +
                        res.processed + ' מתוך ' + res.total + ' סרטונים (' +
                        res.percent + '%)\n' +
                        '✅ ' + res.done + '  ❌ ' + res.failed + '  ⛔ ' + res.blocked +
                        (res.status === 'queued' ? '\n(ממתין בתור בשרת)' : ''),
                        res.percent
                    );

                    scheduleNextPoll(jobId, channelUrl, format);
                },
                onerror: function () {
                    // תקלת רשת או timeout חד-פעמיים - ממשיכים לדגום בשקט
                    scheduleNextPoll(jobId, channelUrl, format);
                },
                onBadJson: function () {
                    scheduleNextPoll(jobId, channelUrl, format);
                }
            },
            { timeoutMs: CHEAP_REQUEST_TIMEOUT_MS }
        );
    }

    function scheduleNextPoll(jobId, channelUrl, format) {

        activePollTimer = setTimeout(function () {
            pollJob(jobId, channelUrl, format);
        }, JOB_POLL_INTERVAL_MS);
    }

    // אם יש עבודה פעילה מהפעם הקודמת - ממשיכים לעקוב אחריה
    function resumeActiveJob() {

        const raw = GM_getValue("activeJob", "");

        if (!raw) return;

        try {

            const job = JSON.parse(raw);

            if (job && job.jobId) {
                pollJob(job.jobId, job.channelUrl, job.format);
            }

        } catch (e) {
            GM_setValue("activeJob", "");
        }
    }

    // ============================================================
    // הורדת סרטון בודד
    // ============================================================

    // מבצע את ההורדה בפועל (נקרא רק אחרי שכבר עברנו אימות בהצלחה).
    // בכוונה אין כאן timeout: ההורדה עצמה עלולה להמשיך לרוץ בשרת
    // גם אחרי שהתשובה מתאחרת.
    function triggerDownload(format, optionsDiv) {
        if (isRequestInFlight) return;

        const email = GM_getValue("userEmail", "");
        const currentUrl = window.location.href;

        optionsDiv.style.display = 'none';
        setLoadingState(true);

        requestJson(
            {
                url: currentUrl,
                email: email,
                format: format,
                deviceToken: GM_getValue("deviceToken", "")
            },
            {
                onload: function (res) {
                    setLoadingState(false);

                    if (res.deviceToken) {
                        GM_setValue("deviceToken", res.deviceToken);
                    }

                    if (res.error === "limit_reached" || (res.error && res.error.includes("המכסה היומית"))) {
                        showModal('⚠️', 'הסתיימה המכסה היומית',
                            'המערכת הגיעה למכסה היומית של 200 קבצים.\nניתן לנסות שוב לאחר חצות.');
                        return;
                    }

                    if (res.needsVerification) {
                        // הטוקן שהיה לנו כנראה כבר לא תקף (למשל נמחק ידנית) -
                        // חוזרים לתהליך אימות מהתחלה
                        setPendingVerification(email);
                        showVerificationCodeModal(email, optionsDiv);
                        return;
                    }

                    if (res.error || (res.success === false)) {
                        showServerError(res.error);
                        return;
                    }

                    // הצלחה - חלונית עם קישור לחיץ לדרייב
                    showModal('✅', 'ההורדה הושלמה בהצלחה!', 'הסרטון ירד ועלה לדרייב בהצלחה.', res.driveLink);
                },
                onerror: function (err) {
                    setLoadingState(false);
                    console.error("שגיאת תקשורת מוחלטת בבקשה לשרת:", err);
                    showConnectionError();
                },
                onBadJson: function (response) {
                    setLoadingState(false);
                    showBadJsonError(response);
                }
            }
            // בלי timeout - ההורדה עצמה עלולה להמשיך בשרת אחרי התשובה
        );
    }

    // ============================================================
    // אתחול
    // ============================================================

    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange']
        .forEach(function (evt) {
            document.addEventListener(evt, handleFullscreenChange);
        });

    // אחרי רענון העמוד בזמן המתנה לקוד אימות - פותח מחדש את חלונית הקוד.
    // בכוונה נקרא פעם אחת בטעינה ולא ב-setInterval, כדי שביטול ידני של
    // החלונית לא יפתח אותה שוב ושוב.
    function resumePendingVerification() {

        const pending = getPendingVerification();

        if (!pending) return;

        if (pending !== GM_getValue("userEmail", "")) {
            clearPendingVerification();
            return;
        }

        showVerificationCodeModal(
            pending,
            document.getElementById('drive-download-options'),
            "הקוד שנשלח למייל שלך עדיין ממתין. הכנס אותו כאן:"
        );
    }

    window.addEventListener('load', function () {
        createFloatingMenu();
        resumePendingVerification();
        resumeActiveJob();
    });

    // יוטיוב הוא SPA: ניווט פנימי עלול להסיר את הכפתור.
    // הבדיקה התקופתית מחזירה אותו, ומוודאת שהוא נשאר מוסתר במסך מלא.
    setInterval(function () {
        createFloatingMenu();
        ensureFullscreenVisibility();
    }, 3000);
})();
