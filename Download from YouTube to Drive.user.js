// ==UserScript==
// @name        הורדה לדרייב-יוטיוב מאת מטען נייד
// @namespace   http://tampermonkey.net/
// @version     3.0
// @description כפתור הורדה ישירה לדרייב, עם אימות מכשיר וחוויית משתמש משופרת
// @match       *://*.youtube.com/*
// @grant       GM_xmlhttpRequest
// @grant       GM_setValue
// @grant       GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwT34zd8XK8pmEnALIacYVLq0N6_3QDE9F_qCNFD4c5yhTgPi32Yj1FWA6FpiJSLqXH/exec";

    // רשימת שגיאות "ידועות" שמוצגות כמו שהן (לא מוחלפות בהודעת IP הגנרית)
    const KNOWN_ERROR_SNIPPETS = [
        "מכסה השעתית",
        "חסום",
        "קישור לא תקין",
        "המכסה היומית",
        "חסר קישור",
        "חסר אימייל"
    ];

    function isKnownError(errText) {
        if (!errText) return false;
        return KNOWN_ERROR_SNIPPETS.some(function (snippet) {
            return errText.indexOf(snippet) !== -1;
        });
    }

    let isRequestInFlight = false;

    function createFloatingMenu() {
        if (document.getElementById('drive-download-container')) return;

        const container = document.createElement('div');
        container.id = 'drive-download-container';
        Object.assign(container.style, {
            position: 'fixed', bottom: '20px', left: '20px',
            zIndex: '999999', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '10px'
        });

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
        videoBtn.onclick = () => triggerDownload('video', optionsDiv);
        addHoverEffect(videoBtn);

        const audioBtn = document.createElement('img');
        audioBtn.src = 'https://i.postimg.cc/kMLrh8J6/Gemini-Generated-Image-1a7koh1a7koh1a7k.jpg';
        Object.assign(audioBtn.style, getImgStyle('70px'));
        audioBtn.onclick = () => triggerDownload('audio', optionsDiv);
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
                    if (inputEmail && inputEmail.includes('@')) {
                        email = inputEmail.trim().toLowerCase();
                        GM_setValue("userEmail", email);
                        GM_setValue("deviceToken", ""); // מייל חדש = מתחילים אימות מכשיר מאפס
                        checkAuthAndShowOptions(email, optionsDiv);
                    }
                });
                return;
            }

            // אם האופציות כבר גלויות - רק סוגרים אותן, בלי לבדוק סטטוס שוב
            if (optionsDiv.style.display === 'flex') {
                optionsDiv.style.display = 'none';
                return;
            }

            checkAuthAndShowOptions(email, optionsDiv);
        };
        addHoverEffect(mainBtn);

        container.appendChild(optionsDiv);
        container.appendChild(mainBtn);
        document.body.appendChild(container);
    }

    // בודק מול השרת האם המכשיר הזה מאומת למייל הזה, לפני שמציגים וידאו/אודיו בכלל
    function checkAuthAndShowOptions(email, optionsDiv) {
        setLoadingState(true);
        const deviceToken = GM_getValue("deviceToken", "");

        GM_xmlhttpRequest({
            method: "POST",
            url: WEB_APP_URL,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({ action: "checkStatus", email: email, deviceToken: deviceToken }),
            onload: function(response) {
                setLoadingState(false);
                try {
                    const res = JSON.parse(response.responseText);

                    if (res.deviceToken) {
                        GM_setValue("deviceToken", res.deviceToken);
                    }

                    if (res.success && res.authenticated) {
                        optionsDiv.style.display = 'flex';
                        return;
                    }

                    if (res.needsVerification) {
                        showInputModal("🔑 אימות מכשיר חדש", res.error || "שלחנו קוד אימות בן 6 ספרות למייל שלך. הכנס אותו כאן:", (codeInput) => {
                            if (codeInput && codeInput.trim().length === 6) {
                                submitVerificationCode(email, codeInput.trim(), optionsDiv);
                            }
                        });
                        return;
                    }

                    showModal('❌', 'שגיאה', res.error || 'שגיאת שרת, נא לנסות שוב בעוד 20 דקות.');

                } catch (e) {
                    showModal('❌', 'שגיאה', 'שגיאת שרת, נא לנסות שוב בעוד 20 דקות.');
                }
            },
            onerror: function() {
                setLoadingState(false);
                showModal('❌', 'שגיאה', 'שגיאת שרת, נא לנסות שוב בעוד 20 דקות.');
            }
        });
    }

    // שולח קוד אימות שהוזן, ואם תקין - מקבל טוקן מכשיר ומציג את כפתורי הפורמט
    function submitVerificationCode(email, code, optionsDiv) {
        setLoadingState(true);
        const deviceToken = GM_getValue("deviceToken", "");

        GM_xmlhttpRequest({
            method: "POST",
            url: WEB_APP_URL,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({ action: "checkStatus", email: email, deviceToken: deviceToken, verificationCode: code }),
            onload: function(response) {
                setLoadingState(false);
                try {
                    const res = JSON.parse(response.responseText);

                    if (res.deviceToken) {
                        GM_setValue("deviceToken", res.deviceToken);
                    }

                    if (res.success && res.authenticated) {
                        optionsDiv.style.display = 'flex';
                        return;
                    }

                    if (res.needsVerification) {
                        // קוד שגוי - שואלים שוב, הפעם עם ההודעה שמציינת שהקוד שגוי
                        showInputModal("🔑 אימות מכשיר חדש", res.error || "קוד שגוי, נסה שוב:", (codeInput) => {
                            if (codeInput && codeInput.trim().length === 6) {
                                submitVerificationCode(email, codeInput.trim(), optionsDiv);
                            }
                        });
                        return;
                    }

                    showModal('❌', 'שגיאה', res.error || 'שגיאת שרת, נא לנסות שוב בעוד 20 דקות.');

                } catch (e) {
                    showModal('❌', 'שגיאה', 'שגיאת שרת, נא לנסות שוב בעוד 20 דקות.');
                }
            },
            onerror: function() {
                setLoadingState(false);
                showModal('❌', 'שגיאה', 'שגיאת שרת, נא לנסות שוב בעוד 20 דקות.');
            }
        });
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

    let currentOverlay = null;

    // חלונית הודעה, עם תמיכה אופציונלית בקישור לחיץ (לדרייב)
    function showModal(emoji, headingText, descriptionText, linkUrl) {
        if (currentOverlay && currentOverlay.parentNode) {
            currentOverlay.parentNode.removeChild(currentOverlay);
        }

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
        icon.style.fontSize = '40px'; icon.style.marginBottom = '10px';

        const title = document.createElement('h2');
        title.innerText = headingText;
        title.style.margin = '0 0 10px 0'; title.style.color = '#333';

        const desc = document.createElement('p');
        desc.innerText = descriptionText;
        desc.style.color = '#666'; desc.style.lineHeight = '1.5'; desc.style.fontSize = '15px';

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

        closeBtn.onclick = () => {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            currentOverlay = null;
        };

        modal.appendChild(devBox);
        modal.appendChild(closeBtn);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    function showInputModal(headingText, descriptionText, onSubmitCallback) {
        if (currentOverlay && currentOverlay.parentNode) {
            currentOverlay.parentNode.removeChild(currentOverlay);
        }

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
        title.style.margin = '0 0 10px 0'; title.style.color = '#333';

        const desc = document.createElement('p');
        desc.innerText = descriptionText;
        desc.style.color = '#666'; desc.style.lineHeight = '1.5'; desc.style.fontSize = '15px';

        const input = document.createElement('input');
        input.type = 'text';
        Object.assign(input.style, {
            width: '90%', padding: '10px', margin: '15px 0', fontSize: '16px',
            borderRadius: '8px', border: '1px solid #ccc', textAlign: 'center', outline: 'none'
        });

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
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            currentOverlay = null;
            if (onSubmitCallback) onSubmitCallback(val);
        };

        cancelBtn.onclick = () => {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            currentOverlay = null;
        };

        btnContainer.appendChild(submitBtn);
        btnContainer.appendChild(cancelBtn);

        modal.appendChild(title);
        modal.appendChild(desc);
        modal.appendChild(input);
        modal.appendChild(btnContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        input.focus();
    }

    // מבצע את ההורדה בפועל (נקרא רק אחרי שכבר עברנו אימות בהצלחה)
    function triggerDownload(format, optionsDiv) {
        if (isRequestInFlight) return;

        const email = GM_getValue("userEmail", "");
        const deviceToken = GM_getValue("deviceToken", "");
        const currentUrl = window.location.href;

        optionsDiv.style.display = 'none';
        setLoadingState(true);

        GM_xmlhttpRequest({
            method: "POST",
            url: WEB_APP_URL,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({ url: currentUrl, email: email, format: format, deviceToken: deviceToken }),
            onload: function(response) {
                setLoadingState(false);
                try {
                    const res = JSON.parse(response.responseText);

                    if (res.deviceToken) {
                        GM_setValue("deviceToken", res.deviceToken);
                    }

                    if (res.error === "limit_reached" || (res.error && res.error.includes("המכסה היומית"))) {
                        showModal('⚠️', 'הסתיימה המכסה היומית', 'המערכת הגיעה למכסה היומית של 100 קבצים.\nניתן לנסות שוב לאחר חצות.');
                        return;
                    }

                    if (res.needsVerification) {
                        // הטוקן שהיה לנו כנראה כבר לא תקף (למשל נמחק ידנית) - חוזרים לתהליך אימות מהתחלה
                        showInputModal("🔑 אימות מכשיר חדש", res.error || "שלחנו קוד אימות בן 6 ספרות למייל שלך. הכנס אותו כאן:", (codeInput) => {
                            if (codeInput && codeInput.trim().length === 6) {
                                submitVerificationCode(email, codeInput.trim(), optionsDiv);
                            }
                        });
                        return;
                    }

                    if (res.error || (res.success === false)) {
                        const friendlyIpMessage = 'עקב בקשות רבות מדי לשרת יוטיוב, השרת שלנו נחסם זמנית על ידי יוטיוב.\nאנא נסו שוב בעוד כ-20 דקות.';
                        const messageToShow = isKnownError(res.error) ? res.error : friendlyIpMessage;
                        showModal('❌', 'שגיאה', messageToShow);
                        return;
                    }

                    // הצלחה - חלונית עם קישור לחיץ לדרייב
                    showModal('✅', 'ההורדה הושלמה בהצלחה!', 'הסרטון ירד ועלה לדרייב בהצלחה.', res.driveLink);

                } catch (e) {
                    console.error("שגיאה בפענוח JSON:", e, response.responseText);
                    showModal('❌', 'שגיאה', 'עקב בקשות רבות מדי לשרת יוטיוב, השרת שלנו נחסם זמנית על ידי יוטיוב.\nאנא נסו שוב בעוד כ-20 דקות.');
                }
            },
            onerror: function(err) {
                setLoadingState(false);
                console.error("שגיאת תקשורת מוחלטת בבקשה לשרת:", err);
                showModal('❌', 'שגיאה', 'עקב בקשות רבות מדי לשרת יוטיוב, השרת שלנו נחסם זמנית על ידי יוטיוב.\nאנא נסו שוב בעוד כ-20 דקות.');
            }
        });
    }

    window.addEventListener('load', createFloatingMenu);
    setInterval(createFloatingMenu, 3000);
})();
