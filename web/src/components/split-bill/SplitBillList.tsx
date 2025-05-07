'use client';

import { Button } from '@/components/ui/button';
import { useSplitBillGroups, SplitBillGroup } from '@/hooks/use-split-bill-groups';
import { Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants/app.constant';
import { useState } from 'react';
import { SplitBillGroupForm } from './SplitBillGroupForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';

export function SplitBillList() {
  const { groups, addGroup, deleteGroup } = useSplitBillGroups();
  const [open, setOpen] = useState(false);

  // Xử lý tạo nhóm mới
  const handleCreateGroup = (group: SplitBillGroup) => {
    addGroup(group);
    setOpen(false);
  };

  return (
    <div className="from-background/10 via-background/50 to-background/80 min-h-screen bg-gradient-to-b">
      <div className="container mx-auto space-y-6 px-4 py-6 md:space-y-8 md:py-10">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Chia tiền nhóm</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Tạo nhóm mới</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl">Tạo nhóm mới</DialogTitle>
              </DialogHeader>
              <SplitBillGroupForm onSubmit={handleCreateGroup} />
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.length === 0 && (
            <Card className="col-span-full flex flex-col items-center justify-center gap-2 py-8">
              <Plus className="mx-auto h-8 w-8 opacity-30" />
              <span className="text-muted-foreground">Chưa có nhóm nào</span>
            </Card>
          )}
          {groups.map((group) => (
            <Card key={group.id} className="flex flex-col justify-between p-4">
              <Link href={`${ROUTES.SPLIT_BILL.LIST}/${group.id}`} className="flex-1">
                <div className="text-lg font-semibold">{group.name}</div>
                <div className="text-muted-foreground text-sm">
                  {group.members.length} thành viên &bull; {group.expenses.length} khoản chi
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive mt-2 self-end"
                onClick={() => deleteGroup(group.id)}
                title="Xóa nhóm"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
