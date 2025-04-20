declare module "@/components/ui/table" {
  export const Table: React.FC<React.HTMLAttributes<HTMLTableElement>>;
  export const TableHeader: React.FC<
    React.HTMLAttributes<HTMLTableSectionElement>
  >;
  export const TableBody: React.FC<
    React.HTMLAttributes<HTMLTableSectionElement>
  >;
  export const TableFooter: React.FC<
    React.HTMLAttributes<HTMLTableSectionElement>
  >;
  export const TableHead: React.FC<
    React.ThHTMLAttributes<HTMLTableCellElement>
  >;
  export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>>;
  export const TableCell: React.FC<
    React.TdHTMLAttributes<HTMLTableCellElement>
  >;
  export const TableCaption: React.FC<
    React.HTMLAttributes<HTMLTableCaptionElement>
  >;
}

declare module "@/components/ui/skeleton" {
  export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>>;
}

declare module "@/components/ui/badge" {
  export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline";
  }
  export const Badge: React.FC<BadgeProps>;
  export const badgeVariants: (props: {
    variant?: BadgeProps["variant"];
    className?: string;
  }) => string;
}

declare module "@/components/transaction/transaction-form" {
  export interface TransactionFormProps {
    transactionId?: string;
    onSuccess?: () => void;
    mode?: "create" | "update";
  }
  export const TransactionForm: React.FC<TransactionFormProps>;
}
