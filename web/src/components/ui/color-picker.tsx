'use client';

import React from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors: string[];
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, colors }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          className={`h-8 w-8 rounded-full border-2 transition-all ${
            value === color ? 'scale-110 border-gray-400' : 'border-gray-200 hover:border-gray-300'
          }`}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  );
};
