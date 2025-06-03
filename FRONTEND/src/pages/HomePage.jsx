import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LayoutDashboard, Users, BookOpen, BarChart3, Zap, CheckCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@/redux/features/user/userSlice";

export default function HomePage() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  const handleGetStarted = (e) => {
    e.preventDefault();
    navigate(isAuthenticated ? '/projects' : '/auth/login');
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    navigate(isAuthenticated ? '/projects' : '/auth/register');
  };
  const features = [
    {
      icon: <LayoutDashboard className="h-6 w-6" />,
      title: "Intuitive Dashboard",
      description: "Get a clear overview of all your projects, tasks, and team activity in one place."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Collaboration",
      description: "Work seamlessly with your team members, assign tasks, and track progress together."
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Project Management",
      description: "Organize your projects with sprints, backlogs, and agile methodologies."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Analytics & Reports",
      description: "Gain insights into your team's performance and project progress with detailed analytics."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "AI-Powered Features",
      description: "Leverage AI to detect scope creep, generate retrospectives, and identify risks."
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Task Management",
      description: "Create, assign, and track tasks with an intuitive drag-and-drop interface."
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Project Management,
            <br />
            <span className="text-foreground">Simplified</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline your workflow, collaborate with your team, and deliver projects on time with our intuitive project management platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="gap-2 group"
              onClick={handleGetStarted}
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Powerful Features</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage projects efficiently and effectively
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to get started?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of teams who manage their projects with our platform.
          </p>
          <Button 
            size="lg" 
            className="gap-2 group"
            onClick={handleCreateAccount}
          >
            {isAuthenticated ? 'Go to Projects' : 'Create your free account'}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </section>
    </div>
  );
}
