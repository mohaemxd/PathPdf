
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-10">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-pathpdf-600" />
          <Link to="/" className="font-semibold text-xl text-foreground">
            PathPDF
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/dashboard" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              to="/roadmaps" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              My Roadmaps
            </Link>
          </nav>
          
          <Button variant="outline" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
          <Button className="bg-pathpdf-600 hover:bg-pathpdf-700" asChild>
            <Link to="/register">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
