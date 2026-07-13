import React, { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useParams, useSearchParams } from "react-router-dom";
import { api } from "../api";
import "./ticket.css";

export default function TicketPage() {
  const { registrationId } = useParams();
  const [searchParams] = useSearchParams();

const autoDownload =
  searchParams.get("download") === "true";

  const [registration, setRegistration] = useState(null);
  const [qrUrl, setQrUrl] = useState("");
  const ticketRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const regs = await api.myRegistrations();

      const reg = regs.find(
        (r) => r.registration_id === registrationId
      );

      setRegistration(reg);
      if (reg) {
  const response = await fetch(
  api.registrationQr(reg.registration_id),
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);



if (!response.ok) {
  
  return;
}

const blob = await response.blob();


setQrUrl(URL.createObjectURL(blob));
}
    };

    load();
  }, [registrationId]);

  const downloadPDF = async () => {
  const element = ticketRef.current;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(
    imgData,
    "PNG",
    0,
    0,
    canvas.width,
    canvas.height
  );

  pdf.save(
    `${registration.event.title.replace(/\s+/g, "_")}_Ticket.pdf`
  );
};

   useEffect(() => {
  if (!autoDownload) return;
  if (!registration) return;
  if (!ticketRef.current) return;

  const timer = setTimeout(() => {
    downloadPDF();
  }, 300);

  return () => clearTimeout(timer);
}, [autoDownload, registration]);
  
  

  if (!registration)
    return (
      <div className="container">
        <h2>Loading ticket...</h2>
      </div>
    );

   


  return (
  <div className="ticket-page">
        

    <div className="ticket" ref={ticketRef}>

      {/* Header */}
      <div className="ticket-header">
        <h1 className="ticket-logo">🎫 CAMPUS CONNECT</h1>
        <p className="ticket-subtitle">Digital Event Pass</p>
      </div>

      {/* Event Title */}
      <div className="ticket-event">
        <h2>{registration.event.title}</h2>
      </div>

      {/* Details */}
      <div className="ticket-details">

        <div className="detail-row">
          <span className="detail-label">Registration ID</span>
          <h3>{registration.registration_id}</h3>
        </div>

        <div className="detail-divider"></div>

        <div className="detail-row">
          <span className="detail-label">Status</span>

          <span
            className={
              registration.status === "registered"
                ? "ticket-status registered"
                : "ticket-status waitlisted"
            }
          >
            {registration.status.toUpperCase()}
          </span>
        </div>

        <div className="detail-divider"></div>

        <div className="detail-row">
          <span className="detail-label">Date</span>

          <h3>
            {new Date(
              registration.event.date_time
            ).toLocaleString()}
          </h3>
        </div>

        <div className="detail-divider"></div>

        <div className="detail-row">
          <span className="detail-label">Venue</span>

          <h3>{registration.event.venue}</h3>
        </div>

      </div>

      
     <div className="ticket-qr">
  {registration.event.status === "completed" ? (
    <div className="ticket-completed-banner">
      ❌ EVENT COMPLETED
      <span className="sub">This QR ticket is no longer valid.</span>
    </div>
  ) : (
    <img src={qrUrl} alt="QR Code" className="qr-image" />
  )}
</div>

     
      <div className="ticket-cut-left"></div>
      <div className="ticket-cut-right"></div>

    </div>
  </div>
);}