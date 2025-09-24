"use client";
import * as React from "react";

export function Select({ children }: { children: React.ReactNode }) {
  return <select className="border rounded p-2 w-full">{children}</select>;
}
export const SelectTrigger = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const SelectValue = ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>;
export const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <option value={value}>{children}</option>
);
