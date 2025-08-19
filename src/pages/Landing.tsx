import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, TrendingUp, Shield, Zap, Brain, Target } from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analytics",
      description: "Predictive insights for burnout prevention and turnover forecasting"
    },
    {
      icon: Users,
      title: "Psychological Safety",
      description: "Real-time sentiment analysis and engagement monitoring"
    },
    {
      icon: Target,
      title: "Smart Performance Management",
      description: "AI-assisted goal setting and automated feedback summaries"
    },
    {
      icon: TrendingUp,
      title: "Proactive Intelligence",
      description: "Early warning systems for workforce risks and opportunities"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "SOC 2 compliant with advanced data protection"
    },
    {
      icon: Zap,
      title: "Seamless Integration",
      description: "Connect with existing HRIS and communication platforms"
    }
  ];

  const stats = [
    { value: "74%", label: "Reduction in turnover" },
    { value: "3x", label: "Faster issue detection" },
    { value: "89%", label: "Manager satisfaction" },
    { value: "2.4x", label: "ROI in first year" }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Synergy Well</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-smooth">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-smooth">Pricing</a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-smooth">About</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-accent text-accent-foreground border-accent">
            AI-Powered Well-Being Intelligence
          </Badge>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 max-w-4xl mx-auto leading-tight">
            Transform Your Workplace with
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Predictive </span>
            Well-Being Intelligence
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Move beyond reactive HR management. Our AI-powered platform predicts burnout, prevents turnover, 
            and builds psychological safety before problems impact your business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-primary-foreground">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent text-accent-foreground">Features</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Proactive Intelligence for Modern HR
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI doesn't just analyze data—it predicts trends, prevents problems, 
              and empowers strategic decision-making.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-elegant transition-smooth border-border bg-card">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-card-foreground">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Transform Your Workplace?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join leading companies using AI to build better, more engaged workplaces.
            Start your transformation today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="bg-background text-primary hover:bg-background/90">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-primary rounded-md flex items-center justify-center">
                <Brain className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Synergy Well</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-smooth">Privacy</a>
              <a href="#" className="hover:text-foreground transition-smooth">Terms</a>
              <a href="#" className="hover:text-foreground transition-smooth">Contact</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2024 Synergy Well. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}