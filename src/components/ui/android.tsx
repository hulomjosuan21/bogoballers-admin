import type { SVGProps } from "react";

export interface AndroidProps extends SVGProps<SVGSVGElement> {
  src?: string;
  videoSrc?: string;
}

export function Android({ src, videoSrc, className, ...props }: AndroidProps) {
  return (
    <svg
      viewBox="0 0 433 882"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Phone Outer Frame */}
      <rect
        width="433"
        height="882"
        rx="55"
        fill="#E5E5E5"
        className="dark:fill-[#404040]"
      />

      {/* Inner Body */}
      <rect
        x="8"
        y="10"
        width="417"
        height="862"
        rx="50"
        fill="white"
        className="dark:fill-[#262626]"
      />

      {/* Screen Background */}
      <rect
        x="26"
        y="32"
        width="380"
        height="818"
        rx="40"
        fill="#E5E5E5"
        className="dark:fill-[#404040]"
      />

      {/* Screen Content Clipped */}
      <clipPath id="android-screen">
        <rect x="26" y="32" width="380" height="818" rx="40" />
      </clipPath>

      {/* Image Content */}
      {src && (
        <image
          href={src}
          x="26"
          y="32"
          width="380"
          height="818"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#android-screen)"
        />
      )}

      {/* Video Content */}
      {videoSrc && (
        <foreignObject
          x="26"
          y="32"
          width="380"
          height="818"
          clipPath="url(#android-screen)"
        >
          <video
            className="w-full h-full object-cover"
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
          />
        </foreignObject>
      )}

      <circle
        cx="216.5"
        cy="20"
        r="7"
        fill="white"
        className="dark:fill-[#262626]"
      />
      <circle
        cx="216.5"
        cy="20"
        r="3.5"
        fill="#C4C4C4"
        className="dark:fill-[#404040]"
      />
    </svg>
  );
}
