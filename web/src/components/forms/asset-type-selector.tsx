'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ASSET_TYPE_LABELS, ASSET_UNITS, DEFAULT_UNITS } from '@/constants/app.constant';

interface AssetTypeSelectorProps {
  assetType: string;
  unit: string;
  onAssetTypeChange: (assetType: string) => void;
  onUnitChange: (unit: string) => void;
}

export const AssetTypeSelector: React.FC<AssetTypeSelectorProps> = ({
  assetType,
  unit,
  onAssetTypeChange,
  onUnitChange,
}) => {
  const handleAssetTypeChange = (newAssetType: string) => {
    onAssetTypeChange(newAssetType);
    // Auto-select default unit when asset type changes
    const defaultUnit = DEFAULT_UNITS[newAssetType as keyof typeof DEFAULT_UNITS];
    onUnitChange(defaultUnit);
  };

  const availableUnits = ASSET_UNITS[assetType as keyof typeof ASSET_UNITS] || [];

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="assetType">Loại tài sản</Label>
        <Select value={assetType} onValueChange={handleAssetTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn loại tài sản" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ASSET_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">Đơn vị</Label>
        <Select value={unit} onValueChange={onUnitChange}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn đơn vị" />
          </SelectTrigger>
          <SelectContent>
            {availableUnits.map((unitOption) => (
              <SelectItem key={unitOption} value={unitOption}>
                {unitOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
