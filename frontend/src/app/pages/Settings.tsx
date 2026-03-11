import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";

import { IntegrationSettings } from "./IntegrationSettings";

import { User } from "lucide-react";

export function Settings() {
  const { t } = useLanguage();
  const { user } = useAuth();
  // const user = {
  //   firstName: "John",
  //   lastName: "Doe",
  //   email: "john.doe@example.com"
  // };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {t("nav.settings")}
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* ============================= */}
      {/* Profile Information */}
      {/* ============================= */}

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>

          <CardDescription>
            Update your personal information and profile photo
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>

            <div>
              <Button variant="outline" size="sm">
                Change Photo
              </Button>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                JPG, PNG or GIF. Max 2MB
              </p>
            </div>
          </div>

          <Separator />

          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input defaultValue={user?.name || ""} />
            </div>

            {/* <div className="space-y-2">
              <Label>Last Name</Label>
              <Input defaultValue={user?.lastName || ""} />
            </div> */}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email</Label>

            <Input type="email" defaultValue={user?.email || ""} />
          </div>
        </CardContent>
      </Card>

      {/* ============================= */}
      {/* Change Password */}
      {/* ============================= */}

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>

          <CardDescription>
            Update your account password
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>

            <Input type="password" placeholder="Enter current password" />
          </div>

          <div className="space-y-2">
            <Label>New Password</Label>

            <Input type="password" placeholder="Enter new password" />
          </div>

          <div className="space-y-2">
            <Label>Confirm Password</Label>

            <Input type="password" placeholder="Confirm new password" />
          </div>
        </CardContent>
      </Card>

      {/* ============================= */}
      {/* Integrations (CompanyAdmin only) */}
      {/* ============================= */}

      {user?.role === "companyAdmin" && (
        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>

            <CardDescription>
              Manage external service integrations
            </CardDescription>
          </CardHeader>

          <CardContent>
            <IntegrationSettings />
          </CardContent>
        </Card>
      )}

      {/* ============================= */}
      {/* Save Button */}
      {/* ============================= */}

      <div className="flex justify-end gap-2">
        <Button variant="outline">{t("common.cancel")}</Button>

        <Button>{t("common.save")}</Button>
      </div>
    </div>
  );
}