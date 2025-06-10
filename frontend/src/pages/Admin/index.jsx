// src/pages/Admin/index
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getValue } from "../../utils/localStorageUtils";
import AdminLayout from "./components/AdminLayout";

const AdminPage = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const name = getValue("userName");
    const role = getValue("role");

    // 管理者でなければリダイレクト
    if (role !== "admin") {
      navigate("/main");
    } else {
      setUserName(name);
    }
  }, [navigate]);

  return (
    <div style={{ padding: "1rem" }}>
      <AdminLayout>ddd</AdminLayout>
    </div>
  );
};

export default AdminPage;
