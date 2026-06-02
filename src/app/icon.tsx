import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          borderRadius: 6,
        }}
      >
        <svg width={20} height={20} viewBox="0 0 100 100" fill="none">
          <path
            d="M 15 30 L 45 15 L 95 50 L 45 85 L 15 70 L 40 50 Z"
            fill="#FFB800"
            stroke="#FFB800"
            strokeWidth="8"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
