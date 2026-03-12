"use client";

interface BagPreviewProps {
  width: number;
  height: number;
  gusset: number;
  sealType: string;
  zipper: string;
  tearNotch: string;
  holePunch: string;
  corners: string;
  finish: string;
  substrate: string;
  embellishment: string;
}

export default function BagPreview({
  width,
  height,
  gusset,
  sealType,
  zipper,
  tearNotch,
  holePunch,
  corners,
  finish,
  substrate,
  embellishment,
}: BagPreviewProps) {
  // SVG canvas
  const svgW = 200;
  const svgH = 280;
  const padding = 20;
  const maxBagW = svgW - padding * 2;
  const maxBagH = svgH - padding * 2 - 20; // leave room for label

  // Proportional scaling — normalize so the largest dimension fills available space
  const scaleW = maxBagW / Math.max(width, 1);
  const scaleH = maxBagH / Math.max(height, 1);
  const scale = Math.min(scaleW, scaleH);
  const bagW = Math.max(width * scale, 40);
  const bagH = Math.max(height * scale, 60);
  const gussetH = Math.min(gusset * scale * 0.5, bagH * 0.25);

  // Center the bag in the canvas
  const bagX = (svgW - bagW) / 2;
  const bagY = (svgH - 20 - bagH) / 2; // offset for dimension label at bottom

  const cornerR = corners === "Rounded" ? Math.min(8, bagW * 0.08) : 0;
  const isStandUp = sealType === "Stand Up Pouch";

  // Build bag path
  function buildBagPath(): string {
    const x1 = bagX;
    const x2 = bagX + bagW;
    const y1 = bagY;
    const y2 = bagY + bagH;
    const r = cornerR;

    if (isStandUp) {
      // Stand Up Pouch: sides flare outward at bottom
      const flare = Math.min(gussetH * 0.6, bagW * 0.12);
      const curveStart = y2 - gussetH;

      return [
        `M ${x1 + r} ${y1}`,
        r > 0 ? `Q ${x1} ${y1} ${x1} ${y1 + r}` : `L ${x1} ${y1}`,
        `L ${x1} ${curveStart}`,
        `C ${x1} ${y2 - gussetH * 0.3} ${x1 - flare} ${y2} ${x1 + bagW * 0.15} ${y2}`,
        `L ${x2 - bagW * 0.15} ${y2}`,
        `C ${x2 + flare} ${y2} ${x2} ${y2 - gussetH * 0.3} ${x2} ${curveStart}`,
        r > 0 ? `L ${x2} ${y1 + r} Q ${x2} ${y1} ${x2 - r} ${y1}` : `L ${x2} ${y1}`,
        "Z",
      ].join(" ");
    }

    // Flat bag (3 Side Seal / 2 Side Seal)
    if (r > 0) {
      return [
        `M ${x1 + r} ${y1}`,
        `L ${x2 - r} ${y1} Q ${x2} ${y1} ${x2} ${y1 + r}`,
        `L ${x2} ${y2 - r} Q ${x2} ${y2} ${x2 - r} ${y2}`,
        `L ${x1 + r} ${y2} Q ${x1} ${y2} ${x1} ${y2 - r}`,
        `L ${x1} ${y1 + r} Q ${x1} ${y1} ${x1 + r} ${y1}`,
        "Z",
      ].join(" ");
    }
    return `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2} L ${x1} ${y2} Z`;
  }

  // Substrate fill
  function getSubstrateFillId(): string {
    if (substrate === "Metallic") return "url(#metallic-grad)";
    if (substrate === "White Metallic") return "url(#white-metallic-grad)";
    if (substrate === "Clear") return "url(#clear-grad)";
    return "#e5e7eb"; // High Barrier = neutral gray
  }

  const zipperY = bagY + 14;
  const labelY = svgH - 6;

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-[220px]"
        aria-label={`Bag preview: ${width}" x ${height}" x ${gusset}" ${sealType}`}
      >
        <defs>
          {/* Metallic gradient */}
          <linearGradient id="metallic-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c0c0c0" />
            <stop offset="35%" stopColor="#e8e8e8" />
            <stop offset="50%" stopColor="#d0d0d0" />
            <stop offset="75%" stopColor="#b8b8b8" />
            <stop offset="100%" stopColor="#a8a8a8" />
          </linearGradient>

          {/* White Metallic gradient */}
          <linearGradient id="white-metallic-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f0f0f0" />
            <stop offset="40%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#e8e8e8" />
            <stop offset="100%" stopColor="#f5f5f5" />
          </linearGradient>

          {/* Clear gradient */}
          <linearGradient id="clear-grad" x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#f0f8ff" stopOpacity={0.6} />
            <stop offset="50%" stopColor="#e6f2ff" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#dceeff" stopOpacity={0.5} />
          </linearGradient>

          {/* Gloss highlight */}
          <linearGradient id="gloss-highlight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity={0} />
            <stop offset="40%" stopColor="white" stopOpacity={0.35} />
            <stop offset="50%" stopColor="white" stopOpacity={0.4} />
            <stop offset="60%" stopColor="white" stopOpacity={0.35} />
            <stop offset="100%" stopColor="white" stopOpacity={0} />
          </linearGradient>

          {/* Foil embellishment gradient */}
          <linearGradient id="foil-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d4a843" />
            <stop offset="50%" stopColor="#f5d680" />
            <stop offset="100%" stopColor="#c49b38" />
          </linearGradient>

          {/* Clip path for the bag shape */}
          <clipPath id="bag-clip">
            <path d={buildBagPath()} />
          </clipPath>
        </defs>

        {/* Bag shadow */}
        <path
          d={buildBagPath()}
          fill="#00000010"
          transform="translate(2, 3)"
        />

        {/* Bag body */}
        <path
          d={buildBagPath()}
          fill={getSubstrateFillId()}
          stroke="#9ca3af"
          strokeWidth={1.2}
        />

        {/* Clear substrate: diagonal highlight lines */}
        {substrate === "Clear" && (
          <g clipPath="url(#bag-clip)" opacity={0.3}>
            {[0, 1, 2].map((i) => (
              <line
                key={i}
                x1={bagX + bagW * 0.2 + i * 18}
                y1={bagY}
                x2={bagX + bagW * 0.05 + i * 18}
                y2={bagY + bagH}
                stroke="white"
                strokeWidth={6}
                opacity={0.5}
              />
            ))}
          </g>
        )}

        {/* Gloss finish: diagonal highlight stripe */}
        {finish === "Gloss" && (
          <g clipPath="url(#bag-clip)">
            <rect
              x={bagX + bagW * 0.25}
              y={bagY}
              width={bagW * 0.2}
              height={bagH}
              fill="url(#gloss-highlight)"
              transform={`rotate(-15, ${bagX + bagW * 0.35}, ${bagY + bagH * 0.5})`}
            />
          </g>
        )}

        {/* Soft Touch finish: subtle matte overlay */}
        {finish === "Soft Touch" && (
          <g clipPath="url(#bag-clip)">
            <rect
              x={bagX}
              y={bagY}
              width={bagW}
              height={bagH}
              fill="#f5f5f5"
              opacity={0.15}
            />
          </g>
        )}

        {/* Seal lines for flat bags */}
        {sealType === "3 Side Seal" && (
          <g clipPath="url(#bag-clip)" opacity={0.35}>
            <line x1={bagX + 4} y1={bagY + 4} x2={bagX + 4} y2={bagY + bagH - 4} stroke="#6b7280" strokeWidth={1} strokeDasharray="3 2" />
            <line x1={bagX + bagW - 4} y1={bagY + 4} x2={bagX + bagW - 4} y2={bagY + bagH - 4} stroke="#6b7280" strokeWidth={1} strokeDasharray="3 2" />
            <line x1={bagX + 4} y1={bagY + bagH - 4} x2={bagX + bagW - 4} y2={bagY + bagH - 4} stroke="#6b7280" strokeWidth={1} strokeDasharray="3 2" />
          </g>
        )}
        {sealType === "2 Side Seal" && (
          <g clipPath="url(#bag-clip)" opacity={0.35}>
            <line x1={bagX + 4} y1={bagY + 4} x2={bagX + 4} y2={bagY + bagH - 4} stroke="#6b7280" strokeWidth={1} strokeDasharray="3 2" />
            <line x1={bagX + bagW - 4} y1={bagY + 4} x2={bagX + bagW - 4} y2={bagY + bagH - 4} stroke="#6b7280" strokeWidth={1} strokeDasharray="3 2" />
          </g>
        )}

        {/* Zipper */}
        {zipper !== "None" && (
          <g>
            <line
              x1={bagX + 6}
              y1={zipperY}
              x2={bagX + bagW - 6}
              y2={zipperY}
              stroke="#6b7280"
              strokeWidth={1.5}
              opacity={0.6}
            />
            {zipper === "Child-Resistant" && (
              <line
                x1={bagX + 6}
                y1={zipperY + 4}
                x2={bagX + bagW - 6}
                y2={zipperY + 4}
                stroke="#6b7280"
                strokeWidth={1.5}
                opacity={0.6}
              />
            )}
          </g>
        )}

        {/* Tear notch */}
        {tearNotch === "Standard" && (
          <g opacity={0.6}>
            {/* Left notch */}
            <path
              d={`M ${bagX - 1} ${bagY + 20} L ${bagX + 5} ${bagY + 24} L ${bagX - 1} ${bagY + 28}`}
              fill="none"
              stroke="#6b7280"
              strokeWidth={1.2}
            />
            {/* Right notch */}
            <path
              d={`M ${bagX + bagW + 1} ${bagY + 20} L ${bagX + bagW - 5} ${bagY + 24} L ${bagX + bagW + 1} ${bagY + 28}`}
              fill="none"
              stroke="#6b7280"
              strokeWidth={1.2}
            />
          </g>
        )}

        {/* Hole punch */}
        {holePunch === "Round" && (
          <circle
            cx={bagX + bagW / 2}
            cy={bagY + 8}
            r={3.5}
            fill="white"
            stroke="#9ca3af"
            strokeWidth={0.8}
          />
        )}
        {holePunch === "Euro Slot" && (
          <rect
            x={bagX + bagW / 2 - 4}
            y={bagY + 5}
            width={8}
            height={5}
            rx={2}
            fill="white"
            stroke="#9ca3af"
            strokeWidth={0.8}
          />
        )}

        {/* Embellishment badge */}
        {embellishment === "Foil" && (
          <g>
            <rect
              x={bagX + bagW / 2 - 16}
              y={bagY + bagH * 0.45}
              width={32}
              height={18}
              rx={3}
              fill="url(#foil-grad)"
              opacity={0.7}
            />
            <text
              x={bagX + bagW / 2}
              y={bagY + bagH * 0.45 + 12}
              textAnchor="middle"
              fontSize={7}
              fill="#7c5a1e"
              fontWeight={600}
            >
              FOIL
            </text>
          </g>
        )}
        {embellishment === "Spot UV" && (
          <g>
            <rect
              x={bagX + bagW / 2 - 16}
              y={bagY + bagH * 0.45}
              width={32}
              height={18}
              rx={3}
              fill="white"
              opacity={0.5}
              stroke="#d1d5db"
              strokeWidth={0.5}
            />
            <text
              x={bagX + bagW / 2}
              y={bagY + bagH * 0.45 + 12}
              textAnchor="middle"
              fontSize={6.5}
              fill="#6b7280"
              fontWeight={600}
            >
              SPOT UV
            </text>
          </g>
        )}

        {/* Dimension label */}
        <text
          x={svgW / 2}
          y={labelY}
          textAnchor="middle"
          fontSize={11}
          fill="#6b7280"
          fontFamily="system-ui, sans-serif"
        >
          {width}&quot; x {height}&quot; x {gusset}&quot;
        </text>
      </svg>

      {/* Seal type label below */}
      <p className="text-xs text-gray-40 mt-1">{sealType}</p>
    </div>
  );
}
