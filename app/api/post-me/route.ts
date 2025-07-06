import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, message } = await request.json();
    if (!email || !message) {
      return NextResponse.json({ error: 'Missing email or message.' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Resend API key not configured.' }, { status: 500 });
    }

    const toEmail = process.env.POST_ME_RECEIVER_EMAIL || 'your@email.com';
    const subject = 'New message from your portfolio (Post Me)';
    const body = `You received a new message from your portfolio Post Me form:\n\nEmail: ${email}\n\nMessage:\n${message}`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio Post Me <noreply@yourdomain.com>',
        to: [toEmail],
        subject,
        text: body,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json({ error: error.message || 'Failed to send email.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
} 