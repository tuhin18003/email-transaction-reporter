# 📧 Gmail Amount Extraction (Node.js + IMAP + Express)

This Node.js application connects to your Gmail account using IMAP, reads emails from a specific sender, extracts monetary amounts, calculates total income, and displays it in a simple web interface.

---

## ✨ Features

- 🔐 Connects securely to Gmail via IMAP.
- 📬 Reads emails **from a specific sender** (e.g., `no-reply@xoom.com`).
- 🧠 Filters emails with subject lines like:
  - `is complete`
  - `is now complete`
  - `complete`
- 💰 Extracts BDT amounts from patterns:
  - `Amount received: 12,345.67 BDT`
  - `Recipient receives: 42,000.00 BDT`
- 📅 Calculates:
  - Total amount
  - Start and end dates
  - Duration in years
- 🌐 Displays everything in an HTML table on `http://localhost:3000`

---

## 🛠 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/gmail-amount-extraction.git
cd gmail-amount-extraction
```

### 2. Install dependencies

```bash
npm install
```

### 3. Update credentials

Open `server.js` and edit this block:

```js
const imapConfig = {
  user: 'your.email@gmail.com',
  password: 'your_app_password', // See below to generate
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};
```

---

## 🔐 Generate a Gmail App Password

### Step 1: Enable 2-Step Verification
1. Go to: https://myaccount.google.com/security
2. Under "Signing in to Google", click 2-Step Verification and complete the setup.

### Step 2: Generate App Password (Option will appear after Step 1)
1. After enabling 2FA, go to: https://myaccount.google.com/apppasswords
2. Select "Mail" as the app and "Other" or "PHPMailer" as the device.
3. It will give you a 16-digit password.
4. Use it in place of your Gmail password in `server.js`

---

## ▶️ Run the Project

```bash
npm start
```

Then open your browser and go to:

```
http://localhost:3000
```

---

## 📊 Sample Output in Browser

| # | Date                | Subject                     | Label Matched      | Amount (BDT) |
|---|---------------------|------------------------------|---------------------|--------------|
| 1 | 2023-05-12 10:30 AM | Your transaction is complete | Amount received     | 14,304.88    |
| 2 | 2024-01-20 08:10 AM | Transaction is now complete  | Recipient receives  | 42,000.00    |
|   | **Total Amount:**   |                              |                     | **56,304.88**|
|   | **From Date:**      |                              |                     | 12/05/2023   |
|   | **To Date:**        |                              |                     | 20/01/2024   |
|   | **Total Years:**    |                              |                     | 0.69 year(s) |



## 📄 License

MIT License