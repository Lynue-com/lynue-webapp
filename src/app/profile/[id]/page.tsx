import Image from "next/image";
import Link from "next/link";
import { getUserListings, getUserProfile } from "@/features/profile/profile-api";
import { ListingCard } from "@/shared/ui/listing-card";

type ProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;

  const [user, listings] = await Promise.all([
    getUserProfile(id).catch(() => null),
    getUserListings(id).catch(() => []),
  ]);

  if (!user) {
    return <div className="p-10 text-center text-zinc-600">User profile not found.</div>;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full bg-zinc-100">
            {user.profileImage ? <Image src={user.profileImage} alt="User profile" fill className="object-cover" /> : null}
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-zinc-600">{user.profileTitle ?? "Property lister"}</p>
            <p className="text-sm text-zinc-500">
              {user.city ?? ""} {user.state ? `, ${user.state}` : ""}
            </p>
            <Link href={`/messages?userId=${user.id}`} className="mt-3 inline-block text-sm font-semibold text-[var(--brand)] hover:underline">
              Message this lister
            </Link>
          </div>
        </div>
        {user.description ? <p className="mt-4 text-sm leading-6 text-zinc-700">{user.description}</p> : null}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-zinc-900">Listings</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </div>
  );
}
