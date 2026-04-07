import Link from "next/link";

import { SpecificationDetailView } from "@/components/specs/specification-detail-view";
import { getSpecificationDetail } from "@/mocks/spec-detail.mock";

type PageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function SpecificationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const detail = getSpecificationDetail(id);

  if (!detail) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-lg rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-zinc-950">
            Specification not found
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            There is no specification with this id in the demo data.
          </p>
          <Link
            href="/specifications"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to specifications
          </Link>
        </div>
      </div>
    );
  }

  return <SpecificationDetailView detail={detail} />;
}
