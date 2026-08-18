// src/app/api/payment/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { planName, price, orderId } = await request.json();

    // SERVER KEY (Dapatkan dari Dashboard Midtrans -> Settings -> Access Keys)
    // Sebaiknya taruh di file .env dengan nama MIDTRANS_SERVER_KEY
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-KODE_RAHASIA_KAMU"; 
    
    // Midtrans membutuhkan Server Key di-encode base64
    const encodedSecret = Buffer.from(serverKey + ":").toString("base64");

    // Payload standar untuk Midtrans Snap
    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: price,
      },
      item_details: [
        {
          id: "GIZIFY-PLAN",
          price: price,
          quantity: 1,
          name: planName,
        },
      ],
      customer_details: {
        first_name: "Zolla",
        email: "zolla@giziku.app",
        phone: "081234567890",
      },
    };

    // Tembak API Sandbox Midtrans
    const response = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${encodedSecret}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    // Kembalikan token ke Frontend
    return NextResponse.json({ token: data.token });
    
  } catch (error) {
    console.error("Payment Error:", error);
    return NextResponse.json({ error: "Gagal membuat transaksi" }, { status: 500 });
  }
}