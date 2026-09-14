===================================================================
--- גרסה נוכחית
+++ גרסה חדשה
@@ -1,13 +1,10 @@
 // ==UserScript==
 // @name        הורדה לדרייב-יוטיוב מאת מטען נייד
 // @namespace   http://tampermonkey.net/
-// @version     4.1
-// @description כפתור הורדה ישירה לדרייב - סרטון בודד או ערוץ שלם, עם אימות מכשיר וחוויית משתמש משופרת
+// @version     3.0
+// @description כפתור הורדה ישירה לדרייב, עם אימות מכשיר וחוויית משתמש משופרת
 // @match       *://*.youtube.com/*
-// @homepageURL https://github.com/matennayad/Download-from-YouTube-to-Drive
-// @downloadURL https://raw.githubusercontent.com/matennayad/Download-from-YouTube-to-Drive/main/Download%20from%20YouTube%20to%20Drive.user.js
-// @updateURL   https://raw.githubusercontent.com/matennayad/Download-from-YouTube-to-Drive/main/Download%20from%20YouTube%20to%20Drive.user.js
 // @grant       GM_xmlhttpRequest
 // @grant       GM_setValue
 // @grant       GM_getValue
 // ==/UserScript==
@@ -16,155 +13,27 @@
     'use strict';
 
     const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwT34zd8XK8pmEnALIacYVLq0N6_3QDE9F_qCNFD4c5yhTgPi32Yj1FWA6FpiJSLqXH/exec";
 
-    // הצגת שגיאה שהגיעה מהשרת.
-    //
-    // בעבר כל שגיאה שלא הופיעה ברשימה קצרה של מחרוזות מוכרות הוחלפה
-    // בהודעה "יוטיוב חסם אותנו, נסו בעוד 20 דקות". זה הסתיר את הסיבה
-    // האמיתית והציג למשתמש מידע שגוי - למשל כשהתקלה הייתה בהגדרות
-    // ולא ביוטיוב בכלל. עכשיו מוצג מה שהשרת באמת אמר.
-    //
-    // הודעות מהשרת שלנו כתובות בעברית ומיועדות למשתמש, אז הן מוצגות
-    // כמו שהן. שגיאה טכנית באנגלית (yt-dlp, חריגה בקוד) מקבלת הסבר
-    // בעברית, והטקסט המקורי מופיע מתחתיו כדי שאפשר יהיה לדווח עליו.
+    // רשימת שגיאות "ידועות" שמוצגות כמו שהן (לא מוחלפות בהודעת IP הגנרית)
+    const KNOWN_ERROR_SNIPPETS = [
+        "מכסה השעתית",
+        "חסום",
+        "קישור לא תקין",
+        "המכסה היומית",
+        "חסר קישור",
+        "חסר אימייל"
+    ];
 
-    function showServerError(errText, fallbackTitle) {
-
-        const text = (errText || '').toString().trim();
-
-        if (!text) {
-            showModal('❌', fallbackTitle || 'שגיאה',
-                'השרת לא החזיר סיבה.\n\n' +
-                'כדאי לבדוק בגיליון "לוג שגיאות ובקשות" מה נרשם שם.');
-            return;
-        }
-
-        // עברית = הודעה שנכתבה עבור המשתמש
-        if (/[\u0590-\u05FF]/.test(text)) {
-            showModal('❌', fallbackTitle || 'שגיאה', text);
-            return;
-        }
-
-        showModal('❌', 'ההורדה נכשלה',
-            'ההורדה נכשלה מסיבה טכנית.\n' +
-            'לרוב זה זמני - כדאי לנסות שוב בעוד כמה דקות.\n\n' +
-            'פירוט:\n' + text.substring(0, 300));
+    function isKnownError(errText) {
+        if (!errText) return false;
+        return KNOWN_ERROR_SNIPPETS.some(function (snippet) {
+            return errText.indexOf(snippet) !== -1;
+        });
     }
 
-
-    // כשאין תשובה מהשרת בכלל - תקלת רשת או פריסה שלא עודכנה
-    function showConnectionError() {
-        showModal('❌', 'אין תשובה מהשרת',
-            'לא הצלחנו לקבל תשובה מהשרת.\n\n' +
-            'אם זה חוזר: לוודא שה-Web App פרוס בגרסה העדכנית, ' +
-            'ושיש חיבור לאינטרנט.');
-    }
-
     let isRequestInFlight = false;
 
-    // כמה סרטונים יורדים לכל היותר בבקשה אחת (חייב להתאים לשרת)
-    const MAX_VIDEOS_PER_CHANNEL_REQUEST = 20;
-
-    // כל כמה זמן בודקים התקדמות של עבודת ערוץ
-    const JOB_POLL_INTERVAL_MS = 15000;
-
-    let activePollTimer = null;
-
-
-    // ============================================================
-    // זיהוי עמוד ערוץ / פלייליסט
-    // ============================================================
-
-    // מחזיר כתובת ערוץ נקייה, או null אם אנחנו לא בעמוד ערוץ
-    function getChannelUrlFromPage() {
-
-        const path = window.location.pathname;
-
-        const search = window.location.search;
-
-        // פלייליסט
-        if (path === '/playlist' && /[?&]list=/.test(search)) {
-            const listId = new URLSearchParams(search).get('list');
-            if (listId) {
-                return 'https://www.youtube.com/playlist?list=' + listId;
-            }
-        }
-
-        // ערוץ: /@handle  /channel/UC..  /c/name  /user/name
-        const match = path.match(
-            /^\/(@[\w\-.]+|channel\/[\w\-]+|c\/[\w\-.]+|user\/[\w\-.]+)/
-        );
-
-        if (match) {
-            return 'https://www.youtube.com/' + match[1];
-        }
-
-        return null;
-    }
-
-
-    function isChannelPage() {
-        return !!getChannelUrlFromPage();
-    }
-
-
-    // ============================================================
-    // הלוג המקומי: אילו סרטונים כבר ירדו מהערוץ הזה
-    // ============================================================
-    // נשמר בדפדפן של המשתמש (GM_setValue) ונשלח לשרת בבקשה הבאה,
-    // כדי שלא יורידו פעמיים את אותו סרטון.
-
-    function channelLogKey(channelUrl, format) {
-
-        const clean = (channelUrl || '')
-            .toLowerCase()
-            .replace(/^https?:\/\//, '')
-            .replace(/^www\./, '')
-            .replace(/\/$/, '');
-
-        return 'chlog::' + clean + '::' + format;
-    }
-
-
-    function getChannelLog(channelUrl, format) {
-
-        try {
-            const raw = GM_getValue(
-                channelLogKey(channelUrl, format),
-                '[]'
-            );
-            const parsed = JSON.parse(raw);
-            return Array.isArray(parsed) ? parsed : [];
-        } catch (e) {
-            return [];
-        }
-    }
-
-
-    function addToChannelLog(channelUrl, format, ids) {
-
-        if (!ids || !ids.length) return;
-
-        const existing = getChannelLog(channelUrl, format);
-        const merged = {};
-
-        existing.concat(ids).forEach(function (id) {
-            if (id) merged[id] = true;
-        });
-
-        GM_setValue(
-            channelLogKey(channelUrl, format),
-            JSON.stringify(Object.keys(merged))
-        );
-    }
-
-
-    // מאפשר למשתמש לאפס את הזיכרון ולהוריד את הערוץ מההתחלה
-    function clearChannelLog(channelUrl, format) {
-        GM_setValue(channelLogKey(channelUrl, format), '[]');
-    }
-
     function createFloatingMenu() {
         if (document.getElementById('drive-download-container')) return;
 
         const container = document.createElement('div');
@@ -185,15 +54,15 @@
 
         const videoBtn = document.createElement('img');
         videoBtn.src = 'https://i.postimg.cc/gc19BRzZ/Gemini-Generated-Image-wcg6lawcg6lawcg6.jpg';
         Object.assign(videoBtn.style, getImgStyle('70px'));
-        videoBtn.onclick = () => startDownloadFlow('video', optionsDiv);
+        videoBtn.onclick = () => triggerDownload('video', optionsDiv);
         addHoverEffect(videoBtn);
 
         const audioBtn = document.createElement('img');
         audioBtn.src = 'https://i.postimg.cc/kMLrh8J6/Gemini-Generated-Image-1a7koh1a7koh1a7k.jpg';
         Object.assign(audioBtn.style, getImgStyle('70px'));
-        audioBtn.onclick = () => startDownloadFlow('audio', optionsDiv);
+        audioBtn.onclick = () => triggerDownload('audio', optionsDiv);
         addHoverEffect(audioBtn);
 
         optionsDiv.appendChild(videoBtn);
         optionsDiv.appendChild(audioBtn);
@@ -267,22 +136,17 @@
                         });
                         return;
                     }
 
-                    showServerError(res.error);
+                    showModal('❌', 'שגיאה', res.error || 'שגיאת שרת, נא לנסות שוב בעוד 20 דקות.');
 
                 } catch (e) {
-                    console.error("שגיאה בפענוח JSON:", e, response.responseText);
-                    showModal('❌', 'תשובה לא תקינה מהשרת',
-                        'השרת החזיר משהו שאינו JSON.\n\n' +
-                        'לרוב זה אומר שה-Web App לא פרוס בגרסה העדכנית.\n\n' +
-                        'תחילת התשובה:\n' +
-                        (response.responseText || '').substring(0, 200));
+                    showModal('❌', 'שגיאה', 'שגיאת שרת, נא לנסות שוב בעוד 20 דקות.');
                 }
             },
             onerror: function() {
                 setLoadingState(false);
-                showConnectionError();
+                showModal('❌', 'שגיאה', 'שגיאת שרת, נא לנסות שוב בעוד 20 דקות.');
             }
         });
     }
 
@@ -319,22 +183,17 @@
                         });
                         return;
                     }
 
-                    showServerError(res.error);
+                    showModal('❌', 'שגיאה', res.error || 'שגיאת שרת, נא לנסות שוב בעוד 20 דקות.');
 
                 } catch (e) {
-                    console.error("שגיאה בפענוח JSON:", e, response.responseText);
-                    showModal('❌', 'תשובה לא תקינה מהשרת',
-                        'השרת החזיר משהו שאינו JSON.\n\n' +
-                        'לרוב זה אומר שה-Web App לא פרוס בגרסה העדכנית.\n\n' +
-                        'תחילת התשובה:\n' +
-                        (response.responseText || '').substring(0, 200));
+                    showModal('❌', 'שגיאה', 'שגיאת שרת, נא לנסות שוב בעוד 20 דקות.');
                 }
             },
             onerror: function() {
                 setLoadingState(false);
-                showConnectionError();
+                showModal('❌', 'שגיאה', 'שגיאת שרת, נא לנסות שוב בעוד 20 דקות.');
             }
         });
     }
 
@@ -553,478 +412,8 @@
         document.body.appendChild(overlay);
         input.focus();
     }
 
-    // ============================================================
-    // בחירת הזרימה: סרטון בודד או ערוץ שלם
-    // ============================================================
-
-    function startDownloadFlow(format, optionsDiv) {
-
-        if (isChannelPage()) {
-            startChannelFlow(format, optionsDiv);
-        } else {
-            triggerDownload(format, optionsDiv);
-        }
-    }
-
-
-    // ============================================================
-    // ערוץ: קודם בדיקה כמה סרטונים חדשים יש, ואז אישור המשתמש
-    // ============================================================
-
-    function startChannelFlow(format, optionsDiv) {
-
-        if (isRequestInFlight) return;
-
-        const channelUrl = getChannelUrlFromPage();
-
-        if (!channelUrl) {
-            showModal('❌', 'שגיאה', 'לא זוהתה כתובת ערוץ בעמוד הזה.');
-            return;
-        }
-
-        const email = GM_getValue("userEmail", "");
-        const deviceToken = GM_getValue("deviceToken", "");
-        const skipIds = getChannelLog(channelUrl, format);
-
-        optionsDiv.style.display = 'none';
-        setLoadingState(true);
-
-        GM_xmlhttpRequest({
-            method: "POST",
-            url: WEB_APP_URL,
-            headers: { "Content-Type": "application/json" },
-            data: JSON.stringify({
-                action: "channel_preview",
-                url: channelUrl,
-                email: email,
-                format: format,
-                deviceToken: deviceToken,
-                skipIds: skipIds
-            }),
-            onload: function (response) {
-                setLoadingState(false);
-
-                let res;
-
-                try {
-                    res = JSON.parse(response.responseText);
-                } catch (e) {
-                    showModal('❌', 'שגיאה', 'תשובה לא תקינה מהשרת.');
-                    return;
-                }
-
-                if (res.needsVerification) {
-                    showInputModal(
-                        "🔑 אימות מכשיר",
-                        res.error || "הכנס את קוד האימות שקיבלת במייל:",
-                        function (codeInput) {
-                            if (codeInput && codeInput.trim().length === 6) {
-                                submitVerificationCode(email, codeInput.trim(), optionsDiv);
-                            }
-                        }
-                    );
-                    return;
-                }
-
-                if (!res.success) {
-                    showModal('❌', 'שגיאה', res.error || 'לא הצלחנו לקרוא את הערוץ.');
-                    return;
-                }
-
-                if (!res.willDownload) {
-                    showConfirmModal(
-                        'ℹ️',
-                        'אין סרטונים חדשים',
-                        'כל ' + (res.alreadyDownloaded || 0) + ' הסרטונים שנסרקו ' +
-                        'בערוץ "' + (res.channel || '') + '" כבר ירדו עבורך.\n\n' +
-                        'לאפס את הזיכרון ולהוריד את הערוץ מההתחלה?',
-                        'אפס והורד שוב',
-                        function () {
-                            clearChannelLog(channelUrl, format);
-                            startChannelFlow(format, optionsDiv);
-                        }
-                    );
-                    return;
-                }
-
-                showConfirmModal(
-                    '📺',
-                    'הורדת ערוץ: ' + (res.channel || ''),
-                    'נמצאו ' + res.remaining + ' סרטונים שעדיין לא ירדו.\n' +
-                    'בבקשה הזו יירדו ' + res.willDownload + ' סרטונים ' +
-                    '(' + (format === 'video' ? 'וידאו' : 'אודיו') + ').\n' +
-                    (res.alreadyDownloaded
-                        ? 'המערכת תדלג על ' + res.alreadyDownloaded + ' שכבר ירדו.\n'
-                        : '') +
-                    '\nההורדה רצה ברקע ואפשר להמשיך לגלוש.',
-                    'התחל הורדה',
-                    function () {
-                        submitChannelJob(channelUrl, format, skipIds, email, deviceToken);
-                    }
-                );
-            },
-            onerror: function () {
-                setLoadingState(false);
-                showModal('❌', 'שגיאה', 'לא הצלחנו להתחבר לשרת.');
-            }
-        });
-    }
-
-
-    function submitChannelJob(channelUrl, format, skipIds, email, deviceToken) {
-
-        setLoadingState(true);
-
-        GM_xmlhttpRequest({
-            method: "POST",
-            url: WEB_APP_URL,
-            headers: { "Content-Type": "application/json" },
-            data: JSON.stringify({
-                action: "channel_download",
-                url: channelUrl,
-                email: email,
-                format: format,
-                deviceToken: deviceToken,
-                skipIds: skipIds
-            }),
-            onload: function (response) {
-                setLoadingState(false);
-
-                let res;
-
-                try {
-                    res = JSON.parse(response.responseText);
-                } catch (e) {
-                    showModal('❌', 'שגיאה', 'תשובה לא תקינה מהשרת.');
-                    return;
-                }
-
-                if (res.error === "limit_reached") {
-                    showModal('⚠️', 'הסתיימה המכסה היומית',
-                        'המערכת הגיעה למכסה היומית.\nניתן לנסות שוב לאחר חצות.');
-                    return;
-                }
-
-                if (!res.success || !res.jobId) {
-                    showModal('❌', 'שגיאה', res.error || 'לא הצלחנו לפתוח את העבודה.');
-                    return;
-                }
-
-                // שומרים את העבודה הפעילה כדי להמשיך לעקוב גם אחרי רענון
-                GM_setValue("activeJob", JSON.stringify({
-                    jobId: res.jobId,
-                    channelUrl: channelUrl,
-                    format: format,
-                    channel: res.channel || ''
-                }));
-
-                showProgressModal(
-                    'העבודה התחילה',
-                    'ערוץ: ' + (res.channel || '') + '\n' +
-                    '0 מתוך ' + res.total + ' סרטונים'
-                );
-
-                pollJob(res.jobId, channelUrl, format);
-            },
-            onerror: function () {
-                setLoadingState(false);
-                showModal('❌', 'שגיאה', 'לא הצלחנו להתחבר לשרת.');
-            }
-        });
-    }
-
-
-    // ============================================================
-    // מעקב אחרי התקדמות העבודה
-    // ============================================================
-
-    function pollJob(jobId, channelUrl, format) {
-
-        if (activePollTimer) {
-            clearTimeout(activePollTimer);
-            activePollTimer = null;
-        }
-
-        GM_xmlhttpRequest({
-            method: "POST",
-            url: WEB_APP_URL,
-            headers: { "Content-Type": "application/json" },
-            data: JSON.stringify({
-                action: "job_status",
-                jobId: jobId,
-                email: GM_getValue("userEmail", "")
-            }),
-            onload: function (response) {
-
-                let res;
-
-                try {
-                    res = JSON.parse(response.responseText);
-                } catch (e) {
-                    scheduleNextPoll(jobId, channelUrl, format);
-                    return;
-                }
-
-                if (!res.success) {
-                    showModal('❌', 'שגיאה', res.error || 'העבודה לא נמצאה.');
-                    GM_setValue("activeJob", "");
-                    return;
-                }
-
-                // שומרים בלוג המקומי כל מה שכבר ירד, גם באמצע העבודה
-                addToChannelLog(channelUrl, format, res.downloadedIds || []);
-
-                if (res.status === 'done' ||
-                    res.status === 'error' ||
-                    res.status === 'cancelled') {
-
-                    GM_setValue("activeJob", "");
-
-                    const title = res.status === 'error'
-                        ? 'העבודה נעצרה'
-                        : (res.status === 'cancelled'
-                            ? 'ההורדה בוטלה'
-                            : 'הורדת הערוץ הסתיימה');
-
-                    showModal(
-                        res.status === 'done' ? '✅' : '⚠️',
-                        title,
-                        '✅ ירדו: ' + res.done + '\n' +
-                        '❌ נכשלו: ' + res.failed + '\n' +
-                        '⛔ נחסמו: ' + res.blocked + '\n' +
-                        (res.remainingAfter
-                            ? '\nנשארו עוד ' + res.remainingAfter +
-                              ' סרטונים בערוץ - אפשר ללחוץ שוב.\n'
-                            : '') +
-                        (res.error ? '\n' + res.error : '') +
-                        '\nפירוט מלא נמצא בקובץ log.txt בתוך התיקייה.',
-                        res.folderLink
-                    );
-
-                    return;
-                }
-
-                showProgressModal(
-                    'מוריד את הערוץ...',
-                    (res.channel ? 'ערוץ: ' + res.channel + '\n' : '') +
-                    res.processed + ' מתוך ' + res.total + ' סרטונים (' +
-                    res.percent + '%)\n' +
-                    '✅ ' + res.done + '  ❌ ' + res.failed + '  ⛔ ' + res.blocked +
-                    (res.status === 'queued' ? '\n(ממתין בתור בשרת)' : ''),
-                    res.percent
-                );
-
-                scheduleNextPoll(jobId, channelUrl, format);
-            },
-            onerror: function () {
-                scheduleNextPoll(jobId, channelUrl, format);
-            }
-        });
-    }
-
-
-    function scheduleNextPoll(jobId, channelUrl, format) {
-
-        activePollTimer = setTimeout(function () {
-            pollJob(jobId, channelUrl, format);
-        }, JOB_POLL_INTERVAL_MS);
-    }
-
-
-    // אם יש עבודה פעילה מהפעם הקודמת - ממשיכים לעקוב אחריה
-    function resumeActiveJob() {
-
-        const raw = GM_getValue("activeJob", "");
-
-        if (!raw) return;
-
-        try {
-
-            const job = JSON.parse(raw);
-
-            if (job && job.jobId) {
-                pollJob(job.jobId, job.channelUrl, job.format);
-            }
-
-        } catch (e) {
-            GM_setValue("activeJob", "");
-        }
-    }
-
-
-    // ============================================================
-    // חלונית התקדמות (מתעדכנת במקום להיפתח מחדש)
-    // ============================================================
-
-    function showProgressModal(headingText, descriptionText, percent) {
-
-        const existingHeading = document.getElementById('drive-progress-heading');
-
-        if (existingHeading && currentOverlay && currentOverlay.parentNode) {
-
-            existingHeading.innerText = headingText;
-
-            const desc = document.getElementById('drive-progress-desc');
-            if (desc) desc.innerText = descriptionText;
-
-            const bar = document.getElementById('drive-progress-bar');
-            if (bar) bar.style.width = (percent || 0) + '%';
-
-            return;
-        }
-
-        if (currentOverlay && currentOverlay.parentNode) {
-            currentOverlay.parentNode.removeChild(currentOverlay);
-        }
-
-        const overlay = document.createElement('div');
-        currentOverlay = overlay;
-        Object.assign(overlay.style, {
-            position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
-            backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: '9999999',
-            display: 'flex', justifyContent: 'center', alignItems: 'center',
-            fontFamily: 'Arial, sans-serif'
-        });
-
-        const modal = document.createElement('div');
-        Object.assign(modal.style, {
-            backgroundColor: '#fff', padding: '30px', borderRadius: '15px',
-            textAlign: 'center', maxWidth: '400px', minWidth: '320px',
-            boxShadow: '0 5px 20px rgba(0,0,0,0.3)', direction: 'rtl'
-        });
-
-        const emojiEl = document.createElement('div');
-        emojiEl.innerText = '⬇️';
-        emojiEl.style.fontSize = '40px';
-
-        const heading = document.createElement('h2');
-        heading.id = 'drive-progress-heading';
-        heading.innerText = headingText;
-        heading.style.margin = '10px 0';
-
-        const desc = document.createElement('p');
-        desc.id = 'drive-progress-desc';
-        desc.innerText = descriptionText;
-        desc.style.whiteSpace = 'pre-line';
-        desc.style.color = '#444';
-
-        const barOuter = document.createElement('div');
-        Object.assign(barOuter.style, {
-            width: '100%', height: '10px', backgroundColor: '#eee',
-            borderRadius: '5px', overflow: 'hidden', margin: '15px 0'
-        });
-
-        const bar = document.createElement('div');
-        bar.id = 'drive-progress-bar';
-        Object.assign(bar.style, {
-            width: (percent || 0) + '%', height: '100%',
-            backgroundColor: '#4caf50', transition: 'width 0.4s'
-        });
-
-        barOuter.appendChild(bar);
-
-        const hideBtn = document.createElement('button');
-        hideBtn.innerText = 'סגור חלונית (ההורדה תמשיך)';
-        Object.assign(hideBtn.style, {
-            padding: '8px 16px', border: 'none', borderRadius: '8px',
-            backgroundColor: '#eee', cursor: 'pointer', fontSize: '14px'
-        });
-        hideBtn.onclick = function () {
-            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
-            currentOverlay = null;
-        };
-
-        modal.appendChild(emojiEl);
-        modal.appendChild(heading);
-        modal.appendChild(desc);
-        modal.appendChild(barOuter);
-        modal.appendChild(hideBtn);
-        overlay.appendChild(modal);
-        document.body.appendChild(overlay);
-    }
-
-
-    // ============================================================
-    // חלונית אישור (כן / ביטול)
-    // ============================================================
-
-    function showConfirmModal(emoji, headingText, descriptionText, confirmLabel, onConfirm) {
-
-        if (currentOverlay && currentOverlay.parentNode) {
-            currentOverlay.parentNode.removeChild(currentOverlay);
-        }
-
-        const overlay = document.createElement('div');
-        currentOverlay = overlay;
-        Object.assign(overlay.style, {
-            position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
-            backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: '9999999',
-            display: 'flex', justifyContent: 'center', alignItems: 'center',
-            fontFamily: 'Arial, sans-serif'
-        });
-
-        const modal = document.createElement('div');
-        Object.assign(modal.style, {
-            backgroundColor: '#fff', padding: '30px', borderRadius: '15px',
-            textAlign: 'center', maxWidth: '420px', boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
-            direction: 'rtl'
-        });
-
-        const emojiEl = document.createElement('div');
-        emojiEl.innerText = emoji;
-        emojiEl.style.fontSize = '40px';
-
-        const heading = document.createElement('h2');
-        heading.innerText = headingText;
-        heading.style.margin = '10px 0';
-
-        const desc = document.createElement('p');
-        desc.innerText = descriptionText;
-        desc.style.whiteSpace = 'pre-line';
-        desc.style.color = '#444';
-
-        const btnContainer = document.createElement('div');
-        Object.assign(btnContainer.style, {
-            display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px'
-        });
-
-        const okBtn = document.createElement('button');
-        okBtn.innerText = confirmLabel || 'אישור';
-        Object.assign(okBtn.style, {
-            padding: '10px 20px', border: 'none', borderRadius: '8px',
-            backgroundColor: '#4caf50', color: '#fff', cursor: 'pointer', fontSize: '15px'
-        });
-        okBtn.onclick = function () {
-            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
-            currentOverlay = null;
-            if (onConfirm) onConfirm();
-        };
-
-        const cancelBtn = document.createElement('button');
-        cancelBtn.innerText = 'ביטול';
-        Object.assign(cancelBtn.style, {
-            padding: '10px 20px', border: 'none', borderRadius: '8px',
-            backgroundColor: '#eee', cursor: 'pointer', fontSize: '15px'
-        });
-        cancelBtn.onclick = function () {
-            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
-            currentOverlay = null;
-        };
-
-        btnContainer.appendChild(okBtn);
-        btnContainer.appendChild(cancelBtn);
-
-        modal.appendChild(emojiEl);
-        modal.appendChild(heading);
-        modal.appendChild(desc);
-        modal.appendChild(btnContainer);
-        overlay.appendChild(modal);
-        document.body.appendChild(overlay);
-    }
-
-
     // מבצע את ההורדה בפועל (נקרא רק אחרי שכבר עברנו אימות בהצלחה)
     function triggerDownload(format, optionsDiv) {
         if (isRequestInFlight) return;
 
@@ -1064,36 +453,29 @@
                         return;
                     }
 
                     if (res.error || (res.success === false)) {
-                        showServerError(res.error);
+                        const friendlyIpMessage = 'עקב בקשות רבות מדי לשרת יוטיוב, השרת שלנו נחסם זמנית על ידי יוטיוב.\nאנא נסו שוב בעוד כ-20 דקות.';
+                        const messageToShow = isKnownError(res.error) ? res.error : friendlyIpMessage;
+                        showModal('❌', 'שגיאה', messageToShow);
                         return;
                     }
 
                     // הצלחה - חלונית עם קישור לחיץ לדרייב
                     showModal('✅', 'ההורדה הושלמה בהצלחה!', 'הסרטון ירד ועלה לדרייב בהצלחה.', res.driveLink);
 
                 } catch (e) {
                     console.error("שגיאה בפענוח JSON:", e, response.responseText);
-                    showModal('❌', 'תשובה לא תקינה מהשרת',
-                        'השרת החזיר משהו שאינו JSON.\n\n' +
-                        'זה קורה בדרך כלל כשה-Web App לא פרוס בגרסה ' +
-                        'העדכנית, או כשגוגל מחזירה דף שגיאה.\n\n' +
-                        'תחילת התשובה:\n' +
-                        (response.responseText || '').substring(0, 200));
+                    showModal('❌', 'שגיאה', 'עקב בקשות רבות מדי לשרת יוטיוב, השרת שלנו נחסם זמנית על ידי יוטיוב.\nאנא נסו שוב בעוד כ-20 דקות.');
                 }
             },
             onerror: function(err) {
                 setLoadingState(false);
                 console.error("שגיאת תקשורת מוחלטת בבקשה לשרת:", err);
-                showConnectionError();
+                showModal('❌', 'שגיאה', 'עקב בקשות רבות מדי לשרת יוטיוב, השרת שלנו נחסם זמנית על ידי יוטיוב.\nאנא נסו שוב בעוד כ-20 דקות.');
             }
         });
     }
 
-    window.addEventListener('load', function () {
-        createFloatingMenu();
-        resumeActiveJob();
-    });
-
+    window.addEventListener('load', createFloatingMenu);
     setInterval(createFloatingMenu, 3000);
 })();
