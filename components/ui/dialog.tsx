"use client";
import * as React from "react";

export function Dialog({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>; // placeholder – can integrate Radix later
}
export const DialogContent = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DialogHeader = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DialogFooter = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DialogTitle = ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>;
export const DialogTrigger = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
