// src/pages/AdminDashboard/UsersPage.tsx
import React, { useEffect, useState } from "react";
import { UserX, UserCheck } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import ConfirmModal from "./ConfirmModal";
import { Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";

type UserItem = {
  id: number;
  name?: string | null;
  email?: string | null;
  is_banned?: boolean | null;
  role?: string;
};

const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useAuth();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"delete" | "ban" | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleOpenModal = (id: number, action: "delete" | "ban") => {
    setSelectedUserId(id);
    setModalAction(action);
    setModalOpen(true);
  };

  const loadUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiService.getAllUsers(token);
      const mapped = data.map((u: any) => ({
        ...u,
        is_banned: u.status,
      }));
      setUsers(mapped);
    } catch (err) {
      console.error(err);
      toast.error(t("adminDashboard.usersPage.errorLoading"));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedUserId || !token || !modalAction) return;

    setActionLoading(selectedUserId);
    try {
      if (modalAction === "delete") {
        await apiService.deleteUser(selectedUserId, token);
        setUsers((prev) => prev.filter((u) => u.id !== selectedUserId));
        toast.success(t("adminDashboard.usersPage.delete") + " ✅");
      }

      if (modalAction === "ban") {
        await apiService.toggleBan(selectedUserId, token);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUserId ? { ...u, is_banned: !u.is_banned } : u
          )
        );
        toast.success(t("adminDashboard.usersPage.status") + " ✅");
      }
    } catch (err) {
      console.error(err);
      toast.error(t("adminDashboard.usersPage.errorLoading"));
    } finally {
      setActionLoading(null);
      setModalOpen(false);
      setSelectedUserId(null);
      setModalAction(null);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [token]);

  // Ant Design Table columns
  const columns: ColumnsType<UserItem> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      align: "center",
      render: (id: number) => (
        <span className="text-gray-300 text-sm">{id}</span>
      ),
    },
    {
      title: t("adminDashboard.usersPage.name") || "Name",
      dataIndex: "name",
      key: "name",
      width: 10,
      render: (name: string | null) => (
        <span className="font-medium text-white text-sm">{name ?? "-"}</span>
      ),
    },
    {
      title: t("adminDashboard.usersPage.email") || "Email",
      dataIndex: "email",
      key: "email",
      width: 100,
      render: (email: string | null) => (
        <span className="text-gray-300 text-sm">{email ?? "-"}</span>
      ),
    },
    {
      title: t("adminDashboard.usersPage.role") || "Role",
      dataIndex: "role",
      key: "role",
      width: 100,
      align: "center",
      render: (role: string | undefined) => {
        if (!role) {
          return <span className="text-gray-400 text-sm">-</span>;
        }
        return (
          <span
            className={`text-sm font-medium ${
              role.toLowerCase() === "admin"
                ? "text-orange-400"
                : "text-gray-300"
            }`}
          >
            {role}
          </span>
        );
      },
    },
    {
      title: t("adminDashboard.usersPage.status") || "Status",
      dataIndex: "is_banned",
      key: "is_banned",
      width: 130,
      align: "center",
      render: (is_banned: boolean | null) => {
        if (is_banned) {
          return (
            <div className="inline-flex items-center gap-2 px-3 py-1 text-green-400 font-medium text-sm status-green rounded-md">
              {t("adminDashboard.usersPage.notBanned")}
            </div>
          );
        }
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 text-red-400 font-medium text-sm status-red rounded-md">
            {t("adminDashboard.usersPage.banned")}
          </div>
        );
      },
    },
    {
      title: t("adminDashboard.usersPage.actions") || "Actions",
      key: "actions",
      width: 100,
      fixed: "right",
      align: "center",
      onHeaderCell: () => ({
        style: { width: 100, minWidth: 30 },
      }),
      onCell: () => ({
        style: { width: 100, minWidth: 30 },
      }),
      render: (_: any, user: UserItem) => (
        <div className="flex items-center gap-3 justify-end w-full">
          <Tooltip
            title={
              user.is_banned
                ? t("adminDashboard.usersPage.ban")
                : t("adminDashboard.usersPage.unban")
            }
          >
            <button
              onClick={() => handleOpenModal(user.id, "ban")}
              disabled={actionLoading === user.id}
              className={`
          action-btn inline-flex items-center gap-1.5
          ${!user.is_banned ? "btn-yellow" : "btn-red"}
          disabled:opacity-50
        `}
            >
              {user.is_banned ? <UserX size={14} /> : <UserCheck size={14} />}
              <span className="text-xs">
                {user.is_banned
                  ? t("adminDashboard.usersPage.ban")
                  : t("adminDashboard.usersPage.unban")}
              </span>
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">
          {t("adminDashboard.usersPage.title")}
        </h1>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition cursor-pointer disabled:opacity-50"
        >
          {t("adminDashboard.usersPage.refreshBtn")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          className="
    bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50
    backdrop-blur-xl border border-white/10 shadow-2xl 
    rounded-2xl p-6 flex items-center gap-3
  "
        >
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <UserCheck size={32} className="text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">
              {t("adminDashboard.usersPage.totalUsers")}
            </p>
            <p className="text-3xl font-bold text-white mt-1">{users.length}</p>
          </div>
        </div>

        {/* Bloklanmagan foydalanuvchilar */}
        <div
          className="
    bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50
    backdrop-blur-xl border border-white/10 shadow-2xl 
    rounded-2xl p-6 flex items-center gap-3
  "
        >
          <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
            <UserCheck size={32} className="text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">
              {t("adminDashboard.usersPage.activeUsers")}
            </p>
            <p className="text-3xl font-bold text-white mt-1">
              {users.filter((u) => u.is_banned).length}
            </p>
          </div>
        </div>

        <div
          className="
    bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50
    backdrop-blur-xl border border-white/10 shadow-2xl 
    rounded-2xl p-6 flex items-center gap-3
  "
        >
          <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
            <UserX size={32} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">
              {t("adminDashboard.usersPage.bannedUsers")}
            </p>
            <p className="text-3xl font-bold text-white mt-1">
              {users.filter((u) => !u.is_banned).length}
            </p>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-gradient-to-br from-[#0a1b30]/50 to-[#071226]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="antd-dark-table">
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={{
              className: "custom-pagination",
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "15", "20"],
              locale: {
                items_per_page: "/ page",
              },
            }}
            scroll={{ x: "max-content" }}
            locale={{
              emptyText: (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">
                    {t("adminDashboard.usersPage.noUsers") || "No users found"}
                  </p>
                </div>
              ),
            }}
          />
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        title={
          modalAction === "delete"
            ? t("adminDashboard.usersPage.deleteModalTitle")
            : t("adminDashboard.usersPage.banModalTitle")
        }
        message={
          modalAction === "delete"
            ? t("adminDashboard.usersPage.confirmDelete")
            : t("adminDashboard.usersPage.confirmBan")
        }
        isLoading={actionLoading === selectedUserId}
      />
    </div>
  );
};

export default UsersPage;
