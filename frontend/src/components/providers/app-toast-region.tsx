"use client";

import { Toast } from "@heroui/react";

/**
 * Single app-wide toast region. Keep as a sibling of page content, not a wrapper,
 * so react-aria's ToastRegion does not hide layouts when the queue is empty.
 */
export function AppToastRegion() {
  return <Toast.Provider placement="bottom end" />;
}
