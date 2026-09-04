// ==UserScript==
// @name         הורדה לדרייב-יוטיוב מאת מטען נייד
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  כפתור הורדה ישירה לדרייב המבוסס על תמונות מעוצבות אישית וחלונית עם קישור מודגש
// @match        *://*.youtube.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwT34zd8XK8pmEnALIacYVLq0N6_3QDE9F_qCNFD4c5yhTgPi32Yj1FWA6FpiJSLqXH/exec";

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

        // כפתור וידאו מתמונה - גודל 70px
        const videoBtn = document.createElement('img');
        videoBtn.src = 'https://i.postimg.cc/gc19BRzZ/Gemini-Generated-Image-wcg6lawcg6lawcg6.jpg';
        Object.assign(videoBtn.style, getImgStyle('70px'));
        videoBtn.onclick = () => triggerDownload('video', optionsDiv);
        addHoverEffect(videoBtn);

        // כפתור אודיו מתמונה - גודל 70px
        const audioBtn = document.createElement('img');
        audioBtn.src = 'https://i.postimg.cc/kMLrh8J6/Gemini-Generated-Image-1a7koh1a7koh1a7k.jpg';
        Object.assign(audioBtn.style, getImgStyle('70px'));
        audioBtn.onclick = () => triggerDownload('audio', optionsDiv);
        addHoverEffect(audioBtn);

        optionsDiv.appendChild(videoBtn);
        optionsDiv.appendChild(audioBtn);

        // כפתור ראשי מתמונה - גודל 90px
        const mainBtn = document.createElement('img');
        mainBtn.id = 'drive-download-btn';
        mainBtn.src = 'https://i.postimg.cc/2jgpXvkB/Gemini-Generated-Image-uwb0qfuwb0qfuwb0.jpg';
        Object.assign(mainBtn.style, getImgStyle('90px'));
        mainBtn.onclick = () => {
            let email = GM_getValue("userEmail", "");
            if (!email) {
                email = prompt("הכנס כתובת מייל מורשית להורדה:");
                if (!email) return;
                GM_setValue("userEmail", email.trim().toLowerCase());
            }
            optionsDiv.style.display = optionsDiv.style.display === 'none' ? 'flex' : 'none';
        };
        addHoverEffect(mainBtn);

        container.appendChild(optionsDiv);
        container.appendChild(mainBtn);
        document.body.appendChild(container);
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

    function showSuccessModal() {
        const overlay = document.createElement('div');
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
        icon.innerText = '✅';
        icon.style.fontSize = '40px'; icon.style.marginBottom = '10px';

        const title = document.createElement('h2');
        title.innerText = 'הבקשה נשלחה!';
        title.style.margin = '0 0 10px 0'; title.style.color = '#333';

        const desc = document.createElement('p');
        desc.innerText = 'השרת מטפל כרגע בבקשה.\nתוך דקה-שתיים תקבל למייל קישור להורדה.';
        desc.style.color = '#666'; desc.style.lineHeight = '1.5'; desc.style.fontSize = '15px';

        // קופסת הקרדיט המעוצבת
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
        fingerIcon.innerText = ' 👉'; // האצבע הוחלפה לכיוון ימין

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
        };

        modal.appendChild(icon);
        modal.appendChild(title);
        modal.appendChild(desc);
        modal.appendChild(devBox);
        modal.appendChild(closeBtn);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    function triggerDownload(format, optionsDiv) {
        const email = GM_getValue("userEmail", "");
        const currentUrl = window.location.href;

        optionsDiv.style.display = 'none';
        showSuccessModal();

        GM_xmlhttpRequest({
            method: "POST",
            url: WEB_APP_URL,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({ url: currentUrl, email: email, format: format }),
            onload: function(response) {
                try {
                    const res = JSON.parse(response.responseText);
                    if (!res.success && (res.error === "האימייל אינו מורשה במערכת." || res.error.includes("חסום"))) {
                        GM_setValue("userEmail", "");
                    }
                } catch (e) {}
            }
        });
    }

    window.addEventListener('load', createFloatingMenu);
    setInterval(createFloatingMenu, 3000);
})();
