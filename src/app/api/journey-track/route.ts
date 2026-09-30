import { NextRequest, NextResponse } from 'next/server';

const JT_BASE_URL = process.env.JT_API_URL || 'https://bk-sbi-journey.bankkaro.com/JT/api';

/** Forwards Journey Track events server-to-server (no CORS). Tracking never fails the client. */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const partnerToken = req.headers.get('partner-token') || '';

        await fetch(`${JT_BASE_URL}/push?type=PARTNER_JOURNEY_TRACK`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'partner-token': partnerToken,
            },
            body: JSON.stringify(body),
        }).catch((err) => console.error('[journey-track] push failed:', err));

        return NextResponse.json({ success: 1 });
    } catch {
        return NextResponse.json({ success: 1 });
    }
}
