"use client";

import {
  Button,
  Card,
  Chip,
  Dropdown,
  Modal,
  Skeleton,
  toast,
  useOverlayState,
} from "@heroui/react";
import type { TemplateDto } from "@spec-app/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutTemplate, MoreVertical, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { formatListDate, languageLabel } from "@/lib/spec-list-utils";
import { templateQueryKeys } from "@/lib/template-query-keys";
import { cn } from "@/lib/utils";
import { deleteTemplate, getUserTemplates } from "@/services/template.service";
import type { TemplateListItem } from "@/types/template.types";

function templateDtoToListItem(dto: TemplateDto): TemplateListItem {
  const raw = dto.createdOn as unknown;
  const createdAt =
    typeof raw === "string"
      ? raw
      : raw instanceof Date
        ? raw.toISOString()
        : new Date(String(raw)).toISOString();

  return {
    id: dto.id,
    name: dto.name,
    language: dto.language,
    sectionCount: dto.sectionCount,
    createdAt,
  };
}

export function TemplatesList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const deleteModal = useOverlayState({
    isOpen: pendingDelete !== null,
    onOpenChange: (open) => {
      if (!open) setPendingDelete(null);
    },
  });

  const templatesQuery = useQuery({
    queryKey: templateQueryKeys.list(),
    queryFn: getUserTemplates,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: templateQueryKeys.all });
      toast.success("Template removed.");
      setPendingDelete(null);
      deleteModal.close();
    },
    onError: () => {
      toast.danger("Could not delete template.");
    },
  });

  const templates: TemplateListItem[] =
    templatesQuery.data?.map(templateDtoToListItem) ?? [];

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteMutation.mutate(pendingDelete.id);
  };

  if (templatesQuery.isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {["a", "b", "c", "d"].map((key) => (
          <div
            key={key}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <Skeleton.Root className="mb-3 h-5 w-2/3 rounded-md" />
            <Skeleton.Root className="mb-2 h-4 w-1/3 rounded-md" />
            <Skeleton.Root className="h-4 w-1/2 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (templatesQuery.isError) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        Could not load templates. Try again in a moment.
      </p>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <LayoutTemplate
          aria-hidden
          className="mb-3 size-12 text-zinc-300 dark:text-zinc-600"
        />
        <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">
          No templates yet
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Create your first template to get started
        </p>
        <Link
          href="/templates/create"
          className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus className="size-4" aria-hidden />
          New Template
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {templates.map((t) => (
          <Card.Root
            key={t.id}
            className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <Card.Content className="p-5">
              <div className="flex items-start justify-between gap-3">
                <Card.Title className="text-base font-semibold leading-snug text-zinc-950 dark:text-zinc-50">
                  {t.name}
                </Card.Title>
                <Dropdown.Root>
                  <Dropdown.Trigger
                    aria-label={`Actions for ${t.name}`}
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-md text-zinc-500 outline-none transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
                    )}
                  >
                    <MoreVertical className="size-4" aria-hidden />
                  </Dropdown.Trigger>
                  <Dropdown.Popover className="min-w-[180px]">
                    <Dropdown.Menu>
                      <Dropdown.Item
                        textValue="Edit"
                        onAction={() => router.push(`/templates/${t.id}/edit`)}
                      >
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item
                        textValue="Delete"
                        onAction={() =>
                          setPendingDelete({ id: t.id, name: t.name })
                        }
                      >
                        Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown.Root>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Chip.Root color="default" size="sm" variant="secondary">
                  <Chip.Label>{languageLabel(t.language)}</Chip.Label>
                </Chip.Root>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t.sectionCount} sections
                </span>
              </div>
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                Created {formatListDate(t.createdAt)}
              </p>
            </Card.Content>
          </Card.Root>
        ))}
      </div>

      <Modal.Root state={deleteModal}>
        <Modal.Trigger
          aria-hidden
          className="sr-only pointer-events-none"
          tabIndex={-1}
        />
        <Modal.Backdrop isDismissable>
          <Modal.Container placement="center" size="md">
            <Modal.Dialog aria-labelledby="delete-template-title">
              <Modal.Header>
                <Modal.Heading id="delete-template-title">
                  Delete template?
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p>Are you sure? This cannot be undone.</p>
                {pendingDelete ? (
                  <p className="mt-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {pendingDelete.name}
                  </p>
                ) : null}
              </Modal.Body>
              <Modal.Footer className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onPress={() => deleteModal.close()}
                  isDisabled={deleteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 text-white hover:bg-red-700"
                  onPress={confirmDelete}
                  isDisabled={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal.Root>
    </>
  );
}
