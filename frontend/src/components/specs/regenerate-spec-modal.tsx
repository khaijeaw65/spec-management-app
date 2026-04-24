"use client";

import {
  Button,
  Label,
  Modal,
  Tabs,
  TextArea,
  TextField,
  toast,
  useOverlayState,
} from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

import { regenerateSpec } from "@/services/spec.service";

type OverlayState = ReturnType<typeof useOverlayState>;

function patchRegenerateErrorMessage(err: unknown): string {
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
  return "Could not queue regeneration. Try again.";
}

export type RegenerateSpecModalProps = {
  state: OverlayState;
  mainSpecId: string;
  /** Extra invalidations after a successful queue (e.g. detail query). */
  onSuccess?: () => void | Promise<void>;
};

export function RegenerateSpecModal({
  state,
  mainSpecId,
  onSuccess,
}: Readonly<RegenerateSpecModalProps>) {
  const queryClient = useQueryClient();
  const regenerateFileInputRef = useRef<HTMLInputElement>(null);
  const [regenerateInputMethod, setRegenerateInputMethod] = useState<
    "paste" | "upload"
  >("paste");
  const [regenerateMomContent, setRegenerateMomContent] = useState("");
  const [regenerateUploadedFile, setRegenerateUploadedFile] =
    useState<File | null>(null);
  const [regenerateFileName, setRegenerateFileName] = useState("");
  const [regenerateFileSize, setRegenerateFileSize] = useState(0);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setRegenerateInputMethod("paste");
    setRegenerateMomContent("");
    setRegenerateUploadedFile(null);
    setRegenerateFileName("");
    setRegenerateFileSize(0);
    setRegenerateError(null);
    if (regenerateFileInputRef.current) {
      regenerateFileInputRef.current.value = "";
    }
  }, []);

  useEffect(() => {
    if (state.isOpen && mainSpecId) {
      resetForm();
    }
  }, [state.isOpen, mainSpecId, resetForm]);

  const regenerateMutation = useMutation({
    mutationFn: (form: FormData) => regenerateSpec(mainSpecId, form),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["spec"] });
      await onSuccess?.();
      toast.success("Specification queued for regeneration.");
      state.close();
      resetForm();
    },
    onError: (err) => {
      toast.danger(patchRegenerateErrorMessage(err));
    },
  });

  const confirmRegenerate = useCallback(() => {
    setRegenerateError(null);
    if (!mainSpecId) return;

    if (regenerateInputMethod === "paste") {
      if (regenerateMomContent.trim().length < 50) {
        setRegenerateError("Meeting notes must be at least 50 characters.");
        return;
      }
    } else if (!regenerateUploadedFile) {
      setRegenerateError("Select a file to upload.");
      return;
    }

    const form = new FormData();
    form.append(
      "inputType",
      regenerateInputMethod === "paste" ? "TEXT" : "FILE",
    );
    if (regenerateInputMethod === "paste") {
      form.append("momContent", regenerateMomContent);
    } else if (regenerateUploadedFile) {
      form.append("file", regenerateUploadedFile);
    }

    regenerateMutation.mutate(form);
  }, [
    mainSpecId,
    regenerateInputMethod,
    regenerateMomContent,
    regenerateMutation,
    regenerateUploadedFile,
  ]);

  return (
    <Modal.Root state={state}>
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
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                This will create a new version. Previous versions remain
                viewable.
              </p>

              <div className="mt-4">
                <Tabs.Root
                  selectedKey={regenerateInputMethod}
                  onSelectionChange={(key) => {
                    const k = String(key);
                    const m = k === "upload" ? "upload" : "paste";
                    setRegenerateInputMethod(m);
                    setRegenerateError(null);
                    if (m === "paste") {
                      setRegenerateUploadedFile(null);
                      setRegenerateFileName("");
                      setRegenerateFileSize(0);
                      if (regenerateFileInputRef.current) {
                        regenerateFileInputRef.current.value = "";
                      }
                    }
                  }}
                  className="w-full"
                >
                  <Tabs.ListContainer className="rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">
                    <Tabs.List className="flex w-full gap-0">
                      <Tabs.Tab
                        id="paste"
                        className="flex-1 min-w-0 rounded-full px-4 py-2 text-center text-sm font-medium text-zinc-600 outline-none data-selected:text-blue-600 dark:text-zinc-400 dark:data-selected:text-blue-400"
                      >
                        Type / Paste
                        <Tabs.Indicator className="bg-white shadow-sm dark:bg-zinc-900" />
                      </Tabs.Tab>
                      <Tabs.Tab
                        id="upload"
                        className="flex-1 min-w-0 rounded-full px-4 py-2 text-center text-sm font-medium text-zinc-600 outline-none data-selected:text-blue-600 dark:text-zinc-400 dark:data-selected:text-blue-400"
                      >
                        Upload file
                        <Tabs.Indicator className="bg-white shadow-sm dark:bg-zinc-900" />
                      </Tabs.Tab>
                    </Tabs.List>
                  </Tabs.ListContainer>

                  <div className="mt-4 h-[280px]">
                    <Tabs.Panel
                      id="paste"
                      className="flex h-full flex-col outline-none"
                    >
                      <TextField.Root fullWidth>
                        <Label.Root className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          Meeting Notes (MOM)
                        </Label.Root>
                        <TextArea.Root
                          className="mt-1.5 min-h-0 flex-1 w-full border-zinc-200 font-sans dark:border-zinc-700"
                          placeholder="Paste your meeting notes here…"
                          value={regenerateMomContent}
                          onChange={(e) =>
                            setRegenerateMomContent(e.target.value)
                          }
                        />
                        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                          Minimum 50 characters required (
                          {regenerateMomContent.trim().length}/50)
                        </p>
                      </TextField.Root>
                    </Tabs.Panel>

                    <Tabs.Panel
                      id="upload"
                      className="flex h-full flex-col outline-none"
                    >
                      <input
                        ref={regenerateFileInputRef}
                        type="file"
                        accept=".txt,.docx,.pdf,application/pdf"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          setRegenerateUploadedFile(f);
                          setRegenerateFileName(f.name);
                          setRegenerateFileSize(f.size);
                          setRegenerateError(null);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          regenerateFileInputRef.current?.click()
                        }
                        className="flex min-h-0 flex-1 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-6 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/50 dark:border-zinc-600 dark:bg-zinc-800/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
                      >
                        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                          Click to browse a MOM file
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          Accepted: .txt, .docx, .pdf
                        </span>
                      </button>
                      <div className="mt-3 h-6">
                        {regenerateFileName ? (
                          <p className="text-sm text-zinc-700 dark:text-zinc-300">
                            <span className="font-medium">
                              {regenerateFileName}
                            </span>
                            <span className="text-zinc-500 dark:text-zinc-400">
                              {" "}
                              ({Math.ceil(regenerateFileSize / 1024)} KB)
                            </span>
                          </p>
                        ) : (
                          <p className="text-sm opacity-0">placeholder</p>
                        )}
                      </div>
                    </Tabs.Panel>
                  </div>
                </Tabs.Root>

                {regenerateError ? (
                  <p
                    className="mt-3 text-sm text-red-600 dark:text-red-400"
                    role="alert"
                  >
                    {regenerateError}
                  </p>
                ) : null}
              </div>
            </Modal.Body>
            <Modal.Footer className="flex justify-end gap-2">
              <Button
                variant="outline"
                onPress={() => {
                  state.close();
                  resetForm();
                }}
                isDisabled={regenerateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 text-white"
                onPress={confirmRegenerate}
                isDisabled={
                  !mainSpecId ||
                  regenerateMutation.isPending ||
                  (regenerateInputMethod === "paste" &&
                    regenerateMomContent.trim().length < 50) ||
                  (regenerateInputMethod === "upload" && !regenerateUploadedFile)
                }
              >
                {regenerateMutation.isPending ? "Regenerating…" : "Confirm"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal.Root>
  );
}
