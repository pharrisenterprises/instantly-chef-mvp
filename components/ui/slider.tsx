"use client";
import * as React from "react";

export function Slider({ defaultValue, max, min, step, onValueChange }: {
  defaultValue: number[];
  max: number;
  min: number;
  step: number;
  onValueChange: (val: number[]) => void;
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      defaultValue={defaultValue[0]}
      onChange={(e) => onValueChange([Number(e.target.value)])}
    />
  );
}
