import React from "react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/Avatar";
import { Badge } from "../../../components/ui/Badge";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
} from "@ant-design/icons";

export function ProfileCard({ userProfile }) {
  if (!userProfile) {
    return (
      <Card className="medical-card profile-card fade-in">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-6 pt-8 pb-2">
            <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-gray-500">...</span>
            </div>
            <div className="space-y-2 w-full flex flex-col items-center">
              <h3 className="font-semibold text-lg text-gray-500 text-center">
                Đang tải...
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayName =
    userProfile.fullName || userProfile.displayName || "Người dùng";
  const email = userProfile.email || "Chưa cập nhật";
  const phone = userProfile.phone || "Chưa cập nhật";
  const avatar = userProfile.avatar || userProfile.photoURL;
  const profileComplete = userProfile.profileComplete || false;

  // Generate initials for fallback avatar
  const getInitials = (name) => {
    if (!name || name.trim() === "") return "U";

    // Remove extra spaces and split by space
    const words = name
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    if (words.length === 0) return "U";

    // If only one word, take first 2 characters
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    // If multiple words, take first character of first two words
    const initials = words
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();

    console.log("Name:", name, "Words:", words, "Initials:", initials);
    return initials;
  };

  return (
    <Card className="medical-card profile-card fade-in">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-6 pt-8 pb-2">
          <Avatar className="h-20 w-20 medical-avatar">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              <span className="text-lg font-semibold">
                {getInitials(displayName)}
              </span>
            </AvatarFallback>
          </Avatar>

          <div className="space-y-4 w-full flex flex-col items-center">
            <h3 className="font-semibold text-lg text-center">{displayName}</h3>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <MailOutlined style={{ fontSize: "16px" }} />
              <span className="text-center">{email}</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <PhoneOutlined style={{ fontSize: "16px" }} />
              <span className="text-center">{phone}</span>
            </div>

            <div className="flex justify-center pt-3">
              {profileComplete ? (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                >
                  Hồ sơ đầy đủ
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                >
                  Chưa đầy đủ
                </Badge>
              )}
            </div>
          </div>

          <Button
            className="w-full medical-button-outline mt-4"
            variant="outline"
          >
            <EditOutlined style={{ fontSize: "16px", marginRight: "8px" }} />
            Cập nhật hồ sơ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
