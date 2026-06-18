interface MemberCardProps {
  name: string;
  role: string;
  imagePath?: string;
  size?: "default" | "sm";
  focalPoint?: string;
}

export default function MemberCard({
  name,
  role,
  imagePath,
  size = "default",
  focalPoint = "center 29%",
}: MemberCardProps) {
  const imageHeight = size === "sm" ? "h-44" : "h-52";

  return (
    <div className="group bg-[#1c1c1e] border border-white/8 rounded-lg overflow-hidden transition-all duration-300 hover:border-[#38bdf8]/40 hover:shadow-lg hover:shadow-black/40">
      <div
        className={`${imageHeight} w-full relative bg-[#111] overflow-hidden`}
      >
        <img
          src={imagePath}
          alt={name}
          className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
          style={{ objectPosition: focalPoint }}
        />
      </div>

      <div className="px-4 py-3">
        <p className="font-heading font-semibold text-white tracking-wide text-sm uppercase transition-colors duration-300 group-hover:text-[#38bdf8]">
          {name}
        </p>
        {role && (
          <p className="text-[#38bdf8] text-[10px] font-heading tracking-widest uppercase mt-0.5">
            {role}
          </p>
        )}
      </div>
    </div>
  );
}
