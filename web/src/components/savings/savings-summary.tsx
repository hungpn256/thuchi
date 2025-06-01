'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSavingsTotal } from '@/hooks/use-savings';
import { ASSET_TYPE_LABELS } from '@/constants/app.constant';
import { formatAmount } from '@/lib/utils';

export function SavingsSummary() {
  const { data, isLoading } = useSavingsTotal();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="bg-muted mb-4 h-6 w-48 rounded"></div>
        </div>
        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="animate-pulse space-y-3">
              <div className="bg-muted h-4 w-3/4 rounded"></div>
              <div className="bg-muted h-4 w-1/2 rounded"></div>
              <div className="bg-muted h-4 w-5/6 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Text header for total count */}
      <div>
        <p className="text-lg text-gray-700">
          Tổng cộng <span className="font-semibold">{data?.totalCount || 0}</span> tài sản đang quản
          lý
        </p>
      </div>

      {/* Single card with all asset types */}
      {data?.byAssetType && data.byAssetType.length > 0 && (
        <Card>
          <CardHeader className="pb-2 md:pb-6">
            <CardTitle className="text-base">Danh sách tài sản</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6">
            <div className="space-y-2 md:space-y-3">
              {data.byAssetType.map((asset, index) => {
                const assetTypeLabel =
                  ASSET_TYPE_LABELS[asset.assetType as keyof typeof ASSET_TYPE_LABELS] ||
                  asset.assetType;

                return (
                  <div
                    key={`${asset.assetType}-${asset.unit}-${index}`}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-2 md:p-3"
                  >
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div
                        className="h-3 w-3 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: asset.color }}
                      />
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-gray-900 md:text-base">
                          {assetTypeLabel}
                        </span>
                        <span className="ml-1 text-xs text-gray-500 md:ml-2 md:text-sm">
                          ({asset.count} tài sản)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900 md:text-base">
                        {formatAmount(asset.totalAmount.toString())} {asset.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
