import React from 'react';

type TableProps = React.HTMLAttributes<HTMLTableElement> & {
  className?: string;
  children: React.ReactNode;
};

type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement> & {
  className?: string;
  children: React.ReactNode;
};

type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement> & {
  className?: string;
  children: React.ReactNode;
};

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  className?: string;
  children: React.ReactNode;
};

type TableHeadProps = React.ThHTMLAttributes<HTMLTableHeaderCellElement> & {
  className?: string;
  children: React.ReactNode;
};

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  className?: string;
  children: React.ReactNode;
};

export const Table: React.FC<TableProps> = ({ className = '', children, ...props }) => (
  <div className="w-full overflow-auto">
    <table className={`w-full caption-bottom text-sm ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<TableHeaderProps> = ({ className = '', ...props }) => (
  <thead className={`[&_tr]:border-b ${className}`} {...props} />
);

export const TableBody: React.FC<TableBodyProps> = ({ className = '', ...props }) => (
  <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props} />
);

export const TableRow: React.FC<TableRowProps> = ({ className = '', ...props }) => (
  <tr
    className={`border-b border-gray-800 transition-colors hover:bg-gray-800/50 data-[state=selected]:bg-gray-800 ${className}`}
    {...props}
  />
);

export const TableHead: React.FC<TableHeadProps> = ({ className = '', ...props }) => (
  <th
    className={`h-12 px-4 text-left align-middle font-medium text-gray-400 [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  />
);

export const TableCell: React.FC<TableCellProps> = ({ className = '', ...props }) => (
  <td
    className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  />
);
