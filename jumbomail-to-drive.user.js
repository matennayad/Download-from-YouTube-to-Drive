// ==UserScript==
// @name         ג'מבו מייל לדרייב
// @namespace    https://mitmachim.top/user/מטען-נייד
// @version      1.0.0
// @description  הורדות מג'מבו מייל עוברות ישירות לגוגל דרייב, בלי להישמר במחשב.
// @author       מטען נייד
// @match        https://*.jumbomail.me/*
// @match        https://jumbomail.me/*
// @match        https://*.jumbomail.co.il/*
// @match        https://jumbomail.co.il/*
// @match        https://developers.google.com/oauthplayground*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAALRlWElmSUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADAAAAADoAQAAQAAADAAAAAAAAAADYNOUQAAA6dJREFUeJztlU1sDGEYx/cgRVyQOEgkThL1FRKiER+H+lYkvhoSF2KXUlq1X92ZnZ2dbrc778y2TTe6O8VqDyX0IFxcSiKCEC5EiLvdftJWu6vT9pVhZ/eZ0VnkPbAyh9/lfd7D/7fv/9mxFDlsCRLWCDQm4UhHa4IEiykgmAIJU6CokAXmOc/05Qt4wO8Z8YSCKSMcPgaTEAiLKRIst5sj40bhN3rtQ+PXbuF8vLroJ+J+LUeE5V20fdJIoJyjv5gCF00BnFfgYUSSjQR2+tzD/7zA4trKASOB2Q5bsp7nU48ikmxEp9uHSWjngjIJhf8dKDIF6L8rUBIJYhJsN9AUCWVtIibBFLD9bYGzARaT4Oa5KRKqgxwmwfK0wolJiB61E3H3ZDURpkDUFKg2BXBBC5QU+negxBRApkCZKRApYIHStnCChGJEYRJm2K0fSTAFik0BqymQ+G8EapqELyJCaVejMGptEYb3RsX+UknUBN4RE3srm4URlfWhXJgNDRTeF6CzLOdzszUhCh+ro3EV68UnOC/e1EDhYt5YYLmnanAtXfPZiKWeqsH5zoo+jcA9jp94xvAYEkYoXSqJSfXOnpjYB+en/d5syM0NFH5b489SXkd/D6ncgecqd1wsVkJMJ/BB6piU4134V2QFtkpiEiGUvlGP5Cc+fgqGtLUIw/AF4MzlY3KV4Cl818VmA95ys3h/gJ42vMqb2PWJmXZrQi8wcPXm1B8JQPZExX4YsjWEvqqzbZLYA2d+BgigHxWCAV/Y/TjkZfCqTJ1W8BQOeJnsXI534VLGOaQXgCG7I5I8x3G6R2Wh62x/Z1PLV0MBhQds7hWUV/mtF8i8wjN7TqDbyX4/M7ojx7twLNyUhuGL7NYEFFDC6gWVHcgr8BjUqCOIxtXzXbodOM96fwr3Eghc0gtmEGhfVuBtrH0ChptltyWhQGu4USOosKT2Qh4BSUzAkDFQoTJdvU6BJVZYG9Iu8q56eloBp+9HjeR4F05e6ZyE4ZSaQIEGhFJ6gZWe6k+GAspCw5BNPEqrs/1RcQDOjtdpBQ7pdmC1vj4ZKCYn8D7WoRGY6zjTCwU8oeCYXmAdXfPZUGC7blFDAkqps4Ot4iCcHQ5of2EeLKjS85/6n6HNk6tQvLFZ0/EFzoo+KFAZ5Eb1AlsYx5ChwE7dovpFYUydlV8WP8GZ8q8D+/8c9F+RmS78Mp7Cry/lltgaYDUBF7nO9UOBY5x3RC+w2+ceVgS+AVPPffeh8cMkAAAAAElFTkSuQmCC
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// @grant        unsafeWindow
// @connect      googleapis.com
// @connect      www.googleapis.com
// @connect      oauth2.googleapis.com
// @connect      jumbomail.me
// @connect      *
// @sandbox      JavaScript
// @run-at       document-start
// @noframes
// @downloadURL  https://raw.githubusercontent.com/matennayad/Download-from-YouTube-to-Drive/main/jumbomail-to-drive.user.js
// @updateURL    https://raw.githubusercontent.com/matennayad/Download-from-YouTube-to-Drive/main/jumbomail-to-drive.user.js
// ==/UserScript==

/* פותח על ידי מטען נייד – https://mitmachim.top/user/%D7%9E%D7%98%D7%A2%D7%9F-%D7%A0%D7%99%D7%99%D7%93 */

(function () {
  'use strict';

  const ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAALRlWElmSUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAADAAAAADoAQAAQAAADAAAAAAAAAADYNOUQAAA6dJREFUeJztlU1sDGEYx/cgRVyQOEgkThL1FRKiER+H+lYkvhoSF2KXUlq1X92ZnZ2dbrc778y2TTe6O8VqDyX0IFxcSiKCEC5EiLvdftJWu6vT9pVhZ/eZ0VnkPbAyh9/lfd7D/7fv/9mxFDlsCRLWCDQm4UhHa4IEiykgmAIJU6CokAXmOc/05Qt4wO8Z8YSCKSMcPgaTEAiLKRIst5sj40bhN3rtQ+PXbuF8vLroJ+J+LUeE5V20fdJIoJyjv5gCF00BnFfgYUSSjQR2+tzD/7zA4trKASOB2Q5bsp7nU48ikmxEp9uHSWjngjIJhf8dKDIF6L8rUBIJYhJsN9AUCWVtIibBFLD9bYGzARaT4Oa5KRKqgxwmwfK0wolJiB61E3H3ZDURpkDUFKg2BXBBC5QU+negxBRApkCZKRApYIHStnCChGJEYRJm2K0fSTAFik0BqymQ+G8EapqELyJCaVejMGptEYb3RsX+UknUBN4RE3srm4URlfWhXJgNDRTeF6CzLOdzszUhCh+ro3EV68UnOC/e1EDhYt5YYLmnanAtXfPZiKWeqsH5zoo+jcA9jp94xvAYEkYoXSqJSfXOnpjYB+en/d5syM0NFH5b489SXkd/D6ncgecqd1wsVkJMJ/BB6piU4134V2QFtkpiEiGUvlGP5Cc+fgqGtLUIw/AF4MzlY3KV4Cl818VmA95ys3h/gJ42vMqb2PWJmXZrQi8wcPXm1B8JQPZExX4YsjWEvqqzbZLYA2d+BgigHxWCAV/Y/TjkZfCqTJ1W8BQOeJnsXI534VLGOaQXgCG7I5I8x3G6R2Wh62x/Z1PLV0MBhQds7hWUV/mtF8i8wjN7TqDbyX4/M7ojx7twLNyUhuGL7NYEFFDC6gWVHcgr8BjUqCOIxtXzXbodOM96fwr3Eghc0gtmEGhfVuBtrH0ChptltyWhQGu4USOosKT2Qh4BSUzAkDFQoTJdvU6BJVZYG9Iu8q56eloBp+9HjeR4F05e6ZyE4ZSaQIEGhFJ6gZWe6k+GAspCw5BNPEqrs/1RcQDOjtdpBQ7pdmC1vj4ZKCYn8D7WoRGY6zjTCwU8oeCYXmAdXfPZUGC7blFDAkqps4Ot4iCcHQ5of2EeLKjS85/6n6HNk6tQvLFZ0/EFzoo+KFAZ5Eb1AlsYx5ChwE7dovpFYUydlV8WP8GZ8q8D+/8c9F+RmS78Mp7Cry/lltgaYDUBF7nO9UOBY5x3RC+w2+ceVgS+AVPPffeh8cMkAAAAAElFTkSuQmCC';
  const DRIVE = 'https://www.googleapis.com/drive/v3';
  const UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';
  const SCOPE = 'https://www.googleapis.com/auth/drive.file';
  const CHUNK = 8 * 1024 * 1024;
  const PROFILE = 'https://mitmachim.top/user/%D7%9E%D7%98%D7%A2%D7%9F-%D7%A0%D7%99%D7%99%D7%93';

  // ================= אחסון =================
  const S = {
    get: (k, d) => GM_getValue(k, d),
    set: (o) => { for (const [k, v] of Object.entries(o)) GM_setValue(k, v); },
    del: (k) => [].concat(k).forEach((x) => GM_deleteValue(x))
  };
  // תאימות לקוד שנכתב לתוסף: chrome.storage.local
  const CHROME = {
    storage: {
      local: {
        get: async (keys) => { const o = {}; [].concat(keys).forEach((k) => { const v = GM_getValue(k); if (v !== undefined) o[k] = v; }); return o; },
        set: async (o) => S.set(o),
        remove: async (k) => S.del(k)
      }
    },
    runtime: { getURL: () => ICON }
  };

  // ================= בקשות רשת =================
  function gx(opts) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        ...opts,
        onload: (r) => {
          const headers = {};
          (r.responseHeaders || '').split(/\r?\n/).forEach((l) => { const i = l.indexOf(':'); if (i > 0) headers[l.slice(0, i).trim().toLowerCase()] = l.slice(i + 1).trim(); });
          resolve({ status: r.status, ok: r.status >= 200 && r.status < 300, headers, text: r.responseText, response: r.response, finalUrl: r.finalUrl });
        },
        onerror: () => reject(new Error('בעיית רשת. בדקו את החיבור לאינטרנט.')),
        ontimeout: () => reject(new Error('הבקשה לקחה יותר מדי זמן.'))
      });
    });
  }
  const json = (r) => { try { return JSON.parse(r.text || 'null'); } catch (_) { return null; } };
  const errText = (r) => { const j = json(r); return `שגיאה ${r.status}${j?.error?.message ? ': ' + j.error.message : ''}`; };

  // ================= התחברות =================
  class AuthError extends Error { constructor(msg, code) { super(msg); this.code = code; } }
  let memToken = '', memExp = 0;

  function credsReady() {
    const mode = S.get('authMode', 'access');
    if (mode === 'refresh') return !!(S.get('pgClientId') && S.get('pgSecret') && S.get('pgRefresh'));
    return !!S.get('accessToken') && S.get('accessExp', 0) > Date.now();
  }

  async function getToken(force = false) {
    const mode = S.get('authMode', 'access');
    if (mode === 'refresh') {
      if (!force && memToken && memExp > Date.now()) return memToken;
      const id = S.get('pgClientId'), secret = S.get('pgSecret'), refresh = S.get('pgRefresh');
      if (!id || !secret || !refresh) throw new AuthError('צריך להשלים את ההגדרה (Client ID, Client secret ו-Refresh token).', 'NO_CLIENT_ID');
      const r = await gx({
        method: 'POST', url: 'https://oauth2.googleapis.com/token',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: new URLSearchParams({ client_id: id, client_secret: secret, refresh_token: refresh, grant_type: 'refresh_token' }).toString()
      });
      const d = json(r) || {};
      if (!r.ok || !d.access_token) {
        if (d.error === 'invalid_grant') throw new AuthError('ה-Refresh token פג תוקף או בוטל. הוציאו חדש ב-OAuth Playground.', 'NO_CLIENT_ID');
        if (d.error === 'invalid_client') throw new AuthError('ה-Client ID או ה-Client secret שגויים.', 'NO_CLIENT_ID');
        throw new Error(d.error_description || d.error || `שגיאה ${r.status}`);
      }
      memToken = d.access_token;
      memExp = Date.now() + (Number(d.expires_in || 3600) - 120) * 1000;
      return memToken;
    }
    const t = S.get('accessToken'), exp = S.get('accessExp', 0);
    if (!t) throw new AuthError('צריך להתחבר לדרייב בהגדרות.', 'NO_CLIENT_ID');
    if (force || exp <= Date.now()) throw new AuthError('ה-Access token פג תוקף. הוציאו טוקן חדש.', 'TOKEN_EXPIRED');
    return t;
  }

  async function gapi(opts, attempt = 0) {
    const token = await getToken(attempt > 0 && opts._auth);
    const r = await gx({ ...opts, headers: { ...(opts.headers || {}), Authorization: `Bearer ${token}` } });
    if (r.status === 401 && attempt < 1) return gapi({ ...opts, _auth: true }, attempt + 1);
    if (r.status >= 500 && attempt < 3) { await new Promise((ok) => setTimeout(ok, 1500 * (attempt + 1))); return gapi(opts, attempt + 1); }
    return r;
  }

  const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  async function findOrCreateFolder(name) {
    const q = `mimeType='application/vnd.google-apps.folder' and name='${esc(name)}' and trashed=false`;
    const r = await gapi({ method: 'GET', url: `${DRIVE}/files?q=${encodeURIComponent(q)}&fields=files(id,webViewLink)&pageSize=1` });
    if (!r.ok) throw new Error(errText(r));
    const f = json(r)?.files?.[0];
    if (f) return f;
    const c = await gapi({ method: 'POST', url: `${DRIVE}/files?fields=id,webViewLink`, headers: { 'Content-Type': 'application/json' }, data: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder' }) });
    if (!c.ok) throw new Error(errText(c));
    return json(c);
  }

  async function whoAmI() {
    const r = await gapi({ method: 'GET', url: `${DRIVE}/about?fields=user(emailAddress)` });
    if (!r.ok) throw new Error(errText(r));
    return json(r)?.user?.emailAddress || '';
  }

  // ================= פעולות משותפות (שמירת טוקן) =================
  const API = {
    async saveAccessToken(token) {
      const t = (token || '').trim();
      const r = await gx({ method: 'GET', url: `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(t)}` });
      const info = json(r) || {};
      if (!info.expires_in) throw new Error('הטוקן לא תקין או שכבר פג תוקפו.');
      const scopes = (info.scope || '').split(' ');
      if (!scopes.some((x) => x === SCOPE || x === 'https://www.googleapis.com/auth/drive')) throw new Error('לטוקן אין הרשאת דרייב. ודאו ששורת ההרשאות היא ' + SCOPE);
      const accessExp = Date.now() + (Number(info.expires_in) - 60) * 1000;
      S.set({ authMode: 'access', accessToken: t, accessExp });
      return { email: await whoAmI(), accessExp };
    },
    async saveRefreshToken(refresh) {
      if (!S.get('pgClientId') || !S.get('pgSecret')) throw new Error('מלאו קודם Client ID ו-Client secret בהגדרות של הסקריפט (בשיטת ה-Refresh token).');
      const prev = { authMode: S.get('authMode', 'access'), pgRefresh: S.get('pgRefresh', '') };
      S.set({ authMode: 'refresh', pgRefresh: (refresh || '').trim() });
      memToken = ''; memExp = 0;
      try { await getToken(true); return { email: await whoAmI() }; }
      catch (e) { S.set(prev); throw new Error(e.message + ' ייתכן שה-Refresh token הוצא עם Client ID אחר.'); }
    },
    async handle(msg) {
      try {
        if (msg.type === 'saveAccessToken') return { ok: true, ...(await API.saveAccessToken(msg.token)) };
        if (msg.type === 'saveRefreshToken') return { ok: true, ...(await API.saveRefreshToken(msg.refresh)) };
        return { ok: false, error: 'פקודה לא מוכרת' };
      } catch (e) { return { ok: false, code: e.code || '', error: e.message }; }
    }
  };

  const PG_URL = (own) => 'https://developers.google.com/oauthplayground#step1&scopes=' + encodeURIComponent(SCOPE) +
    '&url=https%3A//&content_type=application/json&http_method=GET&useDefaultOauthCred=' + (own ? 'checked' : 'unchecked') +
    '&oauthEndpointSelect=Google&oauthAuthEndpointValue=https%3A//accounts.google.com/o/oauth2/v2/auth&oauthTokenEndpointValue=https%3A//oauth2.googleapis.com/token' +
    '&includeCredentials=unchecked&accessTokenType=bearer&autoRefreshToken=unchecked&accessType=offline&forceAprovalPrompt=checked&response_type=code';

  const ON_PLAYGROUND = location.hostname === 'developers.google.com';

  // ======================================================================
  // ===================== OAuth Playground: עוזר ======================
  // ======================================================================
  function startPlayground() {
  const DEFAULT_CLIENT = '407408718192'; // תחילת ה-Client ID המובנה של ה-Playground
  let autoMode = '';
  CHROME.storage.local.get('pgAuto').then(({ pgAuto }) => { if (pgAuto && pgAuto.until > Date.now()) autoMode = pgAuto.mode; });
  const OWN_CRED_RE = /own OAuth credentials|OAuth משלך|פרטי (ה)?כניסה .*משלך|אישורי .*משלך|השתמש(ו)? ב.*משלך/i;

  const el = (tag, props = {}, ...children) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (v === true) e.setAttribute(k, '');
      else if (v !== false && v != null) e.setAttribute(k, v);
    }
    children.flat().forEach((c) => c != null && e.append(c));
    return e;
  };

  const send = (msg) => API.handle(msg);

  // ============ מניעת המעבר ל-Step 3 ============
  // הטקסטים נבדקים באנגלית וגם בעברית, למקרה שכרום תרגם את הדף
  const STEP_RE = (n) => new RegExp(`(^|\\s)(Step|שלב)\\s*${n}(?![0-9])`, 'i');
  const stepNum = (t) => { const m = t.match(/(^|\s)(Step|שלב)\s*(\d)(?![0-9])/i); return m ? Number(m[3]) : 0; };
  const stepText = (node) => {
    let e = node instanceof Element ? node : node?.parentElement;
    for (let i = 0; e && i < 6; i++, e = e.parentElement) {
      const t = (e.textContent || '').trim();
      if (stepNum(t) && t.length < 90) return t;
    }
    return '';
  };

  const BTN_SEL = 'button, input[type=button], input[type=submit], a, [role=button]';
  const btnText = (b) => (b.textContent || b.value || '').trim();

  function findExchangeButton() {
    for (const id of ['exchangeCode', 'exchangeCodeButton', 'exchange_code']) { const e = document.getElementById(id); if (e) return e; }
    const byText = [...document.querySelectorAll(BTN_SEL)].find((b) => /Exchange authorization code|החלפ[הת]? (את )?קוד|החלף קוד/i.test(btnText(b)));
    if (byText) return byText;
    // לפי המיקום: הכפתור הראשון בתוך התוכן של שלב 2
    const h = findStepHeader(2);
    const box = h && (h.nextElementSibling || h.parentElement?.nextElementSibling);
    return box?.querySelector(BTN_SEL) || null;
  }

  function findAuthorizeButton() {
    for (const id of ['authorizeApisButton', 'authorizeApis', 'authorize-apis']) { const e = document.getElementById(id); if (e) return e; }
    const byText = [...document.querySelectorAll(BTN_SEL)].find((b) => /^Authorize APIs$|הרשא[הת]? ממשק|אישור ממשק|אשר ממשק|ממשקי API/i.test(btnText(b)) && btnText(b).length < 40);
    if (byText) return byText;
    // לפי המיקום: הכפתור שליד שדה ההרשאות
    const scope = findScopeInput();
    for (let p = scope?.parentElement, i = 0; p && i < 3; p = p.parentElement, i++) {
      const b = p.querySelector('button, input[type=button], input[type=submit]');
      if (b) return b;
    }
    return null;
  }

  function findScopeInput() {
    const byId = document.getElementById('scopes');
    if (byId) return byId;
    const inputs = [...document.querySelectorAll('input[type=text], input:not([type])')];
    return inputs.find((i) => /googleapis\.com\/auth/.test(i.value)) ||
      inputs.find((i) => /scope|היקף/i.test((i.placeholder || '') + ' ' + (i.getAttribute('aria-label') || '')));
  }

  function findStepHeader(n) {
    const re = STEP_RE(n);
    const cands = [...document.querySelectorAll('h1, h2, h3, h4, div, span, a, li, td')]
      .filter((e) => { const t = (e.textContent || '').trim(); return re.test(t) && t.length < 90; });
    // האלמנט החיצוני ביותר מבין המתאימים: שם נמצא בדרך כלל מאזין הלחיצה
    return cands.find((e) => !cands.some((o) => o !== e && o.contains(e))) || cands[0];
  }

  // נראה באמת: לא מוסתר, ולא חתוך בתוך אזור מכווץ
  function reallyVisible(e) {
    if (!e) return false;
    const r = e.getBoundingClientRect();
    if (r.height < 2 || r.width < 2) return false;
    for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
      if (cs.overflow !== 'visible' || cs.overflowY !== 'visible') {
        const pr = p.getBoundingClientRect();
        if (pr.height < 4 || r.bottom <= pr.top + 2 || r.top >= pr.bottom - 2) return false;
      }
    }
    return true;
  }

  let guardUntil = 0;
  let guardTimer = null;
  let lastReopen = 0;

  function startGuard(ms = 12000) {
    guardUntil = Date.now() + ms;
    if (guardTimer) return;
    guardTimer = setInterval(() => {
      if (Date.now() > guardUntil) { clearInterval(guardTimer); guardTimer = null; return; }
      if (!tokens.access) return;                       // עדיין אין טוקנים: אין מה לשמור
      if (Date.now() - lastReopen < 900) return;        // ממתינים לסיום אנימציית הפתיחה
      const ex = findExchangeButton();
      if (ex && !reallyVisible(ex)) {
        const h = findStepHeader(2);
        if (h) { lastReopen = Date.now(); h.click(); }
      }
    }, 200);
  }

  // לחיצה של המשתמש על "Exchange": מתחילים לשמור על Step 2 עוד לפני שהתשובה מגיעה
  document.addEventListener('click', (e) => {
    if (!e.isTrusted) return;
    const b = e.target.closest?.('button, input, a');
    if (b && (b === findExchangeButton() || /Exchange authorization code|החלפ/i.test(btnText(b)))) { startGuard(); return; }
    // המשתמש עצמו בחר שלב 1 או שלב 3: מפסיקים להתערב
    const n = stepNum(stepText(e.target));
    if (n === 1 || n === 3) guardUntil = 0;
  }, true);

  // חסימת הלחיצה האוטומטית של ה-Playground על Step 3, בזמן השמירה
  for (const type of ['click', 'mousedown', 'mouseup']) {
    document.addEventListener(type, (e) => {
      if (e.isTrusted || Date.now() > guardUntil) return;
      if (stepNum(stepText(e.target)) === 3) { e.stopImmediatePropagation(); e.preventDefault(); }
    }, true);
  }

  // ============ חלון צף ============
  const CSS = `
    :host { all: initial; }
    * { box-sizing: border-box; }
    .win {
      position: fixed; top: 110px; left: 50%; transform: translateX(-50%); z-index: 2147483647;
      width: min(460px, calc(100vw - 32px));
      background: #fff; color: #1B2A41; border-radius: 14px;
      box-shadow: 0 24px 60px rgba(27,42,65,.35), 0 0 0 1px rgba(27,42,65,.08);
      font: 14px/1.55 "Segoe UI", Arial, sans-serif; direction: rtl; overflow: hidden;
    }
    .win[hidden] { display: none; }
    .head {
      display: flex; align-items: center; gap: 10px; padding: 14px 16px;
      background: #0F7B6C; color: #fff; cursor: move; user-select: none;
    }
    .head img { width: 28px; height: 28px; border-radius: 6px; }
    h3 { margin: 0; font-size: 16px; flex: 1; }
    .x { background: rgba(255,255,255,.15); color: #fff; border: 0; width: 30px; height: 30px; border-radius: 8px; font-size: 18px; line-height: 1; cursor: pointer; }
    .x:hover { background: rgba(255,255,255,.28); }
    .body { padding: 16px; display: grid; gap: 12px; }
    .desc { margin: 0; color: #5B6B80; }
    .token {
      direction: ltr; text-align: left; font: 13px/1.5 Consolas, "Courier New", monospace;
      background: #F5F7FA; border: 1px solid #D5DCE5; border-radius: 8px; padding: 10px 12px;
      max-height: 96px; overflow-y: auto; word-break: break-all; user-select: all; color: #1B2A41;
    }
    .btns { display: flex; gap: 8px; }
    button.b { flex: 1; border-radius: 8px; padding: 11px; font: 600 15px "Segoe UI", Arial, sans-serif; cursor: pointer; }
    .copy { background: #0F7B6C; color: #fff; border: 0; }
    .copy.done { background: #2E7D32; }
    .save { background: #fff; color: #0F7B6C; border: 1.5px solid #0F7B6C; }
    .msg { margin: 0; min-height: 1.4em; font-size: 13px; }
    .msg.ok { color: #2E7D32; } .msg.err { color: #B3261E; }
    :focus-visible { outline: 2px solid #FFD666; outline-offset: 2px; }
  `;

  const host = el('div');
  const root = host.attachShadow({ mode: 'open' });
  root.append(el('style', { text: CSS }));

  const title = el('h3');
  const desc = el('p', { class: 'desc' });
  const tokenView = el('div', { class: 'token' });
  const msg = el('p', { class: 'msg', role: 'status' });
  const copyBtn = el('button', { class: 'b copy', type: 'button', text: 'העתקת הטוקן' });
  const saveBtn = el('button', { class: 'b save', type: 'button', text: 'שמירה בסקריפט' });
  const head = el('div', { class: 'head' },
    el('img', { src: CHROME.runtime.getURL('icons/icon48.png'), alt: '' }),
    title,
    el('button', { class: 'x', type: 'button', 'aria-label': 'סגירה', text: '×', onclick: () => { win.hidden = true; dismissed = current; } })
  );
  const win = el('div', { class: 'win', role: 'dialog', 'aria-label': 'הטוקן מוכן', hidden: true },
    head,
    el('div', { class: 'body' }, desc, tokenView, el('div', { class: 'btns' }, copyBtn, saveBtn), msg)
  );
  root.append(win);
  document.documentElement.append(host);

  // גרירה של החלון בעזרת הכותרת
  head.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    const r = win.getBoundingClientRect();
    const dx = e.clientX - r.left, dy = e.clientY - r.top;
    head.setPointerCapture(e.pointerId);
    const move = (ev) => {
      win.style.transform = 'none';
      win.style.left = Math.max(0, Math.min(innerWidth - r.width, ev.clientX - dx)) + 'px';
      win.style.top = Math.max(0, Math.min(innerHeight - 60, ev.clientY - dy)) + 'px';
    };
    const up = () => { head.removeEventListener('pointermove', move); head.removeEventListener('pointerup', up); };
    head.addEventListener('pointermove', move);
    head.addEventListener('pointerup', up);
  });

  // ============ זיהוי הטוקן ============
  const tokens = { access: '', refresh: '', ownClient: false };
  let kind = 'access';
  let current = '';
  let dismissed = '';

  function readTokens() {
    const text = document.body ? document.body.innerText : '';
    const a = [...text.matchAll(/"access_token"\s*:\s*"([^"\s]+)"/g)].pop();
    const r = [...text.matchAll(/"refresh_token"\s*:\s*"([^"\s]+)"/g)].pop();
    const c = [...text.matchAll(/client_id=([^&\s]+)/g)].pop();
    const vals = [...document.querySelectorAll('input, textarea')].map((i) => (i.value || '').trim());
    const ia = vals.find((v) => /^ya29\.[\w.-]+$/.test(v));
    const ir = vals.find((v) => /^1\/\/[\w.-]+$/.test(v));
    const box = findInput(['useDefaultOauthCred'], OWN_CRED_RE, 'checkbox');
    return {
      access: a ? a[1] : ia || '',
      refresh: r ? r[1] : ir || '',
      ownClient: c ? !decodeURIComponent(c[1]).startsWith(DEFAULT_CLIENT) : (!!box?.checked || autoMode === 'refresh')
    };
  }

  const btnRow = copyBtn.parentElement;
  function showInfo(t, text) {
    title.textContent = t;
    desc.textContent = text;
    tokenView.hidden = true;
    btnRow.hidden = true;
    msg.textContent = '';
    win.hidden = false;
  }

  function show() {
    tokenView.hidden = false;
    btnRow.hidden = false;
    kind = tokens.ownClient && tokens.refresh ? 'refresh' : 'access';
    current = tokens[kind];
    if (kind === 'refresh') {
      title.textContent = 'ה-Refresh token מוכן';
      desc.textContent = 'השתמשתם ב-Client ID משלכם, ולכן זה הטוקן שצריך: הוא קבוע, והסקריפט יחדש איתו את הגישה לבד.';
    } else {
      title.textContent = 'ה-Access token מוכן';
      desc.textContent = 'הטוקן תקף לשעה. אחרי שעה מוציאים חדש באותה דרך.';
    }
    tokenView.textContent = current;
    msg.textContent = '';
    msg.className = 'msg';
    copyBtn.textContent = 'העתקת הטוקן';
    copyBtn.classList.remove('done');
    if (current !== dismissed) win.hidden = false;
  }

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(current);
      copyBtn.textContent = 'הועתק';
      copyBtn.classList.add('done');
      setTimeout(() => { copyBtn.textContent = 'העתקת הטוקן'; copyBtn.classList.remove('done'); }, 2000);
    } catch (_) {
      msg.textContent = 'ההעתקה נכשלה. סמנו את הטוקן והעתיקו ידנית (Ctrl+C).';
      msg.className = 'msg err';
    }
  });

  saveBtn.addEventListener('click', async () => {
    msg.textContent = 'שומר ובודק…';
    msg.className = 'msg';
    const r = kind === 'access'
      ? await send({ type: 'saveAccessToken', token: current })
      : await send({ type: 'saveRefreshToken', refresh: current });
    if (r.ok) {
      msg.textContent = r.email ? `נשמר. הסקריפט מחובר כ-${r.email}.` : 'נשמר. הסקריפט מחובר.';
      msg.className = 'msg ok';
    } else {
      msg.textContent = r.error;
      msg.className = 'msg err';
    }
  });


  // ============ מילוי ולחיצה אוטומטיים ============
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function setValue(input, value) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
  }

  // מוצא שדה לפי מזהה, או לפי הטקסט שלידו
  function findInput(ids, labelRe, type = 'text') {
    for (const id of ids) { const e = document.getElementById(id); if (e) return e; }
    const sel = type === 'checkbox' ? 'input[type=checkbox]' : 'input[type=text], input[type=password], input:not([type])';
    return [...document.querySelectorAll(sel)].find((inp) => {
      for (let p = inp.parentElement, i = 0; p && i < 3; p = p.parentElement, i++) {
        const t = (p.textContent || '').trim();
        if (labelRe.test(t) && t.length < 200) return true;
      }
      return false;
    });
  }

  const findButton = (re) => [...document.querySelectorAll('button, input[type=button], input[type=submit], a')]
    .find((b) => re.test((b.textContent || b.value || '').trim()));

  async function setOwnCreds(useOwn) {
    const box = findInput(['useDefaultOauthCred'], OWN_CRED_RE, 'checkbox');
    if (!box) return false;
    if (box.checked !== useOwn) { box.click(); await sleep(300); }
    return true;
  }

  async function autoFlow() {
    const { pgAuto, pgClientId, pgSecret } = await CHROME.storage.local.get(['pgAuto', 'pgClientId', 'pgSecret']);
    if (!pgAuto || pgAuto.until < Date.now()) return;
    const hasCode = new URLSearchParams(location.search).has('code');

    if (!hasCode && !pgAuto.authorized) {
      await sleep(1200); // ממתינים שה-Playground יטען את ההגדרות מהקישור
      if (pgAuto.mode === 'refresh') {
        const okBox = await setOwnCreds(true);
        const idInput = findInput(['oauthClientId'], /Client ID|מזהה (ה)?לקוח/i);
        const secretInput = findInput(['oauthClientSecret'], /Client secret|סוד (ה)?לקוח|הסוד של הלקוח/i);
        if (!okBox || !idInput || !secretInput || !pgClientId || !pgSecret) {
          showInfo('צריך להשלים ידנית', 'לא הצלחתי למלא לבד את פרטי ה-Client. לחצו על גלגל השיניים, סמנו Use your own OAuth credentials, הדביקו את ה-Client ID וה-Client secret ולחצו Authorize APIs. מכאן הסקריפט ימשיך לבד.');
          await CHROME.storage.local.set({ pgAuto: { ...pgAuto, authorized: true } });
          return;
        }
        setValue(idInput, pgClientId);
        setValue(secretInput, pgSecret);
      } else {
        await setOwnCreds(false);
      }
      const scope = findScopeInput() || findInput(['scopes'], /Input your own scopes|היקפים משלך|הזן את ההיקפים/i);
      if (scope && !scope.value.includes('drive.file')) setValue(scope, 'https://www.googleapis.com/auth/drive.file');
      await sleep(400);
      const auth = findAuthorizeButton();
      if (!auth) {
        showInfo('צריך להשלים ידנית', 'לא מצאתי את הכפתור Authorize APIs. לחצו עליו בעצמכם, ומכאן הסקריפט ימשיך לבד.');
        return;
      }
      await CHROME.storage.local.set({ pgAuto: { ...pgAuto, authorized: true } });
      auth.click();
      return;
    }

    if (hasCode && !pgAuto.exchanged) {
      // אחרי האישור בגוגל: ממתינים שהכפתור יהיה זמין ולוחצים עליו
      for (let i = 0; i < 50; i++) {
        if (tokens.access) return;
        const ex = findExchangeButton();
        if (ex && !ex.disabled && reallyVisible(ex)) {
          await CHROME.storage.local.set({ pgAuto: { ...pgAuto, exchanged: true } });
          startGuard();
          ex.click();
          return;
        }
        if (i === 10) { const h = findStepHeader(2); if (h && !reallyVisible(ex)) h.click(); }
        await sleep(300);
      }
      showInfo('צריך להשלים ידנית', 'לחצו על Exchange authorization code for tokens ב-Step 2, והטוקן יופיע כאן.');
    }
  }

  autoFlow();

  let timer = null;
  new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const t = readTokens();
      if (!t.access || (t.access === tokens.access && t.refresh === tokens.refresh)) return;
      Object.assign(tokens, t);
      show();
      startGuard(8000);
      CHROME.storage.local.remove('pgAuto');
    }, 120);
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  }

  if (ON_PLAYGROUND) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startPlayground);
    else startPlayground();
    return;
  }

  // ======================================================================
  // ======================= ג'מבו מייל: תפיסת הורדות =======================
  // ======================================================================
  const W = (typeof unsafeWindow !== 'undefined' && unsafeWindow) || window;
  const isOn = () => S.get('autoJumbo', true) !== false;
  const pendingStarts = [];   // הורדות שנתפסו לפני שהממשק נבנה
  let startJob = (src) => pendingStarts.push(src);

  // מתחילים לקרוא קובץ blob מיד, לפני שג'מבו מייל ימחק אותו
  function grab(url, name) {
    if (/^blob:/i.test(url)) {
      const p = W.fetch(url).then((r) => r.blob());
      startJob({ kind: 'blob', url, name, blobPromise: p });
    } else {
      startJob({ kind: 'url', url, name });
    }
  }

  function shouldTake(href, hasDownloadAttr) {
    if (!href || !isOn()) return false;
    const isFile = /^blob:/i.test(href) || hasDownloadAttr ||
      (/jumbomail\.(me|co\.il)/i.test(href) && /download|getfile|\/files?\//i.test(href));
    if (!isFile) return false;
    if (!credsReady()) {
      notice(S.get('authMode', 'access') === 'access' && S.get('accessToken')
        ? 'הקובץ ירד למחשב כי ה-Access token פג תוקף. הוציאו טוקן חדש בהגדרות.'
        : 'הקובץ ירד למחשב כי הסקריפט עוד לא מחובר לדרייב. פתחו את ההגדרות בחלונית.');
      return false;
    }
    return true;
  }

  // 1. לחיצה של הקוד של ג'מבו מייל על קישור הורדה
  try {
    const proto = W.HTMLAnchorElement.prototype;
    const origClick = proto.click;
    proto.click = function () {
      try {
        if (shouldTake(this.href, this.hasAttribute('download'))) { grab(this.href, this.getAttribute('download') || ''); return; }
      } catch (_) {}
      return origClick.apply(this, arguments);
    };
  } catch (_) {}

  // 2. פתיחת חלון הורדה
  try {
    const origOpen = W.open;
    W.open = function (url) {
      try {
        const u = url ? new URL(String(url), location.href).href : '';
        if (u && /download/i.test(u) && shouldTake(u, false)) { grab(u, ''); return null; }
      } catch (_) {}
      return origOpen.apply(this, arguments);
    };
  } catch (_) {}

  // 3. לחיצה אמיתית של המשתמש על קישור הורדה בדף
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href]');
    if (!a || e.defaultPrevented) return;
    if (shouldTake(a.href, a.hasAttribute('download'))) {
      e.preventDefault(); e.stopImmediatePropagation();
      grab(a.href, a.getAttribute('download') || '');
    }
  }, true);

  let notice = (t) => { pendingNotice = t; };
  let pendingNotice = '';

  // ======================================================================
  // ============================ ממשק ============================
  // ======================================================================
  function startUI() {
    const el = (tag, props = {}, ...children) => {
      const e = document.createElement(tag);
      for (const [k, v] of Object.entries(props)) {
        if (k === 'class') e.className = v;
        else if (k === 'text') e.textContent = v;
        else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
        else if (v === true) e.setAttribute(k, '');
        else if (v !== false && v != null) e.setAttribute(k, v);
      }
      children.flat().forEach((c) => c != null && e.append(c));
      return e;
    };
    const size = (b) => !b ? '' : b < 1048576 ? `${Math.max(1, Math.round(b / 1024))} KB` : b < 1073741824 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1073741824).toFixed(2)} GB`;
    const norm = (n) => (n || '').toLowerCase().replace(/[\s_]+/g, ' ').trim();
    const pretty = (n) => {
      let x = (n || '').trim();
      for (let i = 0; i < 2 && /%[0-9a-f]{2}/i.test(x); i++) { try { x = decodeURIComponent(x); } catch (_) { break; } }
      return x;
    };

    const TYPES = [
      { re: /^(mp4|mov|avi|mkv|webm|wmv|m4v|3gp)$/, color: '#6D4BC4', bg: '#F0EBFB' },
      { re: /^(jpe?g|png|gif|webp|heic|bmp|svg|tiff?)$/, color: '#0F7B6C', bg: '#E3F2EE' },
      { re: /^(mp3|wav|m4a|aac|ogg|flac|wma)$/, color: '#C2410C', bg: '#FDEEE5' },
      { re: /^(pdf)$/, color: '#B42318', bg: '#FDECEA' },
      { re: /^(docx?|rtf|odt|txt)$/, color: '#2B5CB8', bg: '#E8EFFB' },
      { re: /^(xlsx?|csv|ods)$/, color: '#1F7A3A', bg: '#E6F4EA' },
      { re: /^(pptx?|odp)$/, color: '#C24A12', bg: '#FCEDE4' },
      { re: /^(zip|rar|7z|tar|gz)$/, color: '#8A6D00', bg: '#FBF3D9' }
    ];
    const extOf = (n) => ((n.match(/\.([A-Za-z0-9]{2,5})$/) || [])[1] || '').toLowerCase();
    const typeOf = (n) => TYPES.find((t) => t.re.test(extOf(n))) || { color: '#5B6B80', bg: '#EEF1F5' };

    // ============ עיצוב ============
    const CSS = `
      :host { all: initial; }
      * { box-sizing: border-box; }
      .wrap {
        --ink: #1B2A41; --muted: #66758A; --line: #E4E8EE; --soft: #F5F7FA;
        --accent: #0F7B6C; --accent-2: #0B5F54; --accent-soft: #E3F2EE; --amber: #B35C00; --amber-soft: #FDF1E3;
        --ok: #2E7D32; --err: #B3261E;
        font: 14px/1.5 "Segoe UI", "Assistant", Arial, sans-serif; color: var(--ink); direction: rtl;
      }
      button { font: inherit; }

      .fab {
        position: fixed; bottom: 22px; left: 22px; z-index: 2147483646;
        display: inline-flex; align-items: center; gap: 10px;
        padding: 8px 16px 8px 8px; border: 0; border-radius: 999px; cursor: pointer;
        background: var(--accent); color: #fff; font-weight: 600; font-size: 14px;
        box-shadow: 0 8px 24px rgba(15,123,108,.35);
        transition: transform .15s, box-shadow .15s, background .2s;
      }
      .fab:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(15,123,108,.42); }
      .fab img { width: 30px; height: 30px; border-radius: 50%; background: #fff; padding: 3px; }
      .fab.armed { background: var(--amber); box-shadow: 0 8px 24px rgba(179,92,0,.35); }
      .fab .count { min-width: 22px; height: 22px; padding: 0 6px; border-radius: 11px; background: #fff; color: var(--accent); font-size: 12px; display: inline-grid; place-items: center; }
      .fab .count[hidden] { display: none; }
      .right .fab, .right .panel { left: auto; right: 22px; }

      .panel {
        position: fixed; bottom: 80px; left: 22px; z-index: 2147483647;
        width: min(380px, calc(100vw - 44px)); max-height: min(680px, calc(100vh - 110px));
        display: flex; flex-direction: column; overflow: hidden;
        background: #fff; border-radius: 16px;
        box-shadow: 0 24px 60px rgba(27,42,65,.28), 0 0 0 1px rgba(27,42,65,.06);
        animation: rise .18s ease-out;
      }
      @keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      .panel[hidden] { display: none; }

      .head { display: flex; align-items: center; gap: 10px; padding: 14px 14px 14px 10px; background: var(--accent); color: #fff; }
      .head img { width: 34px; height: 34px; border-radius: 9px; background: rgba(255,255,255,.95); padding: 3px; }
      .titles { flex: 1; min-width: 0; }
      h3 { margin: 0; font-size: 16px; font-weight: 700; }
      .pill { display: inline-block; margin-top: 1px; font-size: 12px; opacity: .92; }
      .pill::before { content: ""; display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #9BE3C9; margin-inline-end: 6px; vertical-align: 1px; }
      .pill.armed::before { background: #FFD666; }
      .pill.busy::before { background: #FFD666; animation: blink 1s infinite; }
      @keyframes blink { 50% { opacity: .3; } }
      .icon { width: 30px; height: 30px; border: 0; border-radius: 8px; background: rgba(255,255,255,.14); color: #fff; font-size: 15px; cursor: pointer; }
      .icon:hover { background: rgba(255,255,255,.26); }

      .scroll { overflow-y: auto; flex: 1; }
      .section { padding: 14px 16px; border-bottom: 1px solid var(--line); }
      .field-label { display: block; font-size: 12px; font-weight: 600; color: var(--muted); margin-bottom: 6px; }
      .folder-input { position: relative; }
      .folder-input input {
        width: 100%; padding: 9px 36px 9px 10px; border: 1px solid var(--line); border-radius: 10px;
        font: 14px "Segoe UI", Arial, sans-serif; color: var(--ink); background: var(--soft);
      }
      .folder-input input:focus { outline: none; border-color: var(--accent); background: #fff; box-shadow: 0 0 0 3px var(--accent-soft); }
      .folder-input .fi { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 15px; }

      .files-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
      .files-head label { display: flex; align-items: center; gap: 8px; font-weight: 600; cursor: pointer; }
      .link { background: none; border: 0; padding: 2px 4px; color: var(--accent); font-weight: 600; font-size: 13px; cursor: pointer; border-radius: 6px; }
      .link:hover { background: var(--accent-soft); }

      ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; grid-template-columns: minmax(0, 1fr); }
      li.row {
        display: grid; grid-template-columns: auto auto minmax(0, 1fr) auto; align-items: center; gap: 10px;
        padding: 9px 10px; border: 1px solid var(--line); border-radius: 12px; background: #fff;
        transition: border-color .15s, background .15s;
      }
      li.row:hover { border-color: #CFD7E1; }
      li.row.sel { border-color: #B9DDD5; background: #FAFDFC; }
      .chip { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; font: 700 10px "Segoe UI", Arial, sans-serif; letter-spacing: .02em; text-transform: uppercase; }
      .info { min-width: 0; }
      .fname { font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; unicode-bidi: plaintext; text-align: right; }
      .sub { font-size: 12px; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .sub.ok { color: var(--ok); } .sub.err { color: var(--err); } .sub.busy { color: var(--accent); } .sub.warn { color: var(--amber); }
      .bar { grid-column: 1 / -1; height: 4px; border-radius: 2px; background: var(--line); overflow: hidden; margin-top: -2px; }
      .bar[hidden] { display: none; }
      .fill { height: 100%; width: 0; background: var(--accent); transition: width .3s; }
      .open { color: var(--accent); text-decoration: none; font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 8px; background: var(--accent-soft); white-space: nowrap; }
      .open:hover { background: #CDE9E1; }

      input[type=checkbox] { appearance: none; width: 18px; height: 18px; margin: 0; border: 1.5px solid #AAB6C4; border-radius: 5px; display: grid; place-items: center; cursor: pointer; background: #fff; }
      input[type=checkbox]:checked { background: var(--accent); border-color: var(--accent); }
      input[type=checkbox]:checked::after { content: ""; width: 9px; height: 5px; border: 2px solid #fff; border-top: 0; border-right: 0; transform: rotate(-45deg) translate(1px, -1px); }
      input[type=checkbox]:disabled { opacity: .35; cursor: default; }

      .empty { text-align: center; padding: 18px 8px; color: var(--muted); font-size: 13px; background: var(--soft); border-radius: 12px; }

      .actions { padding: 14px 16px; display: grid; gap: 8px; }
      .primary {
        width: 100%; padding: 12px; border: 0; border-radius: 12px; cursor: pointer;
        background: var(--accent); color: #fff; font-weight: 700; font-size: 15px;
        transition: background .15s;
      }
      .primary:hover { background: var(--accent-2); }
      .primary:disabled { background: #B8C4CF; cursor: default; }
      .secondary {
        width: 100%; padding: 10px; border-radius: 12px; cursor: pointer;
        background: #fff; color: var(--accent); border: 1.5px solid var(--accent); font-weight: 600; font-size: 14px; text-decoration: none; display: block; text-align: center;
      }
      .secondary:hover { background: var(--accent-soft); }
      .secondary[hidden] { display: none; }
      .manual { background: none; border: 0; color: var(--muted); font-size: 13px; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; padding: 2px; }
      .manual.on { color: var(--amber); font-weight: 600; }
      .note { margin: 0; font-size: 13px; color: var(--muted); }
      .note:empty { display: none; }
      .note.armed { color: var(--amber); background: var(--amber-soft); padding: 8px 10px; border-radius: 10px; }
      .note.error { color: var(--err); background: #FDECEA; padding: 8px 10px; border-radius: 10px; }

      .credit { margin: 0; padding: 10px 16px; font-size: 12px; color: var(--muted); text-align: center; background: var(--soft); border-top: 1px solid var(--line); }
      .credit a { color: var(--accent); font-weight: 600; }
      :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
      @media (prefers-reduced-motion: reduce) { .panel, .fill, .fab { animation: none; transition: none; } }
    `;

    const EXTRA = `
      .toggle-row { display: flex; align-items: center; gap: 12px; cursor: pointer; }
      .toggle-text { flex: 1; }
      .toggle-title { font-weight: 700; font-size: 14px; }
      .toggle-desc { font-size: 12px; color: var(--muted); }
      .switch { position: relative; width: 44px; height: 24px; flex: none; }
      .switch input { position: absolute; inset: 0; opacity: 0; margin: 0; cursor: pointer; width: 100%; height: 100%; }
      .track { position: absolute; inset: 0; border-radius: 12px; background: #C5CED8; transition: background .2s; pointer-events: none; }
      .track::after { content: ""; position: absolute; top: 3px; right: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.25); transition: right .2s; }
      .switch input:checked + .track { background: var(--accent); }
      .switch input:checked + .track::after { right: 23px; }
      .how { margin: 0; font-size: 13px; color: var(--muted); background: var(--soft); border-radius: 10px; padding: 10px 12px; }
      .how b { color: var(--ink); }
      li.row { grid-template-columns: auto minmax(0, 1fr) auto; }
      .list-title { font-weight: 700; font-size: 13px; margin: 0 0 8px; display: flex; justify-content: space-between; align-items: center; }
      button.open { border: 0; cursor: pointer; font: 600 12px "Segoe UI", Arial, sans-serif; }
      .view[hidden] { display: none; }
      .tabs { display: flex; gap: 4px; padding: 10px 16px 0; }
      .tab { flex: 1; padding: 8px; border: 0; border-radius: 10px 10px 0 0; background: var(--soft); color: var(--muted); font-weight: 600; cursor: pointer; }
      .tab.on { background: #fff; color: var(--accent); box-shadow: inset 0 -2px 0 var(--accent); }
      .modes { display: flex; gap: 6px; }
      .mode { flex: 1; border: 1.5px solid var(--line); border-radius: 10px; padding: 8px; text-align: center; cursor: pointer; font-weight: 600; font-size: 13px; background: #fff; }
      .mode.on { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
      .mode small { display: block; font-weight: 400; color: var(--muted); font-size: 11px; }
      .fld { display: grid; gap: 4px; margin-top: 10px; }
      .fld span { font-size: 12px; font-weight: 600; color: var(--muted); }
      .fld input { width: 100%; padding: 8px 10px; border: 1px solid var(--line); border-radius: 8px; font: 13px Consolas, monospace; direction: ltr; background: var(--soft); color: var(--ink); }
      .fld input:focus { outline: none; border-color: var(--accent); background: #fff; }
      .row-btns { display: flex; gap: 8px; margin-top: 10px; }
      .row-btns > * { flex: 1; }
      .small-primary { padding: 9px; border: 0; border-radius: 10px; background: var(--accent); color: #fff; font-weight: 700; cursor: pointer; }
      .small-secondary { padding: 9px; border: 1.5px solid var(--accent); border-radius: 10px; background: #fff; color: var(--accent); font-weight: 700; cursor: pointer; text-align: center; text-decoration: none; font-size: 13px; }
      .st { margin: 8px 0 0; font-size: 12px; min-height: 1.2em; }
      .st.ok { color: var(--ok); } .st.err { color: var(--err); }
      details { margin-top: 10px; font-size: 12px; color: var(--muted); }
      summary { cursor: pointer; color: var(--accent); font-weight: 600; }
      details ol { padding-inline-start: 18px; margin: 6px 0 0; }
      details li { margin-bottom: 4px; }
      code { direction: ltr; unicode-bidi: embed; font: 11px Consolas, monospace; background: var(--soft); padding: 1px 4px; border-radius: 4px; }
    `;

    const host = el('div');
    const root = host.attachShadow({ mode: 'open' });
    root.append(el('style', { text: CSS + EXTRA }));

    // ---------- כפתור צף וכותרת ----------
    const fabLabel = el('span', { text: 'העברה לדרייב' });
    const fabCount = el('span', { class: 'count', hidden: true });
    const fab = el('button', { class: 'fab', type: 'button' }, el('img', { src: ICON, alt: '' }), fabLabel, fabCount);
    const pill = el('span', { class: 'pill' });
    const sideBtn = el('button', { class: 'icon', type: 'button', title: 'העברה לצד השני', text: '⇆' });
    const minBtn = el('button', { class: 'icon', type: 'button', title: 'מזעור', text: '—' });
    const tabMain = el('button', { class: 'tab on', type: 'button', text: 'העברות' });
    const tabSet = el('button', { class: 'tab', type: 'button', text: 'הגדרות' });

    // ---------- מסך ראשי ----------
    const autoBox = el('input', { type: 'checkbox', role: 'switch' });
    const autoDesc = el('div', { class: 'toggle-desc' });
    const folder = el('input', { type: 'text' });
    const how = el('p', { class: 'how' });
    const note = el('p', { class: 'note' });
    const list = el('ul');
    const listTitle = el('span');
    const listBox = el('div', { class: 'section', hidden: true },
      el('div', { class: 'list-title' }, listTitle, el('button', { class: 'link', type: 'button', text: 'ניקוי', onclick: () => clearFinished() })),
      list);
    const folderBtn = el('a', { class: 'secondary', target: '_blank', rel: 'noopener', hidden: true, text: 'פתיחת כל התיקייה בדרייב' });
    const setupBtn = el('button', { class: 'primary', type: 'button', hidden: true, text: 'חיבור לדרייב', onclick: () => showView('set') });
    const viewMain = el('div', { class: 'view' },
      el('div', { class: 'section' },
        el('label', { class: 'toggle-row' },
          el('div', { class: 'toggle-text' }, el('div', { class: 'toggle-title', text: 'הורדות מג\u2019מבו מייל עוברות לדרייב' }), autoDesc),
          el('span', { class: 'switch' }, autoBox, el('span', { class: 'track' })))),
      el('div', { class: 'section' },
        el('label', { class: 'field-label', text: 'שמירה בתיקייה' }),
        el('div', { class: 'folder-input' }, el('span', { class: 'fi', text: '📁' }), folder)),
      listBox,
      el('div', { class: 'actions' }, setupBtn, folderBtn, how, note));

    // ---------- מסך הגדרות ----------
    const modeAccess = el('div', { class: 'mode' }, 'Access token', el('small', { text: 'הכי פשוט, לשעה' }));
    const modeRefresh = el('div', { class: 'mode' }, 'Refresh token', el('small', { text: 'קבוע, עם Client משלכם' }));
    const accIn = el('input', { type: 'password', placeholder: 'ya29....' });
    const accSt = el('p', { class: 'st' });
    const accBox = el('div', {},
      el('div', { class: 'row-btns' }, el('a', { class: 'small-secondary', href: PG_URL(false), target: '_blank', rel: 'noopener', text: 'הוצאת טוקן ב-Playground', onclick: () => S.set({ pgAuto: { mode: 'access', until: Date.now() + 600000 } }) })),
      el('label', { class: 'fld' }, el('span', { text: 'Access token (מתמלא לבד אחרי "שמירה בסקריפט")' }), accIn),
      el('div', { class: 'row-btns' }, el('button', { class: 'small-primary', type: 'button', text: 'שמירה ובדיקה', onclick: saveAccess })),
      accSt,
      el('details', {}, el('summary', { text: 'איך זה עובד?' }), el('ol', {},
        el('li', { text: 'לוחצים "הוצאת טוקן ב-Playground". הסקריפט ממלא שם הכול ולוחץ לבד על הכפתורים.' }),
        el('li', { text: 'מאשרים את הגישה בחלון של גוגל.' }),
        el('li', { text: 'בחלון שמופיע לוחצים "שמירה בסקריפט". זהו.' }),
        el('li', { text: 'הטוקן תקף לשעה. אם הוא פג באמצע העלאה, ההעלאה ממתינה וממשיכה אחרי טוקן חדש.' }))));
    const idIn = el('input', { type: 'text', placeholder: 'xxxxxxxx.apps.googleusercontent.com' });
    const secIn = el('input', { type: 'password' });
    const refIn = el('input', { type: 'password', placeholder: '1//0...' });
    const refSt = el('p', { class: 'st' });
    const refBox = el('div', { hidden: true },
      el('label', { class: 'fld' }, el('span', { text: 'Client ID' }), idIn),
      el('label', { class: 'fld' }, el('span', { text: 'Client secret' }), secIn),
      el('div', { class: 'row-btns' }, el('a', { class: 'small-secondary', href: PG_URL(true), target: '_blank', rel: 'noopener', text: 'הוצאת Refresh token ב-Playground', onclick: (e) => {
        if (!idIn.value.trim() || !secIn.value.trim()) { e.preventDefault(); setSt(refSt, 'מלאו קודם Client ID ו-Client secret.', 'err'); return; }
        S.set({ pgClientId: idIn.value.trim(), pgSecret: secIn.value.trim(), pgAuto: { mode: 'refresh', until: Date.now() + 600000 } });
      } })),
      el('label', { class: 'fld' }, el('span', { text: 'Refresh token (מתמלא לבד אחרי "שמירה בסקריפט")' }), refIn),
      el('div', { class: 'row-btns' }, el('button', { class: 'small-primary', type: 'button', text: 'שמירה ובדיקה', onclick: saveRefresh })),
      refSt,
      el('details', {}, el('summary', { text: 'איך משיגים Client ID ו-Client secret?' }), el('ol', {},
        el('li', {}, 'ב-', el('code', { text: 'console.cloud.google.com' }), ' יוצרים פרויקט ומפעילים את Google Drive API.'),
        el('li', { text: 'ב-Google Auth Platform לוחצים Get started, בוחרים External, ואחר כך Publish app (אחרת הטוקן פג אחרי 7 ימים).' }),
        el('li', {}, 'ב-Clients יוצרים Client מסוג Web application, ומוסיפים כתובת הפניה: ', el('code', { text: 'https://developers.google.com/oauthplayground' })),
        el('li', { text: 'מעתיקים לכאן את ה-Client ID וה-Client secret, ולוחצים על הכפתור של ה-Playground.' }))));
    const viewSet = el('div', { class: 'view', hidden: true },
      el('div', { class: 'section' }, el('div', { class: 'modes' }, modeAccess, modeRefresh), accBox, refBox));

    const panel = el('div', { class: 'panel', role: 'dialog', 'aria-label': 'העברה לדרייב', hidden: true },
      el('div', { class: 'head' }, el('img', { src: ICON, alt: '' }),
        el('div', { class: 'titles' }, el('h3', { text: 'העברה לדרייב' }), pill), sideBtn, minBtn),
      el('div', { class: 'tabs' }, tabMain, tabSet),
      el('div', { class: 'scroll' }, viewMain, viewSet),
      el('p', { class: 'credit' }, 'פותח על ידי מטען נייד. לפרופיל שלי במתמחים טופ לחצו ',
        el('a', { href: PROFILE, target: '_blank', rel: 'noopener', text: 'כאן' })));
    const wrap = el('div', { class: 'wrap' }, fab, panel);
    root.append(wrap);
    document.documentElement.append(host);

    // ---------- התנהגות בסיסית ----------
    wrap.classList.toggle('right', S.get('panelSide') === 'right');
    sideBtn.onclick = () => { const r = !wrap.classList.contains('right'); wrap.classList.toggle('right', r); S.set({ panelSide: r ? 'right' : 'left' }); };
    minBtn.onclick = () => { panel.hidden = true; };
    fab.onclick = () => { panel.hidden = !panel.hidden; if (!panel.hidden) renderState(); };
    function showView(v) {
      viewMain.hidden = v !== 'main'; viewSet.hidden = v !== 'set';
      tabMain.classList.toggle('on', v === 'main'); tabSet.classList.toggle('on', v === 'set');
      panel.hidden = false;
      if (v === 'set') loadSettings();
    }
    tabMain.onclick = () => showView('main');
    tabSet.onclick = () => showView('set');

    const setSt = (n, t, c = '') => { n.textContent = t; n.className = 'st ' + c; };
    function setNote(text, cls = '') { note.textContent = text; note.className = 'note ' + cls; }
    notice = (t) => { panel.hidden = false; setNote(t, 'error'); };
    if (pendingNotice) notice(pendingNotice);

    // ---------- הגדרות ----------
    let mode = S.get('authMode', 'access');
    function setMode(m) {
      mode = m;
      modeAccess.classList.toggle('on', m === 'access'); modeRefresh.classList.toggle('on', m === 'refresh');
      accBox.hidden = m !== 'access'; refBox.hidden = m !== 'refresh';
    }
    modeAccess.onclick = () => setMode('access');
    modeRefresh.onclick = () => setMode('refresh');
    let accTimer = null;
    function loadSettings() {
      setMode(S.get('authMode', 'access'));
      accIn.value = S.get('accessToken', '');
      idIn.value = S.get('pgClientId', ''); secIn.value = S.get('pgSecret', ''); refIn.value = S.get('pgRefresh', '');
      clearInterval(accTimer);
      const tick = () => {
        if (S.get('authMode', 'access') !== 'access' || !S.get('accessToken')) { setSt(accSt, ''); return; }
        const m = Math.floor((S.get('accessExp', 0) - Date.now()) / 60000);
        setSt(accSt, m > 0 ? `מחובר. הטוקן תקף עוד כ־${m} דקות.` : 'הטוקן פג תוקף. הוציאו חדש.', m > 0 ? 'ok' : 'err');
      };
      tick(); accTimer = setInterval(tick, 30000);
      if (S.get('authMode') === 'refresh' && S.get('pgRefresh')) setSt(refSt, 'מחובר בשיטה הזו.', 'ok');
    }
    async function saveAccess() {
      setSt(accSt, 'בודק…');
      const r = await API.handle({ type: 'saveAccessToken', token: accIn.value });
      if (r.ok) { setSt(accSt, `מחובר כ-${r.email}.`, 'ok'); renderState(); } else setSt(accSt, r.error, 'err');
    }
    async function saveRefresh() {
      S.set({ pgClientId: idIn.value.trim(), pgSecret: secIn.value.trim() });
      setSt(refSt, 'בודק…');
      const r = await API.handle({ type: 'saveRefreshToken', refresh: refIn.value });
      if (r.ok) { setSt(refSt, `מחובר כ-${r.email}.`, 'ok'); renderState(); } else setSt(refSt, r.error, 'err');
    }

    // ---------- מצב ----------
    const rows = new Map();
    function updateHeader() {
      const all = [...rows.values()];
      const busy = all.filter((r) => r.state === 'starting' || r.state === 'downloading' || r.state === 'uploading').length;
      const paused = all.filter((r) => r.state === 'paused').length;
      const done = all.filter((r) => r.state === 'done').length;
      const ready = credsReady();
      if (paused && !busy) { pill.className = 'pill armed'; pill.textContent = `${paused} ממתינים לטוקן חדש`; }
      else { pill.className = 'pill' + (busy ? ' busy' : ready && isOn() ? '' : ' armed'); pill.textContent = busy ? `מעביר ${busy} ${busy === 1 ? 'קובץ' : 'קבצים'}` : !ready ? 'צריך להתחבר לדרייב' : isOn() ? 'הורדות עוברות לדרייב' : 'כבוי: הורדות נשמרות במחשב'; }
      fab.classList.toggle('armed', busy > 0 || paused > 0);
      fabLabel.textContent = busy ? 'מעביר לדרייב…' : paused ? 'ממתין לטוקן חדש' : 'העברה לדרייב';
      fabCount.hidden = busy + paused === 0; fabCount.textContent = String(busy + paused);
      listBox.hidden = all.length === 0;
      listTitle.textContent = busy ? `מעביר ${busy}, הושלמו ${done}` : `הועברו ${done} מתוך ${all.length}`;
    }
    function renderState() {
      const ready = credsReady();
      autoBox.checked = isOn();
      setupBtn.hidden = ready;
      autoDesc.textContent = !ready ? 'צריך קודם להתחבר לדרייב (בלשונית "הגדרות").' : isOn() ? 'פועל. הקבצים לא יישמרו במחשב.' : 'כבוי. הורדות נשמרות במחשב כרגיל.';
      how.hidden = !(ready && isOn());
      how.textContent = '';
      how.append('לוחצים על ', el('b', { text: 'Download' }), ' של ג\u2019מבו מייל כרגיל, והקבצים עוברים לתיקייה בדרייב.');
      folder.value = S.get('folderName', "קבצים מג'מבו מייל");
      updateHeader();
    }
    autoBox.onchange = () => { S.set({ autoJumbo: autoBox.checked }); renderState(); };
    let ft = null;
    folder.oninput = () => { clearTimeout(ft); ft = setTimeout(() => S.set({ folderName: folder.value.trim() || "קבצים מג'מבו מייל" }), 400); };
    for (const k of ['accessToken', 'accessExp', 'pgRefresh', 'authMode']) {
      GM_addValueChangeListener(k, () => { renderState(); if (!viewSet.hidden) loadSettings(); });
    }

    // ---------- שורות העברה ----------
    function makeRow(name) {
      const chip = el('div', { class: 'chip' });
      const nameEl = el('div', { class: 'fname' });
      const sub = el('div', { class: 'sub' });
      const slot = el('span');
      const fill = el('div', { class: 'fill' });
      const bar = el('div', { class: 'bar', hidden: true }, fill);
      const li = el('li', { class: 'row' }, chip, el('div', { class: 'info' }, nameEl, sub), slot, bar);
      list.prepend(li);
      const r = { li, chip, nameEl, sub, slot, bar, fill, state: '' };
      setName(r, name);
      return r;
    }
    function setName(r, name) {
      const n = pretty(name) || 'קובץ';
      r.nameEl.textContent = n; r.nameEl.title = n;
      const t = typeOf(n);
      r.chip.textContent = (extOf(n) || 'קובץ').slice(0, 4);
      r.chip.style.color = t.color; r.chip.style.background = t.bg;
    }
    function show(r, state, text, cls, pct) {
      r.state = state;
      r.sub.textContent = text; r.sub.className = 'sub ' + (cls || '');
      r.bar.hidden = pct == null;
      if (pct != null) { r.fill.style.width = Math.max(2, pct) + '%'; r.fill.style.background = state === 'paused' ? 'var(--amber)' : ''; }
      updateHeader();
    }
    function clearFinished() {
      for (const [id, r] of rows) if (r.state === 'done' || r.state === 'failed') { r.li.remove(); rows.delete(id); }
      updateHeader();
    }

    // ממתינים עד שיישמר טוקן חדש
    function waitForNewToken() {
      return new Promise((resolve) => {
        const ids = [];
        const done = () => { ids.forEach((i) => { try { GM_removeValueChangeListener?.(i); } catch (_) {} }); setTimeout(resolve, 400); };
        for (const k of ['accessExp', 'pgRefresh']) ids.push(GM_addValueChangeListener(k, () => { if (credsReady()) done(); }));
      });
    }

    const nameFromHeaders = (h) => {
      const cd = h['content-disposition'] || '';
      const star = cd.match(/filename\*\s*=\s*(?:UTF-8|utf-8)''([^;]+)/);
      if (star) { try { return decodeURIComponent(star[1].trim().replace(/^"|"$/g, '')); } catch (_) {} }
      const plain = cd.match(/filename\s*=\s*"?([^";]+)"?/);
      if (plain) { try { return decodeURIComponent(escape(plain[1].trim())); } catch (_) { return plain[1].trim(); } }
      return '';
    };
    const nameFromUrl = (u) => { try { return decodeURIComponent(new URL(u).pathname.split('/').filter(Boolean).pop() || ''); } catch (_) { return ''; } };

    let jobSeq = 0;
    async function runJob(src) {
      const id = ++jobSeq;
      const r = makeRow(src.name || nameFromUrl(src.url));
      rows.set(id, r);
      panel.hidden = false;
      if (viewMain.hidden) showView('main');
      show(r, 'starting', 'מתחיל…', 'busy', 2);

      // 1. קבלת הקובץ מג'מבו מייל
      let blob, name = src.name;
      try {
        if (src.kind === 'blob') {
          blob = await src.blobPromise;
        } else {
          const res = await new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
              method: 'GET', url: src.url, responseType: 'blob', anonymous: false,
              onprogress: (e) => { if (e.lengthComputable) show(r, 'downloading', `מקבל מג\u2019מבו מייל ${Math.round(e.loaded / e.total * 100)}%, ${size(e.loaded)} מתוך ${size(e.total)}`, 'busy', e.loaded / e.total * 40); },
              onload: resolve,
              onerror: () => reject(new Error('ההורדה מג\u2019מבו מייל נכשלה.'))
            });
          });
          if (res.status < 200 || res.status >= 300) throw new Error(`ההורדה מג\u2019מבו מייל נכשלה (${res.status})`);
          const h = {};
          (res.responseHeaders || '').split(/\r?\n/).forEach((l) => { const i = l.indexOf(':'); if (i > 0) h[l.slice(0, i).trim().toLowerCase()] = l.slice(i + 1).trim(); });
          blob = res.response;
          name = nameFromHeaders(h) || name || nameFromUrl(res.finalUrl || src.url);
        }
      } catch (e) {
        show(r, 'failed', /blob/i.test(String(e)) || src.kind === 'blob' ? 'ג\u2019מבו מייל מחק את הקובץ הזמני לפני שהספקתי להעביר אותו. נסו שוב.' : e.message, 'err');
        return;
      }
      name = pretty(name) || 'קובץ מג\u2019מבו מייל';
      setName(r, name);
      const total = blob.size;
      const mime = (blob.type || 'application/octet-stream').split(';')[0];

      // 2. העלאה לדרייב בחלקים, עם המשך אחרי טוקן חדש
      let session = '', result = null, folderInfo = null;
      for (;;) {
        try {
          if (!session) {
            folderInfo = await findOrCreateFolder(S.get('folderName', "קבצים מג'מבו מייל"));
            if (folderInfo.webViewLink) { folderBtn.href = folderInfo.webViewLink; folderBtn.hidden = false; }
            const init = await gapi({
              method: 'POST', url: `${UPLOAD}?uploadType=resumable&fields=id,webViewLink`,
              headers: { 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': mime, 'X-Upload-Content-Length': String(total) },
              data: JSON.stringify({ name, mimeType: mime, parents: [folderInfo.id] })
            });
            if (!init.ok) throw new Error(errText(init));
            session = init.headers.location;
            if (!session) throw new Error('דרייב לא החזיר כתובת העלאה');
          }
          // כמה כבר התקבל בדרייב
          const st = await gapi({ method: 'PUT', url: session, headers: { 'Content-Range': `bytes */${total}` } });
          if (st.ok) { result = json(st); break; }
          if (st.status !== 308) throw new Error(errText(st));
          let offset = st.headers.range ? Number(st.headers.range.split('-')[1]) + 1 : 0;
          while (offset < total || total === 0) {
            const end = Math.min(offset + CHUNK, total);
            const pct = total ? offset / total : 1;
            show(r, 'uploading', `מעלה לדרייב ${Math.round(pct * 100)}%, ${size(offset)} מתוך ${size(total)}`, 'busy', 40 + pct * 60);
            const body = await blob.slice(offset, end).arrayBuffer();
            const res = await gapi({ method: 'PUT', url: session, headers: { 'Content-Range': total ? `bytes ${offset}-${end - 1}/${total}` : 'bytes */0' }, data: body, binary: true });
            if (res.status === 308) { offset = end; continue; }
            if (!res.ok) throw new Error(errText(res));
            result = json(res);
            offset = end;
            break;
          }
          break;
        } catch (e) {
          if (e.code === 'TOKEN_EXPIRED' && session) {
            const pct = r.fill.style.width ? parseFloat(r.fill.style.width) : 40;
            show(r, 'paused', 'נעצר. ימשיך אחרי טוקן חדש', 'warn', pct);
            r.slot.textContent = '';
            r.slot.append(el('button', { class: 'open', type: 'button', text: 'טוקן חדש', onclick: () => showView('set') }));
            await waitForNewToken();
            r.slot.textContent = '';
            continue;
          }
          show(r, 'failed', e.code === 'TOKEN_EXPIRED' || e.code === 'NO_CLIENT_ID' ? e.message : e.message, 'err');
          return;
        }
      }
      show(r, 'done', `הועבר לדרייב, ${size(total)}`, 'ok');
      r.slot.textContent = '';
      const link = result?.webViewLink || folderInfo?.webViewLink;
      if (link) r.slot.append(el('a', { class: 'open', href: link, target: '_blank', rel: 'noopener', text: 'פתיחה' }));
    }

    startJob = (src) => { runJob(src); };
    pendingStarts.splice(0).forEach((s) => runJob(s));
    renderState();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startUI);
  else startUI();
})();
