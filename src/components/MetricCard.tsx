import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: "up" | "down" | "neutral";
  status?: "success" | "warning" | "danger" | "neutral";
  icon?: React.ReactNode;
  subtitle?: string;
}

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeLabel,
  trend = "neutral", 
  status = "neutral",
  icon,
  subtitle
}: MetricCardProps) => {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4" />;
      case "down":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return status === "danger" ? "text-destructive" : "text-success";
      case "down":
        return status === "success" ? "text-success" : "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "success":
        return <Badge variant="secondary" className="bg-success/10 text-success border-success/20">Healthy</Badge>;
      case "warning":
        return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">At Risk</Badge>;
      case "danger":
        return <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">Critical</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {change !== undefined && (
          <div className={`flex items-center text-xs mt-2 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="ml-1">
              {change > 0 ? "+" : ""}{change}%
            </span>
            {changeLabel && (
              <span className="ml-1 text-muted-foreground">
                {changeLabel}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;