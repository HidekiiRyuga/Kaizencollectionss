
import { Resend } from "resend";

export type OrderEmailStatus =
  | "received"
  | "confirmed"
  | "shipped"
  | "delivered";

type OrderEmailDetails = {
  orderId: string;
  customerEmail: string;
  customerName: string;
  total?: number;
  courier?: string | null;
  trackingNumber?: string | null;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const templates: Record<
  OrderEmailStatus,
  { subject: (id: string) => string; heading: string; message: string }
> = {
  received: {
    subject: (id) => `We received your order #${id}`,
    heading: "Thank you for your order! 🌸",
    message:
      "We've received your order. Your payment is pending manual verification. We'll email you again when your order is confirmed.",
  },
  confirmed: {
    subject: (id) => `Your order #${id} is confirmed`,
    heading: "Your order is confirmed! 💗",
    message:
      "We've verified your payment and confirmed your order. We'll let you know when it ships.",
  },
  shipped: {
    subject: (id) => `Your order #${id} has shipped`,
    heading: "Your order is on its way! 📦",
    message:
      "Your order has been marked as shipped. Shipment details are included below if available.",
  },
  delivered: {
    subject: (id) => `Your order #${id} has been delivered`,
    heading: "Your order has been delivered! 🌷",
    message:
      "Your order has been marked as delivered. We hope you love your purchase. Thank you for shopping with us!",
  },
};

export async function sendOrderStatusEmail(
  status: OrderEmailStatus,
  order: OrderEmailDetails
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("Order email skipped: RESEND_API_KEY is not configured.");
    return;
  }

  const email = order.customerEmail.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    console.error("Order email skipped: invalid customer email.", order.orderId);
    return;
  }

  const template = templates[status];
  const details: string[] = [
    `<p><strong>Order ID:</strong> ${escapeHtml(order.orderId)}</p>`,
  ];

  if (typeof order.total === "number" && Number.isFinite(order.total)) {
    details.push(
      `<p><strong>Order total:</strong> ₹${order.total.toLocaleString("en-IN")}</p>`
    );
  }

  if (status === "shipped") {
    if (order.courier) {
      details.push(`<p><strong>Courier:</strong> ${escapeHtml(order.courier)}</p>`);
    }

    if (order.trackingNumber) {
      details.push(
        `<p><strong>Tracking / AWB:</strong> ${escapeHtml(order.trackingNumber)}</p>`
      );
    } else {
      details.push(
        "<p>Tracking details will be shared once they're available.</p>"
      );
    }

    if (order.courier?.toLowerCase() === "delhivery") {
      details.push(
        '<p><a href="https://www.delhivery.com/tracking" style="color:#302324">Track with Delhivery</a></p>'
      );
    }
  }

  const resend = new Resend(apiKey);
  const from =
    process.env.RESEND_FROM_EMAIL ??
    "KaizenCollectionss <onboarding@resend.dev>";

  try {
    const { error } = await resend.emails.send({
      from,
      to: [email],
      subject: template.subject(order.orderId),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#302324;line-height:1.7">
          <h1 style="color:#302324;font-size:26px">${template.heading}</h1>
          <p>Hi ${escapeHtml(order.customerName)},</p>
          <p>${template.message}</p>
          <div style="margin:24px 0;padding:16px;border-radius:12px;background:#FCF9F9;border:1px solid #E7DDDD">
            ${details.join("\n")}
          </div>
          <p>Thank you for shopping with us! 💗</p>
          <p>— KaizenCollectionss</p>
        </div>
      `,
    });

    if (error) {
        console.error("Order email failed:", {
            status,
            orderId: order.orderId,
            error,
        });
        } else {
        console.info("Order email accepted by Resend:", {
            status,
            orderId: order.orderId,
            email,
        });
        }
  } catch (error) {
    // Email errors must never undo a successful order or status update.
    console.error("Unexpected order email failure:", status, order.orderId, error);
  }
}
