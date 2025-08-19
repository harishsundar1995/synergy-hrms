import Header from "@/components/Header";
import WellBeingDashboard from "@/components/WellBeingDashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Good morning, Jane 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's your well-being intelligence overview for today
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Last updated</p>
              <p className="text-sm font-medium">2 minutes ago</p>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <WellBeingDashboard />
      </main>
    </div>
  );
};

export default Index;