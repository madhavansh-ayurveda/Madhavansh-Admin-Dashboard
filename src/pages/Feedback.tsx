import { useEffect, useState } from "react";

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState([]);

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
