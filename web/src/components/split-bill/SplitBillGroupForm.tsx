import { Button } from '@/components/ui/button';
import { SplitBillGroup } from '@/hooks/use-split-bill-groups';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Plus } from 'lucide-react';

const groupSchema = yup.object({
  name: yup.string().required('Vui lòng nhập tên nhóm'),
  members: yup
    .array(
      yup.object({
        id: yup.string().required(),
        name: yup.string().required(),
      }),
    )
    .min(2, 'Nhóm cần ít nhất 2 thành viên')
    .required('Nhóm cần ít nhất 2 thành viên'),
});

type GroupFormValues = {
  name: string;
  members: { id: string; name: string }[];
};

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface SplitBillGroupFormProps {
  onSubmit: (group: SplitBillGroup) => void;
}

export function SplitBillGroupForm({ onSubmit }: SplitBillGroupFormProps) {
  const form = useForm<GroupFormValues>({
    resolver: yupResolver(groupSchema),
    defaultValues: { name: '', members: [] },
  });
  const [memberName, setMemberName] = useState('');
  const [memberError, setMemberError] = useState<string | null>(null);

  const members = form.getValues('members') || [];
  const canAdd = memberName.trim() && !members.some((m) => m.name === memberName.trim());

  const handleAddMemberClick = () => {
    if (!canAdd) return;
    form.setValue('members', [...members, { id: genId(), name: memberName.trim() }], {
      shouldValidate: true,
    });
    setMemberName('');
    setMemberError(null);
  };

  const handleAddMember = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddMemberClick();
    }
  };

  const handleRemoveMember = (id: string) => {
    form.setValue(
      'members',
      members.filter((m) => m.id !== id),
      { shouldValidate: true },
    );
  };

  const handleSubmit = (values: GroupFormValues) => {
    const now = new Date().toISOString();
    onSubmit({
      id: genId(),
      name: values.name.trim(),
      members: values.members,
      expenses: [],
      createdAt: now,
      updatedAt: now,
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên nhóm</FormLabel>
              <FormControl>
                <Input placeholder="Nhóm du lịch Đà Lạt" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Thành viên</FormLabel>
          <div className="flex gap-2">
            <FormControl>
              <Input
                placeholder="Nhập tên thành viên"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                onKeyDown={handleAddMember}
              />
            </FormControl>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="shrink-0"
              onClick={handleAddMemberClick}
              disabled={!canAdd}
              aria-label="Thêm thành viên"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {memberError && <FormMessage>{memberError}</FormMessage>}
          <div className="mt-2 flex flex-wrap gap-2">
            {(form.watch('members') || []).map((m) => (
              <span
                key={m.id}
                className="bg-muted flex items-center gap-1 rounded px-3 py-1 text-sm"
              >
                {m.name}
                <button
                  type="button"
                  className="text-destructive ml-1 text-xs hover:underline"
                  onClick={() => handleRemoveMember(m.id)}
                  aria-label="Xóa thành viên"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <FormMessage />
        </FormItem>
        <Button type="submit" variant="default" className="w-full">
          Lưu nhóm
        </Button>
      </form>
    </Form>
  );
}
