import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
// src/pages/Admin/index
import React, { useEffect } from "react";

import AdminLayout from "./components/AdminLayout";

const AdminPage = () => {
  const user = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const role = user.role;

    // 管理者でなければリダイレクト
    if (role !== "admin") {
      navigate("/main");
    }
  }, [navigate, user.role]);

  return (
    <div style={{ padding: "1rem" }}>
      <AdminLayout>ddd</AdminLayout>
    </div>
  );
};

export default AdminPage;
