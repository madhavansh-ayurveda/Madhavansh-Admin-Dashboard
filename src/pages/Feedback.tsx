import AccessDenied from "@/components/AccessDenied";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState([]);
  const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");
  if (
    !permissions?.includes("feedback") &&
    Cookies.get("role") !== "super_admin"
  ) {
    return <AccessDenied />;
  }
  useEffect(() => {
    const fetchFeedback = async () => {
      // Fetch feedback data from the API
      const response = await fetch("/api/feedback"); // Adjust the API endpoint as necessary
      const data = await response.json();
      setFeedback(data);
    };

    fetchFeedback();
  }, []);

  return (
    <>
      <div className="flex">
        {/* Render feedback data */}
        {feedback.map((item) => (
          <>{item}</>
        ))}
      </div>
    </>
  );
}
