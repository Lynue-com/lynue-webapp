import { EditListingLoader } from "@/features/list-manage/components/edit-listing-form";

type EditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: EditPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <EditListingLoader listingId={id} />
    </div>
  );
}
