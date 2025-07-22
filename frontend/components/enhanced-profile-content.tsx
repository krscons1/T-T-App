"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/components/auth-provider"
import { User, Mail, Phone, MapPin, Settings, Bell, Smartphone, MessageSquare, Save, Trash2 } from "lucide-react"

export function EnhancedProfileContent() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "Google User",
    email: user?.email || "user@gmail.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
  })

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
  })

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically save to your backend
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNotificationChange = (type: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [type]: value }))
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-700">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
            {user?.name?.charAt(0) || "U"}
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-slate-400 mt-2">Manage your account information and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
          <CardHeader className="border-b border-slate-700/50">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                <User className="h-5 w-5 text-white" />
              </div>
              Personal Information
            </CardTitle>
            <p className="text-slate-400 text-sm">Update your personal details and contact information</p>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={!isEditing}
                  className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditing}
                  className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-300 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={!isEditing}
                  className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-slate-300 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  disabled={!isEditing}
                  className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
          <CardHeader className="border-b border-slate-700/50">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500">
                <Settings className="h-5 w-5 text-white" />
              </div>
              Account Settings
            </CardTitle>
            <p className="text-slate-400 text-sm">Manage your account preferences and notifications</p>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Notification Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500">
                    <Bell className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-slate-400 text-sm">Receive updates about your translations</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                    <Smartphone className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Push Notifications</p>
                    <p className="text-slate-400 text-sm">Get notified on your device</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => handleNotificationChange("push", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">SMS Notifications</p>
                    <p className="text-slate-400 text-sm">Receive text message updates</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(checked) => handleNotificationChange("sms", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="bg-red-900/20 border-red-700/50 backdrop-blur-xl">
        <CardHeader className="border-b border-red-700/50">
          <CardTitle className="flex items-center gap-3 text-red-400">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <p className="text-red-300/70 text-sm">Irreversible and destructive actions</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Delete Account</h3>
              <p className="text-slate-400 text-sm">Permanently delete your account and all associated data</p>
            </div>
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
