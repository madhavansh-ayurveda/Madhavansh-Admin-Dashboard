import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import { Users, Stethoscope, Calendar, IndianRupee } from "lucide-react";
import { adminApi } from "@/api/adminApi";
import { DashboardStats, ConsultationStats } from "@/types";
// import { setCredentials } from "@/store/authSlice";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector((state: { auth: { user: any } }) => state.auth.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [consultationStats, setConsultationStats] =
    useState<ConsultationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardStats, consultationStats] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getConsultationStats(),
        ]);
        console.log(dashboardStats, consultationStats);

        setStats(dashboardStats);
        setConsultationStats(consultationStats);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const statCards = [
    { name: "Total Patients", value: stats?.totalPatients || 0, icon: Users },
    {
      name: "Total Active Patients",
      value: stats?.uniqueConsultations || 0,
      icon: Users,
    },
    {
      name: "Total One Time Patients",
      value: stats?.totalOneTimePatients || 0,
      icon: Users,
    },
    {
      name: "Active Doctors",
      value: stats?.totalDoctors || 0,
      icon: Stethoscope,
    },
    {
      name: "Pending Consultations",
      value: consultationStats?.statusStats[0].result.pending.count || 0,
      icon: Calendar,
    },
    {
      name: "Comfirmed Consultations",
      value: consultationStats?.statusStats[0].result.confirmed?.count || 0,
      icon: Calendar,
    },
    {
      name: "Total Consultations",
      value: stats?.totalConsultations || 0,
      icon: Calendar,
    },
    {
      name: "Revenue",
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: IndianRupee,
    },
  ];

  // console.log(statCards);

  const monthlyData =
    consultationStats?.monthlyStats.map((stat) => ({
      name: `${stat._id.month}/${stat._id.year}`,
      consultations: stat.count,
      revenue: stat.totalAmount,
    })) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
      <p>User: {user?.name || "No user logged in"}</p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-50 rounded-lg">
                <stat.icon className="h-6 w-6 text-primary-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-medium mb-4">Monthly Overview</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="consultations"
                stroke="#6366f1"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
