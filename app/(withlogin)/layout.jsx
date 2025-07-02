import React from "react";
import Sidebar from "@/Components/Sidebar";
import Navbar from "@/Components/Navbar";

const layout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <div className="p-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default layout;
