import React from 'react';

const About: React.FC = () => {
  return (
    <section className="max-w-3xl mx-auto my-12 p-8 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-4 text-primary">About Our Hostel</h1>
      <p className="mb-4 text-gray-700">
        Welcome to <span className="font-semibold text-primary">AI Data House Hostel</span> – a vibrant and fantastic community designed for students and professionals who value comfort, affordability, and a sense of belonging.
      </p>
      <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
        <li>
          <span className="font-semibold">Spacious Accommodation:</span> Each room accommodates <span className="font-bold">16 persons</span>, fostering a lively and collaborative environment.
        </li>
        <li>
          <span className="font-semibold">Community Living:</span> Experience a fantastic community where you can make friends, share ideas, and grow together.
        </li>
        <li>
          <span className="font-semibold">Delicious Meals:</span> Enjoy <span className="font-bold">2 meals a day</span> included in your stay, ensuring you are always energized and ready for your day.
        </li>
        <li>
          <span className="font-semibold">Affordable Pricing:</span> All these amazing facilities are available for just <span className="font-bold text-green-600">Rs. 15,000</span> per month.
        </li>
      </ul>
      <p className="text-gray-700">
        Join us at AI Data House Hostel and become part of a supportive, dynamic, and friendly community. Your comfort and growth are our priorities!
      </p>
    </section>
  );
};

export default About;
