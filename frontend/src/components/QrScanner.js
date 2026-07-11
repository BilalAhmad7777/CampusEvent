import React, { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { api } from "../api";
import "./index.css";

export default function QrScanner() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("event");

  const scannerRef = useRef(false);
  const scannedRef = useRef(false);

  useEffect(() => {
    if (scannerRef.current) return;

    scannerRef.current = true;
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: 250,
      },
      false
    );

   scanner.render(
  async (decodedText) => {

  if (scannedRef.current) return;

  scannedRef.current = true;
    try {
      const result = await api.scanAttendance(
        eventId,
        decodedText
      );

      alert(
        `✅ ${result.student}\n\nAttendance Marked Successfully`
      );
      await scanner.clear().catch(() => {});

      
    } catch (err) {
  scannedRef.current = false;
  alert(err.message);
}
  },
  () => {}
);

    return () => {
  scanner.clear().catch(() => {});
  scannerRef.current = false;
};
  }, [eventId]);

  return (
    <div className="container">
      <h1>Scan Event Ticket</h1>

      <div id="reader"></div>
    </div>
  );
}