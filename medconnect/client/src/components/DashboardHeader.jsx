import React from "react";

export function DashboardHeader({ userProfile }) {
  const displayName =
    userProfile?.fullName ||
    userProfile?.displayName ||
    userProfile?.email ||
    "Người dùng";

  return (
    <header
      className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        borderBottom: "1px solid rgba(43, 108, 176, 0.1)",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
      }}
    >
      <div className="container mx-auto px-4 py-4 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{
                background: "linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              MedConnect
            </h1>
            <p className="text-sm text-muted-foreground">Trang cá nhân bệnh nhân</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Chào, {displayName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
