import { useEffect, useRef } from "react";

export function Waitlist() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href =
      "https://prod-waitlist-widget.s3.us-east-2.amazonaws.com/getwaitlist.min.css";
    document.head.appendChild(link);

    // Add script
    const script = document.createElement("script");
    script.src =
      "https://prod-waitlist-widget.s3.us-east-2.amazonaws.com/getwaitlist.min.js";
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="getWaitlistContainer"
      data-waitlist_id="28518"
      data-widget_type="WIDGET_2"
    ></div>
  );
}
