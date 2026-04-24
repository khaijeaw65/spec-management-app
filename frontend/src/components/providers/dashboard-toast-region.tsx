"use client";

import { Toast } from "@heroui/react";

/**
 * Mounts the HeroUI toast region + queue only. Do not wrap page content in
 * Toast.Provider: react-aria's ToastRegion renders null when the queue is empty,
 * which would hide the whole dashboard until a toast appears.
 */
export function DashboardToastRegion() {
  return <Toast.Provider placement="bottom end" />;
}
