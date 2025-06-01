'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SavingsCard } from '@/components/savings/savings-card';
import { SavingsForm } from '@/components/savings/savings-form';
import { SavingsSummary } from '@/components/savings/savings-summary';
import {
  useSavings,
  useCreateSavings,
  useUpdateSavings,
  useDeleteSavings,
} from '@/hooks/use-savings';
import { CreateSavingsDTO, UpdateSavingsDTO, Savings } from '@/types/savings';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ITEMS_PER_PAGE = 12;

export default function SavingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSavings, setSelectedSavings] = useState<Savings | null>(null);

  const { data, isLoading, error } = useSavings({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: searchTerm || undefined,
  });

  const createSavingsMutation = useCreateSavings();
  const updateSavingsMutation = useUpdateSavings();
  const deleteSavingsMutation = useDeleteSavings();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCreateSubmit = async (data: CreateSavingsDTO | UpdateSavingsDTO) => {
    try {
      await createSavingsMutation.mutateAsync(data as CreateSavingsDTO);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating savings:', error);
    }
  };

  const handleEditSubmit = async (data: CreateSavingsDTO | UpdateSavingsDTO) => {
    if (!selectedSavings) return;

    try {
      await updateSavingsMutation.mutateAsync({
        id: selectedSavings.id,
        data: data as UpdateSavingsDTO,
      });
      setIsEditDialogOpen(false);
      setSelectedSavings(null);
    } catch (error) {
      console.error('Error updating savings:', error);
    }
  };

  const handleEdit = (savings: Savings) => {
    setSelectedSavings(savings);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (savings: Savings) => {
    setSelectedSavings(savings);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSavings) return;

    try {
      await deleteSavingsMutation.mutateAsync(selectedSavings.id);
      setIsDeleteDialogOpen(false);
      setSelectedSavings(null);
    } catch (error) {
      console.error('Error deleting savings:', error);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500">Có lỗi xảy ra khi tải dữ liệu tài sản</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý tài sản</h1>
          <p className="text-muted-foreground">Theo dõi và quản lý các tài sản tiết kiệm của bạn</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm tài sản
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Thêm tài sản mới</DialogTitle>
            </DialogHeader>
            <SavingsForm
              onSubmit={handleCreateSubmit}
              onCancel={() => setIsCreateDialogOpen(false)}
              isLoading={createSavingsMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <SavingsSummary />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Tìm kiếm tài sản..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Savings List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-muted h-48 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="py-12 text-center">
          <div className="text-muted-foreground mb-4">
            {searchTerm ? 'Không tìm thấy tài sản nào' : 'Bạn chưa có tài sản nào'}
          </div>
          {!searchTerm && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm tài sản đầu tiên
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Thêm tài sản mới</DialogTitle>
                </DialogHeader>
                <SavingsForm
                  onSubmit={handleCreateSubmit}
                  onCancel={() => setIsCreateDialogOpen(false)}
                  isLoading={createSavingsMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data?.data.map((savings) => (
              <SavingsCard
                key={savings.id}
                savings={savings}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Trước
              </Button>
              <span className="px-4 py-2 text-sm">
                Trang {currentPage} / {data.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === data.totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cập nhật tài sản</DialogTitle>
          </DialogHeader>
          {selectedSavings && (
            <SavingsForm
              onSubmit={handleEditSubmit}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedSavings(null);
              }}
              initialData={selectedSavings}
              isLoading={updateSavingsMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tài sản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài sản &ldquo;{selectedSavings?.name}&rdquo;? Hành động này
              không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedSavings(null)}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteSavingsMutation.isPending}
            >
              {deleteSavingsMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
