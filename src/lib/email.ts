// Email notification service
// In production, use services like SendGrid, AWS SES, Resend, or Nodemailer

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Email templates
export const emailTemplates = {
  welcome: (name: string): EmailTemplate => ({
    subject: 'Welcome to GroomConnect!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Welcome to GroomConnect!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for joining GroomConnect, the premier grooming marketplace.</p>
        <p>With GroomConnect, you can:</p>
        <ul>
          <li>Discover top-rated grooming services near you</li>
          <li>Book appointments with skilled professionals</li>
          <li>Read and write reviews</li>
          <li>Enjoy secure payments</li>
        </ul>
        <p>Get started by exploring businesses in your area!</p>
        <p>Best regards,<br>The GroomConnect Team</p>
      </div>
    `,
    text: `Welcome to GroomConnect! Hi ${name}, Thank you for joining GroomConnect, the premier grooming marketplace.`,
  }),

  bookingConfirmation: (data: {
    customerName: string;
    businessName: string;
    serviceName: string;
    date: string;
    time: string;
    amount: number;
    currency: string;
  }): EmailTemplate => ({
    subject: 'Booking Confirmed - GroomConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Booking Confirmed!</h1>
        <p>Hi ${data.customerName},</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Business:</strong> ${data.businessName}</p>
          <p><strong>Service:</strong> ${data.serviceName}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.time}</p>
          <p><strong>Amount:</strong> ${data.currency} ${data.amount}</p>
        </div>
        <p>Please arrive 5 minutes before your appointment.</p>
        <p>Need to cancel? You can do so from your dashboard up to 24 hours before your appointment.</p>
        <p>Best regards,<br>The GroomConnect Team</p>
      </div>
    `,
    text: `Booking Confirmed! Business: ${data.businessName}, Service: ${data.serviceName}, Date: ${data.date}, Time: ${data.time}`,
  }),

  bookingReminder: (data: {
    customerName: string;
    businessName: string;
    serviceName: string;
    date: string;
    time: string;
  }): EmailTemplate => ({
    subject: 'Appointment Reminder - Tomorrow',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Appointment Reminder</h1>
        <p>Hi ${data.customerName},</p>
        <p>This is a friendly reminder about your appointment tomorrow:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Business:</strong> ${data.businessName}</p>
          <p><strong>Service:</strong> ${data.serviceName}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.time}</p>
        </div>
        <p>See you soon!</p>
        <p>Best regards,<br>The GroomConnect Team</p>
      </div>
    `,
    text: `Appointment Reminder: ${data.businessName} on ${data.date} at ${data.time}`,
  }),

  paymentReceipt: (data: {
    customerName: string;
    businessName: string;
    serviceName: string;
    amount: number;
    currency: string;
    transactionId: string;
    date: string;
  }): EmailTemplate => ({
    subject: 'Payment Receipt - GroomConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Payment Receipt</h1>
        <p>Hi ${data.customerName},</p>
        <p>Thank you for your payment. Here's your receipt:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Business:</strong> ${data.businessName}</p>
          <p><strong>Service:</strong> ${data.serviceName}</p>
          <p><strong>Amount:</strong> ${data.currency} ${data.amount}</p>
          <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
          <p><strong>Date:</strong> ${data.date}</p>
        </div>
        <p>Thank you for using GroomConnect!</p>
        <p>Best regards,<br>The GroomConnect Team</p>
      </div>
    `,
    text: `Payment Receipt: ${data.currency} ${data.amount} to ${data.businessName}`,
  }),

  verificationUpdate: (data: {
    ownerName: string;
    businessName: string;
    status: string;
    reason?: string;
  }): EmailTemplate => ({
    subject: `Business Verification Update - ${data.status}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Verification Update</h1>
        <p>Hi ${data.ownerName},</p>
        <p>Your business "${data.businessName}" verification status has been updated.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Status:</strong> ${data.status}</p>
          ${data.reason ? `<p><strong>Notes:</strong> ${data.reason}</p>` : ''}
        </div>
        ${data.status === 'APPROVED' ? '<p>Congratulations! Your business is now visible to customers.</p>' : ''}
        <p>Best regards,<br>The GroomConnect Team</p>
      </div>
    `,
    text: `Verification Update: Your business "${data.businessName}" is now ${data.status}`,
  }),

  resetPassword: (data: { name: string; resetUrl: string }): EmailTemplate => ({
    subject: 'Reset Your Password - GroomConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Reset Your Password</h1>
        <p>Hi ${data.name},</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <a href="${data.resetUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The GroomConnect Team</p>
      </div>
    `,
    text: `Reset your password: ${data.resetUrl}`,
  }),
};

// Send email function (mock implementation)
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // In production, integrate with email service
  console.log('[EMAIL]', {
    to: options.to,
    subject: options.subject,
    preview: options.text?.substring(0, 100),
  });

  // Simulate sending
  if (process.env.NODE_ENV === 'development') {
    console.log('Email sent (development mode)');
    return true;
  }

  // Production implementation example:
  // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     personalizations: [{ to: [{ email: options.to }] }],
  //     from: { email: 'noreply@groomconnect.com' },
  //     subject: options.subject,
  //     content: [
  //       { type: 'text/plain', value: options.text || '' },
  //       { type: 'text/html', value: options.html },
  //     ],
  //   }),
  // });

  return true;
}

// Convenience functions
export async function sendWelcomeEmail(email: string, name: string) {
  const template = emailTemplates.welcome(name);
  return sendEmail({ to: email, ...template });
}

export async function sendBookingConfirmation(email: string, data: Parameters<typeof emailTemplates.bookingConfirmation>[0]) {
  const template = emailTemplates.bookingConfirmation(data);
  return sendEmail({ to: email, ...template });
}

export async function sendBookingReminder(email: string, data: Parameters<typeof emailTemplates.bookingReminder>[0]) {
  const template = emailTemplates.bookingReminder(data);
  return sendEmail({ to: email, ...template });
}

export async function sendPaymentReceipt(email: string, data: Parameters<typeof emailTemplates.paymentReceipt>[0]) {
  const template = emailTemplates.paymentReceipt(data);
  return sendEmail({ to: email, ...template });
}
