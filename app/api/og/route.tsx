import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getProfile } from "@/lib/data";

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title");
  const profile = await getProfile();
  const name = profile?.full_name ?? "Portfolio";
  const headline = profile?.headline ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #14141f 0%, #1e1b3a 60%, #312e81 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, color: "#a5b4fc", marginBottom: 16 }}>
          {title ? name : "Portfolio"}
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 950 }}>
          {title ?? name}
        </div>
        {!title && headline && (
          <div style={{ fontSize: 30, color: "#c7d2fe", marginTop: 24, maxWidth: 900 }}>
            {headline}
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
