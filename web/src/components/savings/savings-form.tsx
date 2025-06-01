'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AssetTypeSelector } from '@/components/forms/asset-type-selector';
import { CreateSavingsDTO, UpdateSavingsDTO, Savings } from '@/types/savings';
import { ASSET_TYPES } from '@/constants/app.constant';
import { formatAmount } from '@/lib/utils';

interface SavingsFormProps {
  onSubmit: (data: CreateSavingsDTO | UpdateSavingsDTO) => void;
  onCancel: () => void;
  initialData?: Savings;
  isLoading?: boolean;
}

const DEFAULT_COLORS = [
  '#3B82F6',
  '#EF4444',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
];

export const SavingsForm: React.FC<SavingsFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreateSavingsDTO | UpdateSavingsDTO>({
    name: '',
    amount: undefined,
    assetType: ASSET_TYPES.MONEY,
    unit: 'VND',
    description: '',
    color: DEFAULT_COLORS[0],
  });

  const [formattedAmount, setFormattedAmount] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        amount: initialData.amount,
        assetType: initialData.assetType,
        unit: initialData.unit,
        description: initialData.description || '',
        color: initialData.color || DEFAULT_COLORS[0],
      });
      // Format amount with thousand separators for display
      const amountStr = initialData.amount.toString();
      const formattedValue = amountStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      setFormattedAmount(formattedValue);
    }
  }, [initialData]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove all non-digit characters and format with thousand separators
    const cleanValue = value.replace(/\D/g, '');
    const formattedValue = cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setFormattedAmount(formattedValue);

    // Convert to number for storage
    const numericValue = Number(cleanValue) || 0;
    setFormData((prev) => ({ ...prev, amount: numericValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isMoneyAsset = formData.assetType === ASSET_TYPES.MONEY;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Tên tài sản *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Nhập tên tài sản"
          required
        />
      </div>

      <AssetTypeSelector
        assetType={formData.assetType || ASSET_TYPES.MONEY}
        unit={formData.unit || 'VND'}
        onAssetTypeChange={(assetType) => setFormData((prev) => ({ ...prev, assetType }))}
        onUnitChange={(unit) => setFormData((prev) => ({ ...prev, unit }))}
      />

      <div className="space-y-2">
        <Label htmlFor="amount">Số lượng *</Label>
        <div className="relative">
          <Input
            id="amount"
            value={formattedAmount}
            onChange={handleAmountChange}
            placeholder="Nhập số lượng"
            inputMode={isMoneyAsset ? 'numeric' : 'decimal'}
            required
          />
          <div className="text-muted-foreground pointer-events-none absolute inset-y-0 right-3 flex items-center">
            {formData.unit || 'VND'}
          </div>
        </div>
        {isMoneyAsset && (
          <p className="text-muted-foreground text-xs">
            {formatAmount((formData.amount || 0).toString())} {formData.unit}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Nhập mô tả (tùy chọn)"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Màu sắc</Label>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`h-8 w-8 rounded-full border-2 transition-all ${
                (formData.color || DEFAULT_COLORS[0]) === color
                  ? 'scale-110 border-gray-400'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData((prev) => ({ ...prev, color }))}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? 'Đang xử lý...' : initialData ? 'Cập nhật' : 'Thêm mới'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
      </div>
    </form>
  );
};
