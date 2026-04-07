"use client";

import {
  Alert,
  Badge,
  Button,
  Card,
  Chip,
  Dropdown,
  Modal,
  Skeleton,
  Tabs,
  toast,
  useOverlayState,
} from "@heroui/react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  Clock,
  Download,
  Info,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

import { SpecStatusBadge } from "@/components/specs/spec-status-badge";
import { formatListDate, languageLabel } from "@/lib/spec-list-utils";
import { cn } from "@/lib/utils";
import type { SpecDetailRisk, SpecificationDetail } from "@/types/spec-detail.types";

type SpecificationDetailViewProps = {
  detail: SpecificationDetail;
};

function priorityStyles(priority: SpecDetailRisk["priority"]) {
  switch (priority) {
    case "high":
      return {
        chip: "danger" as const,
        label: "High",
        border: "border-l-red-500",
        iconWrap: "bg-red-100 text-red-600",
        Icon: AlertCircle,
      };
    case "medium":
      return {
        chip: "warning" as const,
        label: "Medium",
        border: "border-l-amber-400",
        iconWrap: "bg-amber-100 text-amber-700",
        Icon: Clock,
      };
    case "low":
      return {
        chip: "success" as const,
        label: "Low",
        border: "border-l-green-500",
        iconWrap: "bg-green-100 text-green-700",
        Icon: CheckCircle,
      };
    default: {
      const _exhaustive: never = priority;
      return _exhaustive;
    }
  }
}

function RiskCard({ risk }: Readonly<{ risk: SpecDetailRisk }>) {
  const p = priorityStyles(risk.priority);
  return (
    <Card.Root
      className={cn(
        "border border-zinc-200 bg-white shadow-sm",
        "border-l-4",
        p.border,
      )}
    >
      <Card.Content className="p-5">
        <div className="flex gap-3">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full",
              p.iconWrap,
            )}
            aria-hidden
          >
            <p.Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Chip.Root color={p.chip} size="sm" variant="soft">
                <Chip.Label>{p.label}</Chip.Label>
              </Chip.Root>
              <Chip.Root color="default" size="sm" variant="secondary">
                <Chip.Label>{risk.categoryLabel}</Chip.Label>
              </Chip.Root>
            </div>
            <p className="text-xs text-zinc-500">
              → {risk.relatedSectionName}
            </p>
            <p className="text-sm font-semibold text-zinc-950">{risk.summary}</p>
            <p className="border-l-2 border-zinc-200 pl-3 text-sm italic text-zinc-500">
              &ldquo;{risk.contextQuote}&rdquo;
            </p>
          </div>
        </div>
      </Card.Content>
    </Card.Root>
  );
}

export function SpecificationDetailView({
  detail,
}: Readonly<SpecificationDetailViewProps>) {
  const [status, setStatus] = useState(detail.status);
  const [momOpen, setMomOpen] = useState(false);
  const markReviewedModal = useOverlayState();
  const regenerateModal = useOverlayState();

  const riskCount = detail.risks.length;
  const tabKeys = {
    specification: "specification",
    risks: "risks",
    versions: "versions",
  } as const;

  const isProcessing = status === "PROCESSING";
  const isFailed = status === "FAILED";
  const showFullContent =
    status === "COMPLETED" ||
    status === "REVIEWED" ||
    status === "EXPORTED";
  const showMarkReviewed =
    status !== "REVIEWED" && !isProcessing && !isFailed;

  const confirmMarkReviewed = useCallback(() => {
    setStatus("REVIEWED");
    markReviewedModal.close();
    toast.success("Specification marked as reviewed.");
  }, [markReviewedModal]);

  const confirmRegenerate = useCallback(() => {
    regenerateModal.close();
    toast.info("Regeneration would enqueue a new SQS job (demo).");
  }, [regenerateModal]);

  const onExportPdf = useCallback(() => {
    toast.info("Exporting PDF...");
    globalThis.setTimeout(() => {
      toast.success("PDF exported successfully");
    }, 1000);
  }, []);

  const momBody =
    detail.momPlainText.trim() ||
    "Not available for this specification in the demo.";

  return (
    <div className="min-h-screen">
      <div className="border-b border-zinc-200 bg-white px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/specifications"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to Specifications
          </Link>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
                {detail.title}
              </h1>
              <p className="max-w-3xl text-sm text-zinc-600 sm:text-base">
                {detail.description}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <SpecStatusBadge status={status} />
                <Chip.Root color="default" size="sm" variant="secondary">
                  <Chip.Label>{languageLabel(detail.language)}</Chip.Label>
                </Chip.Root>
                <Chip.Root color="default" size="sm" variant="secondary">
                  <Chip.Label>v{detail.version}</Chip.Label>
                </Chip.Root>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Dropdown.Root>
                <Dropdown.Trigger
                  aria-label="More actions"
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 shadow-sm outline-none transition-colors hover:bg-zinc-50",
                  )}
                >
                  <MoreVertical className="size-4" aria-hidden />
                </Dropdown.Trigger>
                <Dropdown.Popover className="min-w-[220px]">
                  <Dropdown.Menu>
                    {showMarkReviewed ? (
                      <Dropdown.Item
                        textValue="Mark as Reviewed"
                        onAction={() => markReviewedModal.open()}
                      >
                        Mark as Reviewed
                      </Dropdown.Item>
                    ) : null}
                    <Dropdown.Item
                      textValue="Regenerate"
                      onAction={() => regenerateModal.open()}
                    >
                      Regenerate
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown.Root>
              <Button
                variant="primary"
                className="gap-2 bg-blue-600 text-white"
                onPress={onExportPdf}
              >
                <Download className="size-4 shrink-0" aria-hidden />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <Card.Root className="border border-zinc-200 bg-white shadow-sm">
          <Card.Content className="p-4 sm:p-6">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  Template
                </dt>
                <dd className="mt-1 text-sm font-semibold text-zinc-950">
                  {detail.templateLabel}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  Created by
                </dt>
                <dd className="mt-1 text-sm font-semibold text-zinc-950">
                  {detail.createdByName}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  Created date
                </dt>
                <dd className="mt-1 text-sm font-semibold text-zinc-950">
                  {formatListDate(detail.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  Last modified
                </dt>
                <dd className="mt-1 text-sm font-semibold text-zinc-950">
                  {formatListDate(detail.updatedAt)}
                </dd>
              </div>
            </dl>
          </Card.Content>
        </Card.Root>

        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setMomOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 sm:px-5"
          >
            <span>View Original Meeting Notes (MOM)</span>
            <ChevronDown
              className={cn(
                "size-5 shrink-0 text-zinc-500 transition-transform",
                momOpen && "rotate-180",
              )}
              aria-hidden
            />
          </button>
          {momOpen ? (
            <div className="border-t border-zinc-100 px-4 pb-4 sm:px-5">
              <pre className="mt-3 max-h-[200px] overflow-auto whitespace-pre-wrap rounded-lg bg-zinc-50 p-3 font-mono text-xs leading-relaxed text-zinc-800">
                {momBody}
              </pre>
            </div>
          ) : null}
        </div>

        {isProcessing ? (
          <div className="space-y-4">
            <Alert.Root status="accent" className="border border-blue-200">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description className="text-sm text-zinc-700">
                  Your specification is being generated...
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
            <div className="space-y-3">
              <Skeleton.Root className="h-24 w-full rounded-lg" />
              <Skeleton.Root className="h-24 w-full rounded-lg" />
              <Skeleton.Root className="h-24 w-full rounded-lg" />
            </div>
          </div>
        ) : null}

        {isFailed ? (
          <div className="space-y-4">
            <Alert.Root status="danger" className="border border-red-200">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description className="text-sm text-zinc-800">
                  Generation failed. Please try regenerating.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
            <Button
              variant="primary"
              className="bg-blue-600 text-white"
              onPress={() => regenerateModal.open()}
            >
              Regenerate
            </Button>
          </div>
        ) : null}

        {showFullContent ? (
          <Tabs.Root
            defaultSelectedKey={tabKeys.specification}
            className="w-full"
          >
            <Tabs.ListContainer className="-mx-1 border-b border-zinc-200 px-1">
              <Tabs.List className="gap-0.5 pb-px">
                <Tabs.Tab
                  id={tabKeys.specification}
                  className="rounded-t-lg px-4 py-2.5 text-sm font-medium data-selected:bg-zinc-100 data-selected:text-zinc-950"
                >
                  Specification
                </Tabs.Tab>
                <Tabs.Tab
                  id={tabKeys.risks}
                  className="rounded-t-lg px-4 py-2.5 text-sm font-medium data-selected:bg-zinc-100 data-selected:text-zinc-950"
                >
                  <span className="flex items-center gap-2">
                    Ambiguities &amp; Risks
                    {riskCount > 0 ? (
                      <Badge.Root color="danger" size="sm" variant="soft">
                        <Badge.Label>{riskCount}</Badge.Label>
                      </Badge.Root>
                    ) : null}
                  </span>
                </Tabs.Tab>
                <Tabs.Tab
                  id={tabKeys.versions}
                  className="rounded-t-lg px-4 py-2.5 text-sm font-medium data-selected:bg-zinc-100 data-selected:text-zinc-950"
                >
                  Versions
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>

            <Tabs.Panel
              id={tabKeys.specification}
              className="mt-6 outline-none"
            >
              <ul className="space-y-4">
                {detail.sections
                  .slice()
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((section) => (
                    <li key={section.sortOrder}>
                      <Card.Root className="border border-zinc-200 bg-white shadow-sm">
                        <Card.Header className="border-b border-zinc-100 px-5 py-4">
                          <Card.Title className="text-base font-semibold text-zinc-950">
                            {section.sortOrder}. {section.title}
                          </Card.Title>
                        </Card.Header>
                        <Card.Content className="px-5 py-4">
                          {section.body.trim() ? (
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                              {section.body}
                            </p>
                          ) : (
                            <p className="text-sm italic text-zinc-500">
                              Not mentioned in the provided information (MOM)
                            </p>
                          )}
                        </Card.Content>
                      </Card.Root>
                    </li>
                  ))}
              </ul>
            </Tabs.Panel>

            <Tabs.Panel id={tabKeys.risks} className="mt-6 outline-none">
              {riskCount === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white py-14 text-center">
                  <CheckCircle
                    className="size-12 text-green-600"
                    aria-hidden
                  />
                  <p className="mt-3 text-sm font-medium text-zinc-700">
                    No ambiguities or risks detected
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert.Root status="accent" className="border border-blue-200">
                    <Alert.Indicator>
                      <Info className="size-5" aria-hidden />
                    </Alert.Indicator>
                    <Alert.Content>
                      <Alert.Description className="text-sm text-zinc-700">
                        Found {riskCount} potential ambiguities or risks. Please
                        review and clarify.
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                  <ul className="space-y-4">
                    {detail.risks.map((risk) => (
                      <li key={risk.id}>
                        <RiskCard risk={risk} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Tabs.Panel>

            <Tabs.Panel id={tabKeys.versions} className="mt-6 outline-none">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-zinc-950">
                  Version History
                </h2>
                <p className="text-sm text-zinc-500">
                  All versions of this specification
                </p>
              </div>
              <ul className="space-y-3">
                {detail.versions.map((v) => (
                  <li key={v.version}>
                    <Card.Root className="border border-zinc-200 bg-white shadow-sm">
                      <Card.Content className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-zinc-950">
                              Version {v.version}
                            </span>
                            {v.isCurrent ? (
                              <Chip.Root color="accent" size="sm" variant="soft">
                                <Chip.Label>Current</Chip.Label>
                              </Chip.Root>
                            ) : null}
                          </div>
                          <p className="text-sm text-zinc-600">
                            {formatListDate(v.updatedAt)}
                            <span className="text-zinc-400"> · </span>
                            {v.summary}
                          </p>
                        </div>
                        <div className="flex shrink-0 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600"
                            onPress={() =>
                              toast.info(`Open version ${v.version} (demo)`)
                            }
                          >
                            View
                          </Button>
                        </div>
                      </Card.Content>
                    </Card.Root>
                  </li>
                ))}
              </ul>
            </Tabs.Panel>
          </Tabs.Root>
        ) : null}
      </div>

      <Modal.Root state={markReviewedModal}>
        <Modal.Trigger
          aria-hidden
          className="sr-only pointer-events-none"
          tabIndex={-1}
        />
        <Modal.Backdrop isDismissable />
        <Modal.Container placement="center" size="md">
          <Modal.Dialog aria-labelledby="mark-reviewed-title">
            <Modal.Header>
              <Modal.Heading id="mark-reviewed-title">
                Mark as reviewed?
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              Marking as reviewed indicates this spec has been checked — not
              that it is final or approved. Continue?
            </Modal.Body>
            <Modal.Footer className="flex justify-end gap-2">
              <Button
                variant="outline"
                onPress={() => markReviewedModal.close()}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 text-white"
                onPress={confirmMarkReviewed}
              >
                Continue
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Root>

      <Modal.Root state={regenerateModal}>
        <Modal.Trigger
          aria-hidden
          className="sr-only pointer-events-none"
          tabIndex={-1}
        />
        <Modal.Backdrop isDismissable />
        <Modal.Container placement="center" size="md">
          <Modal.Dialog aria-labelledby="regenerate-dialog-title">
            <Modal.Header>
              <Modal.Heading id="regenerate-dialog-title">
                Regenerate specification?
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              This will create a new version. Previous versions remain
              viewable.
            </Modal.Body>
            <Modal.Footer className="flex justify-end gap-2">
              <Button
                variant="outline"
                onPress={() => regenerateModal.close()}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 text-white"
                onPress={confirmRegenerate}
              >
                Confirm
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Root>
    </div>
  );
}
