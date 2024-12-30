'use client';

import { useEffect, useState } from 'react';

interface Company {
  id: string;
  name: string;
  website: string | null;
  industry: string | null;
}

export default function PrismaTest() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await fetch('/api/test/companies');
        if (!response.ok) throw new Error('Failed to fetch companies');
        const data = await response.json();
        setCompanies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch companies');
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Companies from Prisma DB</h2>
      <div className="space-y-4">
        {companies.map((company) => (
          <div key={company.id} className="border p-4 rounded-lg">
            <h3 className="font-semibold">{company.name}</h3>
            {company.website && (
              <p className="text-sm text-gray-600">{company.website}</p>
            )}
            {company.industry && (
              <p className="text-sm text-gray-600">{company.industry}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 