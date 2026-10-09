# Teacher Connect app — setup guide

The app is a small website (the "launcher") that teachers install on their phones.
It signs them in with their school Google account and opens your Apps Script modules.
Your Google Site at teacherconnect.gdhaec.edu.mv stays exactly as it is.

## What's in this folder

| File | What it is | Edit it? |
|---|---|---|
| `config.js` | Module links, Google Client ID, quick actions | **Yes, this is the settings file** |
| `index.html`, `app.css`, `app.js` | The app itself | No |
| `manifest.webmanifest` | App name, icon, colours, long-press shortcuts | Only to rename the app |
| `sw.js` | Makes it installable and quick to open | Change `APP_VERSION` after every update |
| `.htaccess` | Forces HTTPS, sets file types | No |
| `icons/`, `splash/` | App icon (logo on navy) and iPhone start screens | No |

---

## Step 1 · Create the subdomain in Plesk

1. Plesk → **Websites & Domains** → **Add Subdomain** → name it `teacherapp` (gives `teacherapp.gdhaec.edu.mv`).
2. Open the new subdomain → **SSL/TLS Certificates** → **Let's Encrypt** → issue a free certificate.
3. **Hosting Settings** → tick **Permanent SEO-safe 301 redirect from HTTP to HTTPS**.

## Step 2 · Upload the files

1. Plesk → the subdomain → **File Manager** → open its root folder.
2. Upload the zip, then **Extract**. The root folder should now contain `index.html` directly
   (not inside another folder).
3. File Manager hides dot-files by default; check `.htaccess` is there.
4. Open https://teacherapp.gdhaec.edu.mv on your phone. You'll see the sign-in screen in **setup mode**.

## Step 3 · Paste the module links into `config.js`

For each live module (Student Attendance, Monitoring and Evaluation, Shine):

1. Open the Apps Script project → **Deploy** → **Manage deployments**.
2. Copy the **Web app URL** (ends in `/exec`).
3. In `config.js`, replace `PASTE_ATTENDANCE_EXEC_URL`, `PASTE_ME_EXEC_URL` and `PASTE_SHINE_EXEC_URL`.

When Student CARE or Exam are ready: paste their URL and delete `soon: true`.

## Step 4 · Turn on Google sign-in (free, about 10 minutes)

1. Go to https://console.cloud.google.com signed in with a **school admin account**.
2. Create a project called **Teacher Connect**.
3. **Google Auth Platform → Branding**: app name *Teacher Connect*, support email, upload `icons/icon-512.png`.
4. **Audience**: choose **Internal**. Only @gdhaec.edu.mv accounts can then sign in.
5. **Clients → Create client** → type **Web application** → under **Authorized JavaScript origins** add
   `https://teacherapp.gdhaec.edu.mv` → **Create**.
6. Copy the **Client ID** into `googleClientId` in `config.js`, upload `config.js` again.

The app also checks the account's domain itself and refuses anything that isn't @gdhaec.edu.mv.
This sign-in only guards the launcher; each module keeps its own domain restriction.

## Step 5 · Teachers install it

**Android (Chrome)**
1. Open https://teacherapp.gdhaec.edu.mv and sign in.
2. Tap **Install** on the blue banner (or Chrome ⋮ → **Add to Home screen → Install**).
3. Long-press the icon for shortcuts: Daily register, Observations & reviews, My Shine.

**iPhone (Safari)**
1. Open https://teacherapp.gdhaec.edu.mv in **Safari**.
2. Tap **Share** → **Add to Home Screen** → **Add**.
3. Open it from the home screen and sign in once.

Tip for teachers: if a module shows "Sorry, unable to open the file", they are signed into
more than one Google account in Chrome. Sign out of the personal one, or make the school
account the default.

---

## Making changes later

1. Edit `config.js` (or any file) and upload it.
2. Open `sw.js`, change `APP_VERSION` (e.g. `1.0.0` → `1.0.1`), upload it.
3. Phones pick up the change the next time the app is opened (sometimes the time after).

No reinstall is ever needed.

## Optional · Make quick links jump straight to a screen

A quick link like "Daily register" opens the module's main page unless you give it its own `url`.
If a module can read a `page` parameter, give the link a url such as `…/exec?page=register`.
In the module's Apps Script, `doGet` would pass it to the page, for example:

```javascript
function doGet(e) {
  var t = HtmlService.createTemplateFromFile('Index');
  t.startPage = (e && e.parameter && e.parameter.page) || '';
  return t.evaluate()
    .setTitle('Student Attendance')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
```

Then in `Index.html`, use `<?= startPage ?>` to open that tab when the page loads.

## Optional · Play Store version (Android, $25 once)

The same site can be wrapped with https://www.pwabuilder.com → Android. Upload the
`assetlinks.json` it gives you to `.well-known/assetlinks.json` in this folder.
Not needed for the Chrome install route above.
