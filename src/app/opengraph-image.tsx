import { ImageResponse } from "next/og";

// Social-share preview image (WhatsApp / Twitter / Facebook etc.).
// Text is kept Latin so it renders with Satori's default font; the Marathi
// title/description in <metadata> are rendered by the chat app's own fonts.
export const alt = "विहीर सुरक्षा | Open Well Safety";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f766e 0%, #115e59 100%)",
          color: "#ffffff",
          padding: 60,
        }}
      >
        {/* well-opening ring */}
        <div
          style={{
            display: "flex",
            width: 150,
            height: 150,
            borderRadius: 9999,
            border: "16px solid #5eead4",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 44,
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 9999,
              background: "#5eead4",
            }}
          />
        </div>

        <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -1 }}>
          Open Well Safety
        </div>
        <div
          style={{
            fontSize: 36,
            marginTop: 18,
            color: "#d1fae5",
            textAlign: "center",
          }}
        >
          Report dangerous open wells across Maharashtra
        </div>
        <div style={{ fontSize: 26, marginTop: 30, color: "#99f6e4" }}>
          📷 Photo + 📍 Location · No login · Marathi
        </div>
      </div>
    ),
    { ...size }
  );
}
