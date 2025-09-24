"use client";
import * as React from "react";

export function Switch({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <input
      type="checkbox"
      className="h-4 w-8 rounded bg-gray-200 checked:bg-black"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
  );
}
