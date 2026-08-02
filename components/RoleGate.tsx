'use client';

import React from 'react';
import { RoleGate as ContextRoleGate, RoleGateProps, useRBAC, UserRole } from '@/lib/rbac-context';

export function RoleGate({ allowedRoles, children, fallback }: RoleGateProps) {
  return (
    <ContextRoleGate allowedRoles={allowedRoles} fallback={fallback}>
      {children}
    </ContextRoleGate>
  );
}

export { useRBAC };
export type { UserRole, RoleGateProps };
