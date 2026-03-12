import { Package } from "lucide-react";
import type { BagConfig } from "@/lib/types/quote";

interface Props {
  config: BagConfig;
  onModify: () => void;
}

function formatDimensions(w: number, h: number, g: number): string {
  if (g > 0) return `${w}" × ${h}" × ${g}"`;
  return `${w}" × ${h}"`;
}

/** Compact bag spec card shown on the results page. */
export function BagConfigSummary({ config, onModify }: Props) {
  const specs: { label: string; value: string }[] = [
    { label: "Size", value: formatDimensions(config.width, config.height, config.gusset) },
    { label: "Seal", value: config.seal_type },
    { label: "Fill", value: `${config.fill_style} Fill` },
    { label: "Substrate", value: config.substrate },
    { label: "Finish", value: config.finish },
  ];

  // Only show non-default / non-"None" extras
  if (config.zipper !== "None") specs.push({ label: "Zipper", value: config.zipper });
  if (config.tear_notch !== "None") specs.push({ label: "Tear Notch", value: config.tear_notch });
  if (config.hole_punch !== "None") specs.push({ label: "Hole Punch", value: config.hole_punch });
  if (config.embellishment !== "None") specs.push({ label: "Embellishment", value: config.embellishment });
  specs.push({ label: "Corners", value: config.corners });

  return (
    <div className="rounded-xl border border-gray-10 bg-gray-05 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-calyx-blue" />
          <h3 className="text-sm font-semibold text-gray-90">Your Bag</h3>
        </div>
        <button
          onClick={onModify}
          className="text-xs text-calyx-blue hover:text-flash-blue font-medium"
        >
          Edit
        </button>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {specs.map(({ label, value }) => (
          <span key={label} className="text-xs text-gray-60">
            <span className="font-medium text-gray-90">{label}:</span> {value}
          </span>
        ))}
      </div>
    </div>
  );
}
