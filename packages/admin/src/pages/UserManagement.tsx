import { useState, useMemo } from 'react';
import {
  Users, ShieldCheck, UserCheck, Clock,
  Search, Pencil, UserX,
} from 'lucide-react';
import { Card, Badge, Button, cn } from '@erp/ui';

const ROLE_BADGE: Record<string, 'danger' | 'info' | 'default'> = {
  admin: 'danger',
  manager: 'info',
  user: 'default',
};

const STATUS_BADGE: Record<string, 'success' | 'default' | 'warning'> = {
  active: 'success',
  inactive: 'default',
  pending: 'warning',
};

const AVATAR_COLORS: Record<string, string> = {
  JM: 'bg-blue-600',
  SC: 'bg-violet-600',
  MR: 'bg-emerald-600',
  EW: 'bg-amber-600',
  DP: 'bg-cyan-600',
  LJ: 'bg-pink-600',
  RK: 'bg-slate-500',
  AT: 'bg-rose-600',
  JW: 'bg-teal-600',
  NB: 'bg-orange-600',
};

const ROLE_FILTERS = ['All', 'Admin', 'Manager', 'User'] as const;

export function UserManagement() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  const users = useMemo(() => [
    { id: 'u-1', name: 'John Mitchell', email: 'john@acme-mfg.com', role: 'admin', tenant: 'Acme Manufacturing', status: 'active', lastLogin: '2 min ago', avatar: 'JM' },
    { id: 'u-2', name: 'Sarah Chen', email: 'sarah@pacific-steel.com', role: 'admin', tenant: 'Pacific Steel Works', status: 'active', lastLogin: '15 min ago', avatar: 'SC' },
    { id: 'u-3', name: 'Mike Rodriguez', email: 'mike@coastal-fab.com', role: 'manager', tenant: 'Coastal Fabrication', status: 'active', lastLogin: '1 hour ago', avatar: 'MR' },
    { id: 'u-4', name: 'Emily Watson', email: 'emily@acme-mfg.com', role: 'user', tenant: 'Acme Manufacturing', status: 'active', lastLogin: '3 hours ago', avatar: 'EW' },
    { id: 'u-5', name: 'David Park', email: 'david@mountain-parts.com', role: 'manager', tenant: 'Mountain Parts Co.', status: 'active', lastLogin: '5 hours ago', avatar: 'DP' },
    { id: 'u-6', name: 'Lisa Johnson', email: 'lisa@tech-assemblies.com', role: 'user', tenant: 'Tech Assemblies Inc.', status: 'active', lastLogin: '1 day ago', avatar: 'LJ' },
    { id: 'u-7', name: 'Robert Kim', email: 'robert@pacific-steel.com', role: 'user', tenant: 'Pacific Steel Works', status: 'inactive', lastLogin: '5 days ago', avatar: 'RK' },
    { id: 'u-8', name: 'Amanda Torres', email: 'amanda@coastal-fab.com', role: 'admin', tenant: 'Coastal Fabrication', status: 'active', lastLogin: '30 min ago', avatar: 'AT' },
    { id: 'u-9', name: 'James Wilson', email: 'james@acme-mfg.com', role: 'user', tenant: 'Acme Manufacturing', status: 'pending', lastLogin: 'Never', avatar: 'JW' },
    { id: 'u-10', name: 'Nicole Brown', email: 'nicole@mountain-parts.com', role: 'user', tenant: 'Mountain Parts Co.', status: 'inactive', lastLogin: '2 weeks ago', avatar: 'NB' },
  ], []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = search === '' ||
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.tenant.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'All' || user.role === roleFilter.toLowerCase();
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">User Management</h1>
        <p className="text-xs text-text-muted mt-0.5">Manage platform users across all tenants.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-3.5 w-3.5 text-text-muted" />
            <p className="text-2xs text-text-muted">Total Users</p>
          </div>
          <p className="text-xl font-bold text-text-primary">487</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="h-3.5 w-3.5 text-text-muted" />
            <p className="text-2xs text-text-muted">Active Users</p>
          </div>
          <p className="text-xl font-bold text-text-primary">423</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-3.5 w-3.5 text-text-muted" />
            <p className="text-2xs text-text-muted">Admin Users</p>
          </div>
          <p className="text-xl font-bold text-text-primary">12</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-3.5 w-3.5 text-text-muted" />
            <p className="text-2xs text-text-muted">Pending Invites</p>
          </div>
          <p className="text-xl font-bold text-text-primary">8</p>
        </Card>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name, email, or tenant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-surface-0 pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>
        <div className="inline-flex items-center gap-1 rounded-lg bg-surface-2 p-1">
          {ROLE_FILTERS.map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                roleFilter === role
                  ? 'bg-surface-1 text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* User List */}
      <div className="space-y-2">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="p-4 hover:border-border-hover transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Avatar + Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white',
                    AVATAR_COLORS[user.avatar] || 'bg-slate-500'
                  )}
                >
                  {user.avatar}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-text-primary truncate">{user.name}</p>
                    <Badge variant={ROLE_BADGE[user.role]}>
                      {user.role}
                    </Badge>
                    <Badge variant={STATUS_BADGE[user.status]}>
                      {user.status}
                    </Badge>
                  </div>
                  <p className="text-2xs text-text-muted truncate">{user.email}</p>
                  <p className="text-2xs text-text-muted">{user.tenant}</p>
                </div>
              </div>

              {/* Last Login + Actions */}
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="text-right">
                  <p className="text-2xs text-text-muted">Last login</p>
                  <p className="text-xs text-text-secondary">{user.lastLogin}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="secondary">
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button size="sm" variant="secondary">
                    <UserX className="h-3 w-3" />
                    Deactivate
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-muted">No users found.</p>
            <p className="text-xs text-text-muted mt-0.5">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
