import axiosClient from "@/lib/axiosClient";
import { useState, useEffect } from "react";
interface StaffData {
  staff_id: number;
  username: string;
  role: string;
  permissions: string[];
}

export const useStaffAuth = () => {
  const [staff, setStaff] = useState<StaffData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await axiosClient.get<StaffData>("/league-staff/me");

        if (response.status === 200 && response.data) {
          setStaff(response.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        setStaff(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, []);
  return { staff, loading, isAuthenticated };
};
