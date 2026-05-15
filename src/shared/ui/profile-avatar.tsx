import Image from "next/image";

type ProfileAvatarProps = {
  src?: string | null | undefined;
  alt?: string;
  initials?: string;
  className?: string;
};

export function ProfileAvatar({ src, alt = "Profile", initials, className = "" }: ProfileAvatarProps) {
  const base = `relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 ${className}`;

  if (src) {
    return (
      <div className={base}>
        <Image src={src} alt={alt} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div className={base}>
      <span className="text-xs font-bold uppercase text-zinc-600">
        {initials ?? alt.charAt(0)}
      </span>
    </div>
  );
}
