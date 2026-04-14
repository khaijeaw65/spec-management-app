"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  TemplateDetailSchema,
  type TemplateDetailDto,
} from "@spec-app/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  FieldError,
  Input,
  Label,
  Radio,
  RadioGroup,
  TextArea,
  TextField,
  Tooltip,
  toast,
} from "@heroui/react";
import { ArrowLeft, GripVertical, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Control } from "react-hook-form";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { delay } from "@/lib/mock-utils";
import { cn } from "@/lib/utils";

type TemplateFormProps = {
  mode: "create" | "edit";
  defaultValues: TemplateDetailDto;
};

function SortableSectionRow({
  id,
  index,
  control,
  canRemove,
  onRemove,
}: Readonly<{
  id: string;
  index: number;
  control: Control<TemplateDetailDto>;
  canRemove: boolean;
  onRemove: () => void;
}>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const deleteBtn = (
    <button
      type="button"
      onClick={onRemove}
      disabled={!canRemove}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors",
        canRemove
          ? "hover:bg-red-50 hover:text-red-600"
          : "cursor-not-allowed opacity-40",
      )}
      aria-label="Remove section"
    >
      <Trash2 className="size-4" />
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border border-zinc-200 bg-white p-4 shadow-sm",
        isDragging && "z-10 opacity-90 ring-2 ring-blue-200",
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex items-center gap-2 lg:flex-col lg:items-center">
          <button
            type="button"
            className="flex size-9 cursor-grab touch-none items-center justify-center rounded-md text-zinc-400 active:cursor-grabbing hover:bg-zinc-100"
            aria-label="Reorder section"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-5" />
          </button>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700">
            {index + 1}
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <Controller
            control={control}
            name={`sections.${index}.title`}
            render={({ field, fieldState }) => (
              <TextField.Root
                fullWidth
                isInvalid={!!fieldState.error}
                name={field.name}
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value}
              >
                <Label.Root className="text-sm font-medium text-zinc-900">
                  Section title
                </Label.Root>
                <Input.Root
                  className="mt-1.5 border-zinc-200"
                  placeholder="Section title"
                />
                {fieldState.error ? (
                  <FieldError className="mt-1">
                    {fieldState.error.message}
                  </FieldError>
                ) : null}
              </TextField.Root>
            )}
          />
          <Controller
            control={control}
            name={`sections.${index}.description`}
            render={({ field, fieldState }) => (
              <TextField.Root
                fullWidth
                isInvalid={!!fieldState.error}
                name={field.name}
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value}
              >
                <Label.Root className="text-sm font-medium text-zinc-900">
                  Description
                </Label.Root>
                <TextArea.Root
                  className="mt-1.5 min-h-[100px] border-zinc-200"
                  placeholder="Describe what AI should extract for this section — used as guidance for AI generation"
                  rows={4}
                />
                {fieldState.error ? (
                  <FieldError className="mt-1">
                    {fieldState.error.message}
                  </FieldError>
                ) : null}
              </TextField.Root>
            )}
          />
        </div>

        <div className="flex justify-end lg:pt-8">
          {canRemove ? (
            deleteBtn
          ) : (
            <Tooltip.Root>
              <Tooltip.Trigger>
                <span className="inline-flex">{deleteBtn}</span>
              </Tooltip.Trigger>
              <Tooltip.Content>
                Template must have at least one section
              </Tooltip.Content>
            </Tooltip.Root>
          )}
        </div>
      </div>
    </div>
  );
}

export function TemplateForm({
  mode,
  defaultValues,
}: Readonly<TemplateFormProps>) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TemplateDetailDto>({
    resolver: zodResolver(TemplateDetailSchema),
    defaultValues,
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "sections",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    move(oldIndex, newIndex);
  };

  const onSubmit = handleSubmit(async () => {
    await delay(300);
    toast.success("Template saved.");
    router.push("/templates");
  });

  const languageBlock = (
    <Controller
      control={control}
      name="language"
      render={({ field }) => (
        <RadioGroup.Root
          value={field.value}
          onChange={field.onChange}
          isDisabled={isEdit}
          className="flex flex-col gap-2"
        >
          <div className="flex flex-wrap gap-6">
            <Radio.Root value="en" className="flex items-center gap-2">
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              <Radio.Content className="text-sm text-zinc-800">
                English
              </Radio.Content>
            </Radio.Root>
            <Radio.Root value="th" className="flex items-center gap-2">
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              <Radio.Content className="text-sm text-zinc-800">
                Thai (ไทย)
              </Radio.Content>
            </Radio.Root>
          </div>
        </RadioGroup.Root>
      )}
    />
  );

  return (
    <div className="min-h-screen">
      <div className="border-b border-zinc-200 bg-white px-6 py-5">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/templates"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to Templates
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            {isEdit ? "Edit Template" : "Create Template"}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl p-6">
        <form className="space-y-8" onSubmit={onSubmit} noValidate>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900">
              Template details
            </h2>
            <div className="mt-4 space-y-6">
              <Controller
                control={control}
                name="name"
                render={({ field, fieldState }) => (
                  <TextField.Root
                    fullWidth
                    isInvalid={!!fieldState.error}
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    value={field.value}
                  >
                    <Label.Root className="text-sm font-medium text-zinc-900">
                      Template Name
                    </Label.Root>
                    <Input.Root
                      className="mt-1.5 border-zinc-200"
                      placeholder="e.g. Standard Template"
                    />
                    {fieldState.error ? (
                      <FieldError className="mt-1">
                        {fieldState.error.message}
                      </FieldError>
                    ) : null}
                  </TextField.Root>
                )}
              />

              <div>
                <Label.Root className="text-sm font-medium text-zinc-900">
                  Language
                </Label.Root>
                <div className="mt-2">
                  {isEdit ? (
                    <Tooltip.Root>
                      <Tooltip.Trigger>
                        <span className="inline-block w-full">{languageBlock}</span>
                      </Tooltip.Trigger>
                      <Tooltip.Content>
                        Language cannot be changed after creation
                      </Tooltip.Content>
                    </Tooltip.Root>
                  ) : (
                    languageBlock
                  )}
                </div>
              </div>

              <Controller
                control={control}
                name="description"
                render={({ field, fieldState }) => (
                  <TextField.Root
                    fullWidth
                    isInvalid={!!fieldState.error}
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    value={field.value}
                  >
                    <Label.Root className="text-sm font-medium text-zinc-900">
                      Template description
                    </Label.Root>
                    <TextArea.Root
                      className="mt-1.5 min-h-[110px] border-zinc-200"
                      placeholder="Optional description to help teammates understand the purpose of this template"
                      rows={4}
                    />
                    {fieldState.error ? (
                      <FieldError className="mt-1">
                        {fieldState.error.message}
                      </FieldError>
                    ) : null}
                  </TextField.Root>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-900">Sections</h2>
            {errors.sections?.message ? (
              <p className="text-sm text-red-600" role="alert">
                {errors.sections.message}
              </p>
            ) : null}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={fields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <SortableSectionRow
                      key={field.id}
                      id={field.id}
                      index={index}
                      control={control}
                      canRemove={fields.length > 1}
                      onRemove={() => remove(index)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <Button
              type="button"
              variant="outline"
              className="border-dashed"
              onPress={() =>
                append({ title: "", description: "", order: fields.length + 1 })
              }
            >
              <Plus className="size-4" aria-hidden />
              Add Section
            </Button>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-zinc-200 pt-6">
            <Button
              type="button"
              variant="outline"
              onPress={() => router.push("/templates")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 text-white"
              isDisabled={isSubmitting}
            >
              Save Template
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
