import { Link, useLocation } from "wouter";
import { Calendar, Settings, List, Moon } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "الرزنامة", icon: Calendar },
    { href: "/events", label: "المناسبات", icon: List },
    { href: "/settings", label: "الإعدادات الهلالية", icon: Moon },
  ];

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Moon className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-primary font-display hidden sm:block">
                Events Calendar
              </h1>
            </div>
            <div className="hidden md:flex md:mr-10 md:gap-x-8">
              {links.map((link) => {
                const isActive = location === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200
                      ${isActive 
                        ? "border-primary text-primary" 
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 ml-2" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
          {/* Mobile menu button could go here */}
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-border bg-muted/20">
        <div className="grid grid-cols-3">
          {links.map((link) => {
             const isActive = location === link.href;
             const Icon = link.icon;
             return (
               <Link 
                 key={link.href} 
                 href={link.href}
                 className={`
                   flex flex-col items-center justify-center py-3 text-xs font-medium
                   ${isActive ? "text-primary bg-primary/5" : "text-muted-foreground"}
                 `}
               >
                 <Icon className="w-5 h-5 mb-1" />
                 {link.label}
               </Link>
             )
          })}
        </div>
      </div>
    </nav>
  );
}
