import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, subtitle, icon: Icon, iconColor = "text-medical-primary", trend }: StatsCardProps) {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {value}
            </p>
            {trend && (
              <p className={`text-sm mt-1 ${trend.isPositive ? 'text-medical-success' : 'text-medical-danger'}`}>
                <span className="mr-1">
                  {trend.isPositive ? '↑' : '↓'}
                </span>
                {trend.value}
              </p>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center`}>
            <Icon className={`${iconColor} text-xl h-6 w-6`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
