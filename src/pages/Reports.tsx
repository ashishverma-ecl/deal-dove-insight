import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileText, Calendar, User, LogOut, Filter } from "lucide-react";

interface Assessment {
  id: string;
  title: string;
  created_at: string;
  status: string;
}

const Reports = () => {
  const [user, setUser] = useState<any>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUserAndLoadAssessments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      
      setUser(user);
      
      // Load assessments
      const { data, error } = await supabase
        .from('assessments')
        .select('id, title, created_at, status')
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to load assessments",
          variant: "destructive",
        });
      } else {
        setAssessments(data || []);
        setFilteredAssessments(data || []);
      }
      
      setLoading(false);
    };
    
    checkUserAndLoadAssessments();
  }, [navigate, toast]);

  // Filter assessments based on year and month
  useEffect(() => {
    let filtered = assessments;

    if (selectedYear !== "all") {
      filtered = filtered.filter(assessment => 
        new Date(assessment.created_at).getFullYear().toString() === selectedYear
      );
    }

    if (selectedMonth !== "all") {
      filtered = filtered.filter(assessment => 
        (new Date(assessment.created_at).getMonth() + 1).toString() === selectedMonth
      );
    }

    setFilteredAssessments(filtered);
  }, [assessments, selectedYear, selectedMonth]);

  // Get unique years from assessments
  const getAvailableYears = () => {
    const years = assessments.map(assessment => 
      new Date(assessment.created_at).getFullYear()
    );
    return [...new Set(years)].sort((a, b) => b - a);
  };

  // Get months array
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/61690229-7cfd-4603-b3d7-cf1f5b7ccd95.png" 
              alt="Logo" 
              className="h-10 w-auto"
            />
            <div>
              <p className="text-lg font-bold text-foreground">Reputational Risk Assessment Solution</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user?.email}</span>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-2">Assessment Reports</h1>
          <p className="text-muted-foreground mb-6">
            View and manage your completed due diligence assessments
          </p>
          
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by:</span>
            </div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {getAvailableYears().map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredAssessments.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {assessments.length === 0 ? "No assessments found" : "No assessments match your filters"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {assessments.length === 0 
                  ? "You haven't created any assessments yet. Get started by creating your first assessment."
                  : "Try adjusting your filter criteria to see more results."
                }
              </p>
              {assessments.length === 0 && (
                <Link to="/create-assessment">
                  <Button>Create Your First Assessment</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredAssessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        {assessment.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(assessment.created_at)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          assessment.status === 'completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {assessment.status}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Link to={`/assessment/${assessment.id}`}>
                      <Button size="sm">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Reports;