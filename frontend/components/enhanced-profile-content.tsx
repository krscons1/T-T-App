"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/components/auth-provider"
import {
  User,
  Settings,
  Bell,
  Shield,
  CreditCard,
  FileText,
  Clock,
  Award,
  Camera,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"

export function EnhancedProfileContent() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState("+1 (555) 123-4567")
  const [location, setLocation] = useState("San Francisco, CA")
  const [isVisible, setIsVisible] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
  })

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleSave = () => {
    // In real app, this would update the user profile
    setIsEditing(false)
  }

  const stats = [
    { label: "Total Translations", value: "12", icon: FileText, color: "from-blue-500 to-cyan-500" },
    { label: "Hours Processed", value: "2.5", icon: Clock, color: "from-green-500 to-emerald-500" },
    { label: "Accuracy Rate", value: "98.5%", icon: Award, color: "from-purple-500 to-pink-500" },
  ]

  return (
    <div
      className={`p-6 space-y-8 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
    >
      {/* Enhanced Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Profile Settings
            </h1>
            <p className="text-slate-400 text-lg">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      {/* Enhanced Profile Card */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-gradient-to-r from-blue-500 to-purple-500">
                <AvatarImage src="/placeholder.svg?height=96&width=96" />
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-2xl">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-3xl font-bold text-white">{user?.name}</h2>
              <p className="text-slate-400 text-lg">{user?.email}</p>
              <div className="flex gap-2">
                <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border-blue-500/30">
                  Premium User
                </Badge>
                <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30">
                  Verified
                </Badge>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-6 transition-all duration-300 ${
                isEditing
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              }`}
            >
              <Settings className="h-4 w-4 mr-2" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={index}
              className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Enhanced Personal Information */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                <User className="h-5 w-5 text-white" />
              </div>
              Personal Information
            </CardTitle>
            <CardDescription className="text-slate-400">
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300 font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  className="h-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 disabled:opacity-50 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing}
                  className="h-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 disabled:opacity-50 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-300 font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                  className="h-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 disabled:opacity-50 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-slate-300 font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={!isEditing}
                  className="h-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 disabled:opacity-50 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Account Settings */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                <Settings className="h-5 w-5 text-white" />
              </div>
              Account Settings
            </CardTitle>
            <CardDescription className="text-slate-400">
              Manage your account preferences and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-sm text-slate-400">Receive updates about your translations</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium">Push Notifications</p>
                    <p className="text-sm text-slate-400">Get notified on your device</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, push: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">SMS Notifications</p>
                    <p className="text-sm text-slate-400">Receive text message updates</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, sms: checked }))}
                />
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                variant="outline"
                className="w-full h-12 bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 transition-all duration-300"
              >
                <Shield className="h-4 w-4 mr-2" />
                Privacy Settings
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 transition-all duration-300"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Billing & Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Danger Zone */}
      <Card className="bg-red-900/20 backdrop-blur-xl border-red-700/50 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-red-400 text-xl">Danger Zone</CardTitle>
          <CardDescription className="text-slate-400">Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-red-900/10 rounded-xl border border-red-700/30">
            <div>
              <p className="text-white font-medium">Delete Account</p>
              <p className="text-sm text-slate-400">Permanently delete your account and all associated data</p>
            </div>
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700 shadow-lg">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
