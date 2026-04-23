"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { cn } from "@/lib/utils";

const Sheet = Dialog.Root;
const SheetTrigger = Dialog.Trigger;
const SheetClose = Dialog.Close;
const SheetPortal = Dialog.Portal;

const SheetOverlay = forwardRef<ElementRef<typeof Dialog.Overlay>, ComponentPropsWithoutRef<typeof Dialog.Overlay>>(
  ({ className, ...props }, ref) => (
    <Dialog.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-40 bg-slate-900/40 data-[state=open]:animate-in data-[state=closed]:animate-out",
        className,
      )}
      {...props}
    />
  ),
);
SheetOverlay.displayName = Dialog.Overlay.displayName;

const SheetContent = forwardRef<ElementRef<typeof Dialog.Content>, ComponentPropsWithoutRef<typeof Dialog.Content>>(
  ({ className, ...props }, ref) => (
    <SheetPortal>
      <SheetOverlay />
      <Dialog.Content
        ref={ref}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-emerald-100 bg-white p-5 shadow-xl outline-none duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
          className,
        )}
        {...props}
      />
    </SheetPortal>
  ),
);
SheetContent.displayName = Dialog.Content.displayName;

const SheetTitle = Dialog.Title;
const SheetDescription = Dialog.Description;

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle, SheetDescription };
