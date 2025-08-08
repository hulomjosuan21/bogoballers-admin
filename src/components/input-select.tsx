import { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export type InputSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
};

export default function InputSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
}: InputSelectProps) {
  const isCustom = !options.includes(value);
  const [customValue, setCustomValue] = useState(isCustom ? value : "");

  useEffect(() => {
    if (!options.includes(value)) {
      setCustomValue(value);
    }
  }, [value, options]);

  const handleSelectChange = (val: string) => {
    if (val !== "other") {
      onChange(val);
    } else {
      onChange(customValue);
    }
  };

  return (
    <Select
      value={isCustom ? "other" : value}
      onValueChange={handleSelectChange}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder}>
          {isCustom ? customValue || "Other" : value}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
        <div className="p-2 space-y-2">
          <label className="text-sm text-muted-foreground">Other</label>
          <Input
            placeholder="Enter custom value"
            value={customValue}
            onChange={(e) => {
              const val = e.target.value;
              setCustomValue(val);
              onChange(val);
            }}
          />
        </div>
      </SelectContent>
    </Select>
  );
}
