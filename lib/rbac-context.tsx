'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n-context';

export type UserRole = 'FIELD_ENUMERATOR' | 'PROVINCIAL_PIU' | 'FPMU_DIRECTOR';

export interface RolePermissions {
  canAccessSpatialMap: boolean;
  canSubmitFieldSurvey: boolean;
  canViewBasicTelemetry: boolean;
  canViewRegionalTelemetry: boolean;
  canViewGrmTickets: boolean;
  canViewSpatialLayers: boolean;
  canViewOperationalSummaries: boolean;
  canViewFinancialBurnRate: boolean;
  canViewBudgetFigures: boolean;
  canViewComplianceLogs: boolean;
  canAccessExportApi: boolean;
}

export const PERMISSIONS: Record<UserRole, RolePermissions> = {
  FIELD_ENUMERATOR: {
    canAccessSpatialMap: true,
    canSubmitFieldSurvey: true,
    canViewBasicTelemetry: true,
    canViewRegionalTelemetry: false,
    canViewGrmTickets: false,
    canViewSpatialLayers: false,
    canViewOperationalSummaries: false,
    canViewFinancialBurnRate: false,
    canViewBudgetFigures: false,
    canViewComplianceLogs: false,
    canAccessExportApi: false,
  },
  PROVINCIAL_PIU: {
    canAccessSpatialMap: true,
    canSubmitFieldSurvey: true,
    canViewBasicTelemetry: true,
    canViewRegionalTelemetry: true,
    canViewGrmTickets: true,
    canViewSpatialLayers: true,
    canViewOperationalSummaries: true,
    canViewFinancialBurnRate: true,
    canViewBudgetFigures: false,
    canViewComplianceLogs: false,
    canAccessExportApi: true,
  },
  FPMU_DIRECTOR: {
    canAccessSpatialMap: true,
    canSubmitFieldSurvey: true,
    canViewBasicTelemetry: true,
    canViewRegionalTelemetry: true,
    canViewGrmTickets: true,
    canViewSpatialLayers: true,
    canViewOperationalSummaries: true,
    canViewFinancialBurnRate: true,
    canViewBudgetFigures: true,
    canViewComplianceLogs: true,
    canAccessExportApi: true,
  },
};

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  district?: string;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr_001',
  name: 'Field Survey Staff',
  role: 'FIELD_ENUMERATOR',
  district: 'Quetta',
};

export interface RBACContextType {
  user: UserProfile;
  role: UserRole;
  setRole: (role: UserRole) => void;
  hasPermission: (allowedRoles: UserRole[]) => boolean;
  permissions: RolePermissions;
  hasCapability: (capability: keyof RolePermissions) => boolean;
}

const RBACContext = createContext<RBACContextType>({
  user: DEFAULT_USER,
  role: 'FIELD_ENUMERATOR',
  setRole: () => {},
  hasPermission: (allowedRoles: UserRole[]) => allowedRoles.includes('FIELD_ENUMERATOR'),
  permissions: PERMISSIONS.FIELD_ENUMERATOR,
  hasCapability: (capability: keyof RolePermissions) => PERMISSIONS.FIELD_ENUMERATOR[capability],
});

import { useSession } from 'next-auth/react';

export const RBACProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);

  useEffect(() => {
    if (session?.user) {
      const sessionRole = (session.user as any).role as UserRole;
      setUser({
        id: (session.user as any).id || 'usr_000',
        name: session.user.name || 'User',
        role: sessionRole || 'FIELD_ENUMERATOR',
        district: 'Quetta',
      });
    } else {
      setUser(DEFAULT_USER);
    }
  }, [session]);

  const setRole = (role: UserRole) => {
    // Only used for local override if needed, but primarily auth is source of truth now
    setUser((prev) => ({ ...prev, role }));
  };

  const hasPermission = (allowedRoles: UserRole[]) => {
    return allowedRoles.includes(user.role);
  };

  const hasCapability = (capability: keyof RolePermissions) => {
    return !!PERMISSIONS[user.role]?.[capability];
  };

  const currentPermissions = PERMISSIONS[user.role] || PERMISSIONS.FIELD_ENUMERATOR;

  return (
    <RBACContext.Provider
      value={{
        user,
        role: user.role,
        setRole,
        hasPermission,
        permissions: currentPermissions,
        hasCapability,
      }}
    >
      {children}
    </RBACContext.Provider>
  );
};

export const useRBAC = () => useContext(RBACContext);

export interface RoleGateProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGate: React.FC<RoleGateProps> = ({
  allowedRoles,
  children,
  fallback,
}) => {
  const { hasPermission } = useRBAC();
  const { t } = useI18n();

  if (!hasPermission(allowedRoles)) {
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }
    return (
      <div className="p-4 rounded-md bg-rose-500/10 border border-rose-500/30 text-sm text-rose-300 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <svg className="w-6 h-6 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>{t.roles.accessRestrictedMessage}</div>
      </div>
    );
  }

  return <>{children}</>;
};
