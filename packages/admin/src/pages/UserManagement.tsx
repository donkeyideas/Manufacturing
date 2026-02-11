import { useState, useMemo } from 'react';
import {
  Users, ShieldCheck, UserCheck, Clock,
  Search, Pencil, UserX, UserPlus, Loader2,
} from 'lucide-react';
import { Card, Badge, Button, cn } from '@erp/ui';
import { formatDistanceToNow } from 'date-fns';
import {
  usePlatformUsers,
  useTenants,
  useDeactivateUser,
  useActivateUser,
} from '../data-layer/useAdminData';

const ROLE_BADGE: Record<string, 'danger' | 'info' | 'default'> = {
  admin: 'danger',
  manager: 'info',
  user: 'default',
};

const ROLE_FILTERS = ['All', 'Admin', 'Manager', 'User'] as const;

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-violet-600', 'bg-emerald-600', 'bg-amber-600',
  'bg-cyan-600', 'bg-pink-600', 'bg-rose-600', 'bg-teal-600',
  'bg-orange-600', 'bg-indigo-600', 'bg-lime-600', 'bg-fuchsia-600',
];

function getAvatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(firstName: string, lastName: string) {
  return `${(firstName?.[0] ?? '').toUpperCase()}${(lastName?.[0] ?? '').toUpperCase()}`;
}

function formatLastLogin(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return 'Unknown';
  }
}

function SkeletonRow() {
  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 animate-pulse">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-9 w-9 rounded-full bg-surface-2 shrink-0" />
          <div className="min-w-0 space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <div className="h-3 w-28 rounded bg-surface-2" />
              <div className="h-4 w-12 rounded-full bg-surface-2" />
              <div className="h-4 w-12 rounded-full bg-surface-2" />
            </div>
            <div className="h-2.5 w-40 rounded bg-surface-2" />
            <div className="h-2.5 w-32 rounded bg-surface-2" />
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-right space-y-1">
            <div className="h-2.5 w-14 rounded bg-surface-2" />
            <div className="h-3 w-20 rounded bg-surface-2" />
          </div>
          <div className="flex items-center gap-1">
            <div className="h-7 w-14 rounded bg-surface-2" />
            <div className="h-7 w-20 rounded bg-surface-2" />
          </div>
        </div>
      </div>
    </Card>
  );
}

function SkeletonStat() {
  return (
    <Card className="p-3 animate-pulse">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-3.5 w-3.5 rounded bg-surface-2" />
        <div className="h-2.5 w-16 rounded bg-surface-2" />
      </div>
      <div className="h-6 w-10 rounded bg-surface-2 mt-1" />
    </Card>
  );
}

export function UserManagement() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  const { data: users = [], isLoading: usersLoading } = usePlatformUsers();
  const { data: tenants = [], isLoading: tenantsLoading } = useTenants();
  const deactivateUser = useDeactivateUser();
  const activateUser = useActivateUser();

  const isLoading = usersLoading || tenantsLoading;

  // Build a tenantId -> name lookup map
  const tenantMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of tenants) {
      map.set(t.id, t.name);
    }
    return map;
  }, [tenants]);

  // Compute stats from real data
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive !== false).length;
    const admins = users.filter((u) => u.role === 'admin').length;
    const inactive = users.filter((u) => u.isActive === false).length;
    return { total, active, admins, inactive };
  }, [users]);

  // Filter users by search term and role
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const tenantName = (tenantMap.get(user.tenantId) ?? '').toLowerCase();
      const matchesSearch =
        search === '' ||
        fullName.includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        tenantName.includes(search.toLowerCase());
      const matchesRole =
        roleFilter === 'All' || user.role === roleFilter.toLowerCase();
      return matchesSearch && matchesRole;
    });
  }, [users, tenantMap, search, roleFilter]);

  async function handleDeactivate(id: string) {
    try {
      await deactivateUser.mutateAsync(id);
    } catch {
      // Mutation error — React Query will surface it if needed
    }
  }

  async function handleActivate(id: string) {
    try {
      await activateUser.mutateAsync(id);
    } catch {
      // Mutation error — React Query will surface it if needed
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">User Management</h1>
        <p className="text-xs text-text-muted mt-0.5">Manage platform users across all tenants.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </>
        ) : (
          <>
            <Card className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-3.5 w-3.5 text-text-muted" />
                <p className="text-2xs text-text-muted">Total Users</p>
              </div>
              <p className="text-xl font-bold text-text-primary">{stats.total}</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <UserCheck className="h-3.5 w-3.5 text-text-muted" />
                <p className="text-2xs text-text-muted">Active Users</p>
              </div>
              <p className="text-xl font-bold text-text-primary">{stats.active}</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-3.5 w-3.5 text-text-muted" />
                <p className="text-2xs text-text-muted">Admin Users</p>
              </div>
              <p className="text-xl font-bold text-text-primary">{stats.admins}</p>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-3.5 w-3.5 text-text-muted" />
                <p className="text-2xs text-text-muted">Inactive Users</p>
              </div>
              <p className="text-xl font-bold text-text-primary">{stats.inactive}</p>
            </Card>
          </>
        )}
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
        {isLoading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : (
          <>
            {filteredUsers.map((user) => {
              const initials = getInitials(user.firstName, user.lastName);
              const fullName = `${user.firstName} ${user.lastName}`.trim();
              const tenantName = tenantMap.get(user.tenantId) ?? user.tenantId;
              const isActive = user.isActive !== false;
              const isMutating =
                (deactivateUser.isPending && deactivateUser.variables === user.id) ||
                (activateUser.isPending && activateUser.variables === user.id);

              return (
                <Card key={user.id} className="p-4 hover:border-border-hover transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Avatar + Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white',
                          getAvatarColor(user.id)
                        )}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-text-primary truncate">
                            {fullName}
                          </p>
                          <Badge variant={ROLE_BADGE[user.role] ?? 'default'}>
                            {user.role}
                          </Badge>
                          <Badge variant={isActive ? 'success' : 'default'}>
                            {isActive ? 'active' : 'inactive'}
                          </Badge>
                        </div>
                        <p className="text-2xs text-text-muted truncate">{user.email}</p>
                        <p className="text-2xs text-text-muted">{tenantName}</p>
                      </div>
                    </div>

                    {/* Last Login + Actions */}
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="text-right">
                        <p className="text-2xs text-text-muted">Last login</p>
                        <p className="text-xs text-text-secondary">
                          {formatLastLogin(user.lastLoginAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="secondary">
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>
                        {isActive ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={isMutating}
                            onClick={() => handleDeactivate(user.id)}
                          >
                            {isMutating ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <UserX className="h-3 w-3" />
                            )}
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={isMutating}
                            onClick={() => handleActivate(user.id)}
                          >
                            {isMutating ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <UserPlus className="h-3 w-3" />
                            )}
                            Activate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-8 w-8 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-muted">No users found.</p>
                <p className="text-xs text-text-muted mt-0.5">Try adjusting your search or filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
