"use client";

import { NavLink } from "react-router-dom";
import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const GiftListNav = () => {
  const activeClassName = "bg-primary text-primary-foreground hover:bg-primary/90";
  const inactiveClassName = "bg-transparent text-primary hover:bg-primary/10";

  return (
    <nav className="flex flex-wrap justify-center gap-4 my-8">
      <NavLink to="/" end>
        {({ isActive }) => (
          <Button
            variant="outline"
            className={cn(isActive ? activeClassName : inactiveClassName)}
          >
            Disponíveis
          </Button>
        )}
      </NavLink>
      <NavLink to="/reserved">
        {({ isActive }) => (
          <Button
            variant="outline"
            className={cn(isActive ? activeClassName : inactiveClassName)}
          >
            Reservados
          </Button>
        )}
      </NavLink>
      <NavLink to="/purchased">
        {({ isActive }) => (
          <Button
            variant="outline"
            className={cn(isActive ? activeClassName : inactiveClassName)}
          >
            Comprados
          </Button>
        )}
      </NavLink>
    </nav>
  );
};