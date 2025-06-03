import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import apiHandler from "../functions/apiHandler";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import {
  Plus,
  Search,
  Mail,
  User,
  Shield,
  MoreHorizontal,
  UserPlus,
  Clock,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

function TeamTab() {
  const { projectId } = useParams();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("DEVELOPER");

  const [project, setProject] = useState(null);

  // Get current user from Redux store
  const currentUser = useSelector((state) => state.user.user);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const res = await apiHandler({
        url: `projects/member-detail/${projectId}`,
      });
      console.log(res, "res");
      if (res.success) {
        setProject(res.data);
        // Use team members from project data
        if (res.data && res.data.memberDtos) {
          setTeamMembers(res.data.memberDtos || []);
        }
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    try {
      const res = await apiHandler({
        url: `api/invites`,
        method: "POST",
        data: {
          email: inviteEmail,
          role: inviteRole,
          projectIds: [Number(projectId)],
          workspaceId: currentUser?.workspaceId,
        },
      });

      if (res.success) {
        // Optionally add the invited user to the list with a pending status
        setInviteEmail("");
        setShowInvite(false);
        // Refresh project data which includes team members
        fetchProjectDetails();
      }
    } catch (error) {
      console.error("Error inviting user:", error);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "PROJECT_MANAGER":
        return "bg-purple-100 text-purple-800";
      case "DEVELOPER":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "ADMIN":
        return <Shield size={14} className="text-red-500" />;
      case "PROJECT_MANAGER":
        return <User size={14} className="text-purple-500" />;
      case "DEVELOPER":
        return <User size={14} className="text-blue-500" />;
      default:
        return <User size={14} className="text-gray-500" />;
    }
  };

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Team</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search team members"
              className="pl-8 h-9 w-[200px] md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => setShowInvite(true)} 
            disabled={currentUser?.role === "DEVELOPER"}
            title={currentUser?.role === "DEVELOPER" ? "Developers cannot invite team members" : "Invite team members"}
          >
            <UserPlus size={16} className="mr-1" /> Invite
          </Button>
        </div>
      </div>

      {showInvite && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Invite Team Member</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {currentUser?.role === "ADMIN" && (
                    <>
                      <option value="PROJECT_MANAGER">Project Manager</option>
                      <option value="DEVELOPER">Developer</option>
                    </>
                  )}
                  {currentUser?.role === "PROJECT_MANAGER" && (
                    <option value="DEVELOPER">Developer</option>
                  )}
                  {!currentUser?.role && (
                    <>
                      <option value="ADMIN">Admin</option>
                      <option value="PROJECT_MANAGER">Project Manager</option>
                      <option value="DEVELOPER">Developer</option>
                    </>
                  )}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowInvite(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInvite}>Send Invitation</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full mr-4" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground mb-2">No team members found</p>
          <Button variant="outline" onClick={() => setShowInvite(true)}>
            <UserPlus size={16} className="mr-1" /> Invite team members
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMembers.map((member) => (
            <Card
              key={member.id}
              className="hover:bg-muted/20 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarImage src={member.avatar} alt={member.firstName} />
                    <AvatarFallback>
                      {member.firstName?.charAt(0) ||
                        member.email?.charAt(0) ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">
                      {member.firstName || "Unnamed User"}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail size={14} className="mr-1" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(
                        member.role
                      )}`}
                    >
                      {getRoleIcon(member.role)}
                      <span className="ml-1">
                        {member.role?.replace("_", " ") || "Member"}
                      </span>
                    </span>
                    <Button variant="ghost" size="icon" className="ml-2">
                      <MoreHorizontal size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default TeamTab;
