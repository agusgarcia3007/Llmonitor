import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import {
  IconDevicesCancel,
  IconDots,
  IconLock,
  IconLockOpen2,
  IconTrash,
  IconUserCircle,
} from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { type ColumnDef } from "@tanstack/react-table";
import { useEffect, useState, type ReactNode } from "react";

import { toast } from "sonner";

// Define admin actions
const ADMIN_ACTIONS = {
  BAN_USER: "banUser",
  UNBAN_USER: "unbanUser",
  REMOVE_USER: "removeUser",
  SET_ROLE: "setRole",
  REVOKE_USER_SESSIONS: "revokeUserSessions",
  IMPERSONATE_USER: "impersonateUser",
  CHANGE_PLAN: "changePlan",
} as const;

type AdminActionKey = keyof typeof ADMIN_ACTIONS;
type AdminActionValue = (typeof ADMIN_ACTIONS)[AdminActionKey];

type AdminActionOption = {
  label: string;
  action: AdminActionValue;
  icon: ReactNode;
  payload?: Record<string, string>;
};

type UserApiRaw = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  plan?: string;
  banned?: boolean | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  plan?: string;
  banned?: boolean;
  createdAt: string;
  updatedAt: string;
};

export const Route = createFileRoute("/_dashboard/users")({
  component: UsersAdminPage,
});

export function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && (!session?.user || session.user.role !== "admin")) {
      navigate({ to: "/dashboard", search: { period: "1" } });
    }
  }, [isPending, session, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data } = await authClient.admin.listUsers({
        query: {
          limit: 10,
          offset: 0,
        },
      });
      setUsers(
        (data?.users || []).map((u: UserApiRaw) => ({
          id: u.id,
          name: u.name ?? "",
          email: u.email ?? "",
          role: u.role ?? "user",
          plan: u.plan ?? "",
          banned: !!u.banned,
          createdAt: u.createdAt ? String(u.createdAt) : "",
          updatedAt: u.updatedAt ? String(u.updatedAt) : "",
        }))
      );
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleAdminAction = async (
    action: string,
    payload: { userId: string; [key: string]: string }
  ) => {
    try {
      // Use the built-in admin client for other actions
      switch (action) {
        case ADMIN_ACTIONS.BAN_USER:
          await authClient.admin.banUser(payload);
          break;
        case ADMIN_ACTIONS.UNBAN_USER:
          await authClient.admin.unbanUser(payload);
          break;
        case ADMIN_ACTIONS.REMOVE_USER:
          await authClient.admin.removeUser(payload);
          break;
        case ADMIN_ACTIONS.REVOKE_USER_SESSIONS:
          await authClient.admin.revokeUserSessions(payload);
          break;
        case ADMIN_ACTIONS.IMPERSONATE_USER:
          await authClient.admin.impersonateUser(payload);
          break;
        default:
          throw new Error(`Unknown admin action: ${action}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to perform action");
    }
  };

  const getAdminActionsDropdownOptions = (user: User): AdminActionOption[] => {
    const options: AdminActionOption[] = [
      {
        label: "Delete User",
        action: ADMIN_ACTIONS.REMOVE_USER,
        icon: <IconTrash className="w-4 h-4" />,
      },
      {
        label: user.banned ? "Unban User" : "Ban User",
        action: user.banned ? ADMIN_ACTIONS.UNBAN_USER : ADMIN_ACTIONS.BAN_USER,
        icon: user.banned ? (
          <IconLockOpen2 className="w-4 h-4" />
        ) : (
          <IconLock className="w-4 h-4" />
        ),
      },
      {
        label: "Revoke User Sessions",
        action: ADMIN_ACTIONS.REVOKE_USER_SESSIONS,
        icon: <IconDevicesCancel className="w-4 h-4" />,
      },
      {
        label: "Impersonate User",
        action: ADMIN_ACTIONS.IMPERSONATE_USER,
        icon: <IconUserCircle className="w-4 h-4" />,
      },
    ];

    return options;
  };

  const columns: ColumnDef<User>[] = [
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Role",
      accessorKey: "role",
    },
    {
      header: "Plan",
      accessorKey: "plan",
    },
    {
      header: "Banned",
      accessorKey: "banned",
      cell: ({ row }) => {
        return (
          <Badge variant={row.original.banned ? "destructive" : "default"}>
            {row.original.banned ? "Yes" : "No"}
          </Badge>
        );
      },
    },
    {
      header: "Created At",
      accessorKey: "createdAt",
      cell: ({ row }) => {
        const createdAt = new Date(row.original.createdAt);
        return createdAt.toLocaleDateString();
      },
    },
    {
      header: "Updated At",
      accessorKey: "updatedAt",
      cell: ({ row }) => {
        const updatedAt = new Date(row.original.updatedAt);
        return updatedAt.toLocaleDateString();
      },
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <IconDots className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {getAdminActionsDropdownOptions(row.original).map((option) => (
              <DropdownMenuItem
                key={option.label}
                onSelect={async () => {
                  await handleAdminAction(option.action, {
                    userId: row.original.id,
                    ...option.payload,
                  });
                }}
              >
                {option.icon} {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isPending || !session?.user || session.user.role !== "admin") {
    return null;
  }

  return (
    <div className="container px-4 mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <DataTable data={users} columns={columns} isLoading={loading} />
    </div>
  );
}

export default UsersAdminPage;
