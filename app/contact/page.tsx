import React from 'react';
import Link from 'next/link';

const Contact: React.FC = () => {
  return (
    <section className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-4 text-primary">Contact Us</h1>
      <p className="mb-4 text-gray-700">
        We'd love to hear from you! For any inquiries, questions, or feedback, please reach out using the contact details below.
      </p>
      <div className="space-y-4">
        <div>
          <span className="font-semibold text-gray-800">Email: </span>
          <Link
            href="mailto:nomi63558@gmail.com"
            className="text-primary underline break-all"
          >
            nomi63558@gmail.com
          </Link>
        </div>
        <div>
          <span className="font-semibold text-gray-800">Phone: </span>
          <Link
            href="tel:+923005105824"
            className="text-primary underline"
          >
            +92 300 5105824
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Contact;
