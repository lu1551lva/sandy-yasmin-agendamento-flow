
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AdminHeaderProps {
  onLogout: () => void;
}

const AdminHeader = ({ onLogout }: AdminHeaderProps) => {
  const { adminData, isLoading } = useAdminProfile();
  
  return (
    <header className="sticky top-0 z-10 h-16 border-b bg-background flex items-center px-4 md:px-6">
      <div className="flex-1 ml-10 md:ml-0">
        <h1 className="text-lg font-semibold md:text-xl">Studio Sandy Yasmin</h1>
        <p className="text-sm text-muted-foreground">Painel Administrativo</p>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Skeleton className="w-8 h-8 rounded-full" />
          ) : (
            <Avatar className="h-8 w-8">
              <AvatarImage src={adminData?.avatar_url || undefined} alt={adminData?.nome || "Admin"} />
              <AvatarFallback>{adminData?.nome?.charAt(0) || "A"}</AvatarFallback>
            </Avatar>
          )}
          <span className="text-sm font-medium hidden md:block">
            {isLoading ? (
              <Skeleton className="w-24 h-4" />
            ) : (
              adminData?.nome || "Admin"
            )}
          </span>
        </div>
        
        <Button variant="outline" size="sm" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span className="hidden md:inline">Sair</span>
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;
