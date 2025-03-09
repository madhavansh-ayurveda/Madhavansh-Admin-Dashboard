import { invoiceApi } from "@/api/invoiceApi";
import { useState } from "react";

const InvoicePreview = () => {
  const [invoiceUrl, setInvoiceUrl] = useState("");

  const generateInvoice = async () => {
    const response = await invoiceApi.genearteInvoice()

    const data = await response.json();
    setInvoiceUrl(data.invoiceUrl);
  };

  return (
    <div>
      <button onClick={generateInvoice}>Generate Invoice</button>
      {invoiceUrl && (
        <iframe src={invoiceUrl} width="600" height="400"></iframe>
      )}
    </div>
  );
};

export default InvoicePreview;
