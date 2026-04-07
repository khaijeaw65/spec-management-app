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
import { LayoutTemplate, MoreVertical, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { delay } from "@/lib/mock-utils";
import { formatListDate, languageLabel } from "@/lib/spec-list-utils";
import { cn } from "@/lib/utils";
import { MOCK_TEMPLATES } from "@/mocks/template.mock";
import type { TemplateListItem } from "@/types/template.types";

export function TemplatesList() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await delay(350);
      if (!cancelled) {
        setTemplates(MOCK_TEMPLATES);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    setPendingDelete(null);
    deleteModal.close();
    toast.success("Template removed.");
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {["a", "b", "c", "d"].map((key) => (
          <div
            key={key}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <Skeleton.Root className="mb-3 h-5 w-2/3 rounded-md" />
            <Skeleton.Root className="mb-2 h-4 w-1/3 rounded-md" />
            <Skeleton.Root className="h-4 w-1/2 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white py-16 text-center">
        <LayoutTemplate
          aria-hidden
          className="mb-3 size-12 text-zinc-300"
        />
        <p className="text-base font-medium text-zinc-800">No templates yet</p>
        <p className="mt-1 text-sm text-zinc-500">
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
            className="border border-zinc-200 bg-white shadow-sm"
          >
            <Card.Content className="p-5">
              <div className="flex items-start justify-between gap-3">
                <Card.Title className="text-base font-semibold leading-snug text-zinc-950">
                  {t.name}
                </Card.Title>
                <Dropdown.Root>
                  <Dropdown.Trigger
                    aria-label={`Actions for ${t.name}`}
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-md text-zinc-500 outline-none transition-colors hover:bg-zinc-100",
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
                <span className="text-sm text-zinc-600">
                  {t.sectionCount} sections
                </span>
              </div>
              <p className="mt-3 text-xs text-zinc-500">
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
        <Modal.Backdrop isDismissable />
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
                <p className="mt-2 text-sm font-medium text-zinc-800">
                  {pendingDelete.name}
                </p>
              ) : null}
            </Modal.Body>
            <Modal.Footer className="flex justify-end gap-2">
              <Button
                variant="outline"
                onPress={() => deleteModal.close()}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onPress={confirmDelete}
              >
                Delete
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Root>
    </>
  );
}
