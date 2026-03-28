// SMS notification service
// In production, use services like Twilio, AWS SNS, or Africa's Talking

interface SMSOptions {
  to: string;
  message: string;
}

// Send SMS function (mock implementation)
export async function sendSMS(options: SMSOptions): Promise<boolean> {
  // In production, integrate with SMS provider
  console.log('[SMS]', {
    to: options.to,
    message: options.message.substring(0, 50) + '...',
  });

  // Simulate sending
  if (process.env.NODE_ENV === 'development') {
    console.log('SMS sent (development mode)');
    return true;
  }

  // Production implementation example for Twilio:
  // const response = await fetch(
  //   `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
  //   {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
  //       'Content-Type': 'application/x-www-form-urlencoded',
  //     },
  //     body: new URLSearchParams({
  //       To: options.to,
  //       From: process.env.TWILIO_PHONE_NUMBER || '',
  //       Body: options.message,
  //     }),
  //   }
  // );

  // Production implementation for Africa's Talking (for M-Pesa regions):
  // const response = await fetch('https://api.africastalking.com/version1/messaging', {
  //   method: 'POST',
  //   headers: {
  //     'apiKey': process.env.AFRICAS_TALKING_API_KEY || '',
  //     'Content-Type': 'application/x-www-form-urlencoded',
  //   },
  //   body: new URLSearchParams({
  //     username: process.env.AFRICAS_TALKING_USERNAME || '',
  //     to: options.to,
  //     message: options.message,
  //   }),
  // });

  return true;
}

// OTP SMS
export async function sendOTP(phone: string, otp: string) {
  const message = `Your GroomConnect verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;
  return sendSMS({ to: phone, message });
}

// Booking confirmation SMS
export async function sendBookingConfirmationSMS(phone: string, data: {
  businessName: string;
  date: string;
  time: string;
}) {
  const message = `GroomConnect: Your appointment at ${data.businessName} is confirmed for ${data.date} at ${data.time}. Thank you!`;
  return sendSMS({ to: phone, message });
}

// Appointment reminder SMS
export async function sendAppointmentReminderSMS(phone: string, data: {
  businessName: string;
  time: string;
}) {
  const message = `GroomConnect Reminder: You have an appointment at ${data.businessName} tomorrow at ${data.time}. See you soon!`;
  return sendSMS({ to: phone, message });
}

// Booking cancellation SMS
export async function sendBookingCancellationSMS(phone: string, data: {
  businessName: string;
  date: string;
}) {
  const message = `GroomConnect: Your appointment at ${data.businessName} on ${data.date} has been cancelled.`;
  return sendSMS({ to: phone, message });
}

// Payment confirmation SMS
export async function sendPaymentConfirmationSMS(phone: string, data: {
  amount: string;
  businessName: string;
}) {
  const message = `GroomConnect: Payment of ${data.amount} to ${data.businessName} confirmed. Thank you!`;
  return sendSMS({ to: phone, message });
}
