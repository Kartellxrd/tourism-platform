'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('Connecting to backend...');

  useEffect(() => {
    fetch('http://localhost:8000/test-connection')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('Backend not reached yet. Start your FastAPI server!'));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-gray-900">
      <h1 className="text-4xl font-extrabold text-blue-800 mb-4 border-b-4 border-yellow-500 pb-2">
        Botswana Tourism Platform
      </h1>
      <div className="bg-blue-50 border-l-4 border-blue-800 p-6 rounded shadow-lg">
        <p className="text-xl font-medium">{message}</p>
      </div>
    </main>
  );
}