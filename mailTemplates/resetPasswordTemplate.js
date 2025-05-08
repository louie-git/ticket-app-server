export default function generateResetEmail({ username, resetLink, appName = 'Ticketing App', year = new Date().getFullYear() }) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { background-color: #fff; max-width: 600px; margin: 40px auto; padding: 20px; border-radius: 8px; }
          .header h1 { text-align: center; color: #333; }
          .content { color: #555; font-size: 16px; }
          .button {
            display: inline-block; padding: 12px 20px; background-color: #007bff;
            color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;
          }
          .footer { text-align: center; font-size: 12px; color: #aaa; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <p>Hi ${username},</p>
            <p>You requested to reset your password. Click below to continue:</p>
            <p style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </p>
            <p>If you did not request this, you can ignore this email. This link will expire in 15 minutes.</p>
            <p>Thanks,<br/>The ${appName} Team</p>
          </div>
          <div class="footer">&copy; ${year} ${appName}. All rights reserved.</div>
        </div>
      </body>
    </html>
  `;
};