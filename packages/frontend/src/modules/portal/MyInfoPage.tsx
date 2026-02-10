import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@erp/ui';
import { Pencil, User, Briefcase, MapPin, Phone } from 'lucide-react';
import { useEmployeeProfile } from '../../data-layer/hooks/usePortal';

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-border last:border-0">
      <span className="text-xs text-text-muted w-32 flex-shrink-0">{label}</span>
      <span className="text-sm text-text-primary text-right">{value ?? '--'}</span>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  onEdit,
  children,
}: {
  title: string;
  icon: typeof User;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-text-muted" />
            <CardTitle>{title}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function MyInfoPage() {
  const { data: profileData } = useEmployeeProfile();
  const profile = useMemo(() => profileData, [profileData]);

  const handleEdit = () => {
    // In demo mode, show a simple alert
    alert('Feature coming soon in live mode.');
  };

  if (!profile) return null;

  const employmentTypeLabel: Record<string, string> = {
    full_time: 'Full Time',
    part_time: 'Part Time',
    contractor: 'Contractor',
    temporary: 'Temporary',
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">My Information</h1>
        <p className="text-xs text-text-muted">View and manage your personal information</p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xl font-bold">
              {profile.firstName[0]}{profile.lastName[0]}
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-sm text-text-muted">{profile.jobTitle}</p>
              <p className="text-xs text-text-muted">{profile.department} &middot; {profile.employeeNumber}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Personal Information */}
        <SectionCard title="Personal" icon={User} onEdit={handleEdit}>
          <InfoRow label="Full Name" value={`${profile.firstName} ${profile.lastName}`} />
          <InfoRow label="Email" value={profile.email} />
          <InfoRow label="Phone" value={profile.phone} />
        </SectionCard>

        {/* Employment Information */}
        <SectionCard title="Employment" icon={Briefcase} onEdit={handleEdit}>
          <InfoRow label="Employee ID" value={profile.employeeNumber} />
          <InfoRow label="Job Title" value={profile.jobTitle} />
          <InfoRow label="Department" value={profile.department} />
          <InfoRow label="Type" value={employmentTypeLabel[profile.employmentType]} />
          <InfoRow label="Hire Date" value={new Date(profile.hireDate + 'T12:00:00').toLocaleDateString()} />
          <InfoRow label="Work Location" value={profile.workLocation} />
          <InfoRow label="Manager" value={profile.managerName} />
        </SectionCard>

        {/* Address */}
        <SectionCard title="Address" icon={MapPin} onEdit={handleEdit}>
          {profile.address ? (
            <>
              <InfoRow label="Street" value={profile.address.line1} />
              {profile.address.line2 && <InfoRow label="Line 2" value={profile.address.line2} />}
              <InfoRow label="City" value={profile.address.city} />
              <InfoRow label="State" value={profile.address.state} />
              <InfoRow label="Postal Code" value={profile.address.postalCode} />
              <InfoRow label="Country" value={profile.address.country} />
            </>
          ) : (
            <p className="text-sm text-text-muted py-2">No address on file.</p>
          )}
        </SectionCard>

        {/* Emergency Contact */}
        <SectionCard title="Emergency Contact" icon={Phone} onEdit={handleEdit}>
          {profile.emergencyContact ? (
            <>
              <InfoRow label="Name" value={profile.emergencyContact.name} />
              <InfoRow label="Phone" value={profile.emergencyContact.phone} />
              <InfoRow label="Relationship" value={profile.emergencyContact.relationship} />
            </>
          ) : (
            <p className="text-sm text-text-muted py-2">No emergency contact on file.</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
