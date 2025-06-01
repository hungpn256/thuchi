'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Savings } from '@/types/savings';
import { ASSET_TYPE_LABELS, ASSET_TYPES } from '@/constants/app.constant';
import { formatAmount } from '@/lib/utils';

interface SavingsCardProps {
  savings: Savings;
  onEdit: (savings: Savings) => void;
  onDelete: (savings: Savings) => void;
}

export const SavingsCard: React.FC<SavingsCardProps> = ({ savings, onEdit, onDelete }) => {
  const isMoneyAsset = savings.assetType === ASSET_TYPES.MONEY;
  const assetTypeLabel =
    ASSET_TYPE_LABELS[savings.assetType as keyof typeof ASSET_TYPE_LABELS] || savings.assetType;

  const formatDisplayAmount = () => {
    if (isMoneyAsset) {
      return `${formatAmount(savings.amount.toString())} ${savings.unit}`;
    }
    return `${formatAmount(savings.amount.toString())} ${savings.unit}`;
  };

  return (
    <Card className="w-full transition-all hover:shadow-md">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-1 items-start space-x-2 md:space-x-3">
            <div
              className="mt-1 h-3 w-3 flex-shrink-0 rounded-full md:h-4 md:w-4"
              style={{ backgroundColor: savings.color || '#3B82F6' }}
            />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-gray-900 md:text-base">
                {savings.name}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-1 md:gap-2">
                <span className="text-base font-bold text-gray-900 md:text-lg">
                  {formatDisplayAmount()}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                  {assetTypeLabel}
                </span>
              </div>
              {savings.description && (
                <p className="mt-1 line-clamp-2 text-xs text-gray-600 md:mt-2 md:text-sm">
                  {savings.description}
                </p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 md:h-8 md:w-8">
                <MoreVertical className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(savings)}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(savings)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};
