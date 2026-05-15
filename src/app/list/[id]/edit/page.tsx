import { getListingForEdit } from "@/features/list-manage/api/list-edit-api";
import { EditListingForm } from "@/features/list-manage/components/edit-listing-form";

type EditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: EditPageProps) {
  const { id } = await params;
  const listing = await getListingForEdit(id).catch(() => null);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {listing ? (
        <EditListingForm listing={listing} />
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-zinc-600">
          Listing not found.
        </div>
      )}
    </div>
  );
}
