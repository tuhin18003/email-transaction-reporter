const express = require('express');
const Imap = require('imap');
const { simpleParser } = require('mailparser');

const app = express();
const port = 3000;

// IMAP Configuration
const imapConfig = {
  user: 'email@gmail.com',
  password: 'app_password',
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false } // ← add this line
};

// Helper Functions
const openInbox = (imap) => new Promise((resolve, reject) => {
  imap.openBox('INBOX', true, (err, box) => err ? reject(err) : resolve(box));
});

const searchEmails = (imap, criteria) => new Promise((resolve, reject) => {
  imap.search(criteria, (err, results) => err ? reject(err) : resolve(results));
});

const fetchEmails = (imap, results) => new Promise((resolve, reject) => {
  if (!results.length) return resolve([]);

  const messages = [];
  const fetch = imap.fetch(results, { bodies: '' });

  fetch.on('message', msg => {
    msg.on('body', stream => {
      simpleParser(stream, (err, parsed) => {
        if (!err) {
          messages.push({
            subject: parsed.subject,
            body: parsed.text,
            date: parsed.date
          });
        }
      });
    });
  });

  fetch.once('error', reject);
  fetch.once('end', () => resolve(messages));
});

// Server Route
app.get('/', async (req, res) => {
  const imap = new Imap(imapConfig);

  imap.once('ready', async () => {
    try {
      await openInbox(imap);
      const sender = 'no-reply@xoom.com';
      const criteria = [['FROM', sender]];
      const results = await searchEmails(imap, criteria);
      const emails = await fetchEmails(imap, results);
      imap.end();

      const subjectRegex = /\b(is complete|is now complete|complete)\b/i;
      const amountRegex = /(received|receives):\s*([\d,]+\.\d{2})\s*BDT/i;

      let totalAmount = 0;
      let filteredEmails = [];

      emails.forEach(email => {
        if (subjectRegex.test(email.subject)) {
          const amountMatch = email.body.match(amountRegex);
          if (amountMatch && amountMatch[2]) {
            const amount = parseFloat(amountMatch[2].replace(/,/g, ''));
            totalAmount += amount;
            filteredEmails.push({
              subject: email.subject,
              amount: amount.toFixed(2),
              date: email.date,
              matchedLabel: amountMatch[1]
            });
          }
        }
      });

      // Sorting emails by date
      filteredEmails.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Earliest and Latest dates
      const earliestDate = filteredEmails.length ? filteredEmails[0].date : new Date();
      const latestDate = filteredEmails.length ? filteredEmails[filteredEmails.length - 1].date : new Date();
      const totalYears = ((latestDate - earliestDate) / (1000 * 60 * 60 * 24 * 365)).toFixed(2);

      // HTML Output
      let html = `
        <h2>Email Amount Extraction</h2>
        <table border="1" cellpadding="8" cellspacing="0">
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Subject</th>
            <th>Label Matched</th>
            <th>Amount (BDT)</th>
          </tr>`;

      filteredEmails.forEach((email, index) => {
        html += `
          <tr>
            <td>${index + 1}</td>
            <td>${email.date.toLocaleString()}</td>
            <td>${email.subject}</td>
            <td>${email.matchedLabel}</td>
            <td style="text-align:right;">${email.amount}</td>
          </tr>`;
      });

      html += `
          <tr>
            <td colspan="4" style="text-align:right;"><strong>Total Amount:</strong></td>
            <td style="text-align:right;"><strong>${totalAmount.toFixed(2)}</strong></td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right;"><strong>From Date:</strong></td>
            <td colspan="3">${earliestDate.toLocaleDateString()}</td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right;"><strong>To Date:</strong></td>
            <td colspan="3">${latestDate.toLocaleDateString()}</td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:right;"><strong>Total Duration (Years):</strong></td>
            <td colspan="3">${totalYears} year(s)</td>
          </tr>
        </table>`;

      res.send(html);

    } catch (error) {
      console.error('Error fetching emails:', error);
      res.status(500).send('Error fetching emails.');
      imap.end();
    }
  });

  imap.once('error', (err) => {
    console.error('IMAP Error:', err);
    res.status(500).send('IMAP connection error.');
  });

  imap.connect();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
