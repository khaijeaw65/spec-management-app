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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { MomFilePanel } from "@/components/specs/mom-file-panel";
import { SpecStatusBadge } from "@/components/specs/spec-status-badge";
import { specQueryKeys } from "@/lib/spec-query-keys";
import { formatListDate, languageLabel } from "@/lib/spec-list-utils";
import { cn } from "@/lib/utils";
import { exportSpecPdf, updateSpecStatus } from "@/services/spec.service";
import type { SpecDetailRisk, SpecificationDetail } from "@/types/spec-detail.types";

type SpecificationDetailViewProps = {
  detail: SpecificationDetail;
};

function patchSpecStatusErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const body = err.response?.data as
      | { message?: string | string[] }
      | undefined;
    if (body?.message) {
      return Array.isArray(body.message)
        ? body.message.join(", ")
        : body.message;
    }
  }
  return "Could not update status. Try again.";
}

function priorityStyles(priority: SpecDetailRisk["priority"]) {
  switch (priority) {
    case "high":
      return {
        chip: "danger" as const,
        label: "High",
        border: "border-l-red-500",
        iconWrap:
          "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400",
        Icon: AlertCircle,
      };
    case "medium":
      return {
        chip: "warning" as const,
        label: "Medium",
        border: "border-l-amber-400",
        iconWrap:
          "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
        Icon: Clock,
      };
    case "low":
      return {
        chip: "success" as const,
        label: "Low",
        border: "border-l-green-500",
        iconWrap:
          "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300",
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
        "border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900",
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
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              → {risk.relatedSectionName}
            </p>
            <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              {risk.summary}
            </p>
            <p className="border-l-2 border-zinc-200 pl-3 text-sm italic text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
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
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(detail.status);
  const [exportPending, setExportPending] = useState(false);
  const [momOpen, setMomOpen] = useState(false);
  const markReviewedModal = useOverlayState();
  const regenerateModal = useOverlayState();

  useEffect(() => {
    setStatus(detail.status);
  }, [detail.status]);

  const riskCount = detail.risks.length;
  const tabKeys = {
    specification: "specification",
    risks: "risks",
    versions: "versions",
  } as const;

  const isProcessing = status === "PROCESSING";
  const isFailed = status === "FAILED";
  const showFullContent =
    status === "COMPLETED" || status === "REVIEWED";
  const showMarkReviewed =
    status !== "REVIEWED" && !isProcessing && !isFailed;

  const canExportPdf = status === "COMPLETED" || status === "REVIEWED";

  const markReviewedMutation = useMutation({
    mutationFn: () => updateSpecStatus(detail.id, "REVIEWED"),
    onSuccess: async () => {
      setStatus("REVIEWED");
      markReviewedModal.close();
      toast.success("Specification marked as reviewed.");
      await queryClient.invalidateQueries({ queryKey: ["spec"] });
      await queryClient.invalidateQueries({
        queryKey: specQueryKeys.detail(detail.id, detail.versionId),
      });
    },
    onError: (err) => {
      toast.danger(patchSpecStatusErrorMessage(err));
    },
  });

  const confirmMarkReviewed = useCallback(() => {
    markReviewedMutation.mutate();
  }, [markReviewedMutation]);

  const confirmRegenerate = useCallback(() => {
    regenerateModal.close();
    toast.info("Regeneration would enqueue a new SQS job (demo).");
  }, [regenerateModal]);

  const onExportPdf = useCallback(async () => {
    if (!canExportPdf || exportPending) return;
    setExportPending(true);
    try {
      await exportSpecPdf(detail.versionId);
      toast.success("PDF downloaded.");
      await queryClient.invalidateQueries({
        queryKey: specQueryKeys.detail(detail.id, detail.versionId),
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not export PDF.";
      toast.danger(message);
    } finally {
      setExportPending(false);
    }
  }, [
    canExportPdf,
    detail.id,
    detail.versionId,
    exportPending,
    queryClient,
  ]);

  return (
    <div className="min-h-screen">
      <div className="border-b border-zinc-200 bg-white px-6 py-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/specifications"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to Specifications
          </Link>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl dark:text-zinc-50">
                {detail.title}
              </h1>
              <p className="max-w-3xl text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
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
                    "flex size-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 shadow-sm outline-none transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800",
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
                isDisabled={!canExportPdf || exportPending}
                onPress={() => {
                  void onExportPdf();
                }}
              >
                <Download className="size-4 shrink-0" aria-hidden />
                {exportPending ? "Exporting…" : "Export PDF"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <Card.Root className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <Card.Content className="p-4 sm:p-6">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Template
                </dt>
                <dd className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  {detail.templateLabel}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Created by
                </dt>
                <dd className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  {detail.createdByName}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Created date
                </dt>
                <dd className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  {formatListDate(detail.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Last modified
                </dt>
                <dd className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  {formatListDate(detail.updatedAt)}
                </dd>
              </div>
            </dl>
          </Card.Content>
        </Card.Root>

        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => setMomOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 sm:px-5 dark:text-zinc-100 dark:hover:bg-zinc-800/60"
          >
            <span>View Original Meeting Notes (MOM)</span>
            <ChevronDown
              className={cn(
                "size-5 shrink-0 text-zinc-500 transition-transform dark:text-zinc-400",
                momOpen && "rotate-180",
              )}
              aria-hidden
            />
          </button>
          {momOpen ? (
            <div className="border-t border-zinc-100 px-4 pb-4 sm:px-5 dark:border-zinc-800">
              {detail.momFile ? (
                <MomFilePanel mom={detail.momFile} className="mt-3" />
              ) : (
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                  No original meeting notes file is available for this version (nothing
                  was uploaded or the file is not ready yet).
                </p>
              )}
            </div>
          ) : null}
        </div>

        {isProcessing ? (
          <div className="space-y-4">
            <Alert.Root status="accent" className="border border-blue-200">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description className="text-sm text-zinc-700 dark:text-zinc-300">
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
                <Alert.Description className="text-sm text-zinc-800 dark:text-zinc-200">
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
            <Tabs.ListContainer className="-mx-1 border-b border-zinc-200 px-1 dark:border-zinc-800">
              <Tabs.List className="gap-0.5 pb-px">
                <Tabs.Tab
                  id={tabKeys.specification}
                  className="rounded-t-lg px-4 py-2.5 text-sm font-medium text-zinc-600 data-selected:bg-zinc-100 data-selected:text-zinc-950 dark:text-zinc-400 dark:data-selected:bg-zinc-800 dark:data-selected:text-zinc-50"
                >
                  Specification
                </Tabs.Tab>
                <Tabs.Tab
                  id={tabKeys.risks}
                  className="rounded-t-lg px-4 py-2.5 text-sm font-medium text-zinc-600 data-selected:bg-zinc-100 data-selected:text-zinc-950 dark:text-zinc-400 dark:data-selected:bg-zinc-800 dark:data-selected:text-zinc-50"
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
                  className="rounded-t-lg px-4 py-2.5 text-sm font-medium text-zinc-600 data-selected:bg-zinc-100 data-selected:text-zinc-950 dark:text-zinc-400 dark:data-selected:bg-zinc-800 dark:data-selected:text-zinc-50"
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
                      <Card.Root className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                        <Card.Header className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                          <Card.Title className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
                            {section.sortOrder}. {section.title}
                          </Card.Title>
                        </Card.Header>
                        <Card.Content className="px-5 py-4">
                          {section.body.trim() ? (
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                              {section.body}
                            </p>
                          ) : (
                            <p className="text-sm italic text-zinc-500 dark:text-zinc-400">
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
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white py-14 text-center dark:border-zinc-700 dark:bg-zinc-900">
                  <CheckCircle
                    className="size-12 text-green-600 dark:text-green-400"
                    aria-hidden
                  />
                  <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
                      <Alert.Description className="text-sm text-zinc-700 dark:text-zinc-300">
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
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  Version History
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  All versions of this specification
                </p>
              </div>
              <ul className="space-y-3">
                {detail.versions.map((v) => (
                  <li key={v.version}>
                    <Card.Root className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                      <Card.Content className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-zinc-950 dark:text-zinc-50">
                              Version {v.version}
                            </span>
                            {v.isCurrent ? (
                              <Chip.Root color="accent" size="sm" variant="soft">
                                <Chip.Label>Current</Chip.Label>
                              </Chip.Root>
                            ) : null}
                          </div>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {formatListDate(v.updatedAt)}
                            <span className="text-zinc-400 dark:text-zinc-500">
                              {" "}
                              ·{" "}
                            </span>
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
        <Modal.Backdrop isDismissable>
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
                  isDisabled={markReviewedMutation.isPending}
                  onPress={confirmMarkReviewed}
                >
                  {markReviewedMutation.isPending ? "Saving…" : "Continue"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal.Root>

      <Modal.Root state={regenerateModal}>
        <Modal.Trigger
          aria-hidden
          className="sr-only pointer-events-none"
          tabIndex={-1}
        />
        <Modal.Backdrop isDismissable>
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
        </Modal.Backdrop>
      </Modal.Root>
    </div>
  );
}
