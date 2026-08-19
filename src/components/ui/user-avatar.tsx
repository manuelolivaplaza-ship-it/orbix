import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function UserAvatar({
  name,
  color = "#a3a3a3",
  size = 36,
  className,
}: {
  name: string;
  color?: string;
  size?: number;
  className?: string;
}) {
  const hex = color.replace("#", "");
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const n = Number.parseInt(full || "111111", 16);
  const lum = (((n >> 16) & 255) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000;
  const light = lum > 160;

  const variant = size <= 22 ? "sm" : size >= 40 ? "lg" : "default";

  return (
    <Avatar
      size={variant}
      className={cn("aspect-square rounded-full", className)}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        maxWidth: size,
        maxHeight: size,
        aspectRatio: "1 / 1",
      }}
    >
      <AvatarFallback
        className={cn("text-[0.34em] font-medium", light ? "text-black" : "text-white")}
        style={{ background: color, fontSize: Math.max(9, size * 0.34) }}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

/** @deprecated use UserAvatar */
export { UserAvatar as Avatar };
