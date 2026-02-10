import { useMemo } from 'react';
import { Users } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  DataTable,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@erp/ui';
import type { ColumnDef } from '@tanstack/react-table';

const users = [
  {
    name: 'John Mitchell',
    email: 'john@precision-mfg.com',
    role: 'Admin',
    department: 'IT',
    status: 'Active',
    lastLogin: '2 hours ago',
  },
  {
    name: 'Sarah Chen',
    email: 'sarah@precision-mfg.com',
    role: 'Manager',
    department: 'Operations',
    status: 'Active',
    lastLogin: '1 day ago',
  },
  {
    name: 'Mike Rodriguez',
    email: 'mike@precision-mfg.com',
    role: 'Manager',
    department: 'Sales',
    status: 'Active',
    lastLogin: '3 hours ago',
  },
  {
    name: 'Emily Watson',
    email: 'emily@precision-mfg.com',
    role: 'Accountant',
    department: 'Finance',
    status: 'Active',
    lastLogin: '1 day ago',
  },
  {
    name: 'James Park',
    email: 'james@precision-mfg.com',
    role: 'Operator',
    department: 'Manufacturing',
    status: 'Active',
    lastLogin: '5 hours ago',
  },
  {
    name: 'Lisa Thompson',
    email: 'lisa@precision-mfg.com',
    role: 'HR Manager',
    department: 'HR',
    status: 'Active',
    lastLogin: '2 days ago',
  },
  {
    name: 'David Kim',
    email: 'david@precision-mfg.com',
    role: 'Buyer',
    department: 'Procurement',
    status: 'Active',
    lastLogin: '1 day ago',
  },
  {
    name: 'Jane Doe',
    email: 'jane@precision-mfg.com',
    role: 'Viewer',
    department: '',
    status: 'Invited',
    lastLogin: 'Never',
  },
];

const ROLE_VARIANTS = {
  Admin: 'primary',
  Manager: 'info',
  Accountant: 'warning',
  Operator: 'default',
  Buyer: 'default',
  'HR Manager': 'info',
  Viewer: 'default',
} as const;

const STATUS_VARIANTS = {
  Active: 'success',
  Invited: 'info',
  Disabled: 'danger',
} as const;

const roles = [
  {
    name: 'Admin',
    description: 'Full system access',
    userCount: 2,
    modules: ['All Modules'],
  },
  {
    name: 'Manager',
    description: 'Read/write access to assigned modules',
    userCount: 3,
    modules: ['Operations', 'Sales', 'Manufacturing', 'Inventory'],
  },
  {
    name: 'Accountant',
    description: 'Full access to Financial module',
    userCount: 1,
    modules: ['Financial', 'Reports'],
  },
  {
    name: 'Operator',
    description: 'Read/write Manufacturing and Inventory',
    userCount: 1,
    modules: ['Manufacturing', 'Inventory'],
  },
  {
    name: 'Buyer',
    description: 'Full access to Procurement module',
    userCount: 1,
    modules: ['Procurement', 'Inventory'],
  },
  {
    name: 'HR Manager',
    description: 'Full access to HR & Payroll module',
    userCount: 1,
    modules: ['HR & Payroll', 'Reports'],
  },
  {
    name: 'Viewer',
    description: 'Read-only access to all modules',
    userCount: 1,
    modules: ['All Modules (Read-only)'],
  },
];

export default function UsersRolesPage() {
  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary">
            {row.original.email}
          </span>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <Badge
            variant={
              ROLE_VARIANTS[row.original.role as keyof typeof ROLE_VARIANTS] ?? 'default'
            }
          >
            {row.original.role}
          </Badge>
        ),
      },
      {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary">
            {row.original.department || '\u2014'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant={
              STATUS_VARIANTS[row.original.status as keyof typeof STATUS_VARIANTS] ?? 'default'
            }
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'lastLogin',
        header: 'Last Login',
        cell: ({ row }) => (
          <span className="text-xs text-text-muted">
            {row.original.lastLogin}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900">
          <Users className="h-5 w-5 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Users & Roles</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage user accounts and role-based access
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={users}
                searchPlaceholder="Search users..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles">
          <div className="space-y-4">
            {roles.map((role) => (
              <Card key={role.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle>{role.name}</CardTitle>
                      <Badge variant="default">
                        {role.userCount} {role.userCount === 1 ? 'user' : 'users'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-text-secondary mb-3">
                    {role.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {role.modules.map((mod) => (
                      <span
                        key={mod}
                        className="inline-flex items-center rounded-md bg-surface-2 px-2 py-1 text-2xs font-medium text-text-secondary"
                      >
                        {mod}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
