export interface NavItem {
  icon: string;
  label: string;
  path: string; // Sørg for at alle har path for router.push
}

export interface DashboardNavProps {
  darkMode: boolean;
  onDarkModeChange?: (isDark: boolean) => void;
}