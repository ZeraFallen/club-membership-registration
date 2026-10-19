import { useState } from 'react';
import api, { getErrorMessage } from './api/axios';
import { CLUBS } from './constants';
import { useFetch } from './hooks/useFetch';
import MemberForm from './components/MemberForm';
import MemberList from './components/MemberList';
import type { Member } from './types';

export default function App() {
  const [search, setSearch] = useState('');
  const [clubFilter, setClubFilter] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Only send filters that have a value, e.g. GET /members?club=Coding%20Club
  const params: Record<string, string> = {};
  if (search.trim()) params.search = search.trim();
  if (clubFilter) params.club = clubFilter;

  const { data: members, setData, loading, error, refetch } = useFetch<Member[]>('/members', params);

  async function handleDelete(id: string) {
    if (!window.confirm('Remove this member?')) return;

    try {
      setDeleteError(null);
      await api.delete(`/members/${id}`);
      // Remove it from the screen without mutating the old array.
      setData((prev) => (prev ? prev.filter((member) => member.id !== id) : prev));
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    }
  }

  const filtersActive = Boolean(search.trim() || clubFilter);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Club membership registration</h1>
        <p>Pick a club, register, and see who else has joined.</p>
      </header>

      <main className="layout">
        <MemberForm onCreated={refetch} />

        <section className="panel" aria-labelledby="members-heading">
          <div className="list-header">
            <h2 id="members-heading">
              Members{members ? ` (${members.length})` : ''}
            </h2>
            <div className="filters">
              <input
                type="search"
                placeholder="Search name or email"
                aria-label="Search members by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                aria-label="Filter by club"
                value={clubFilter}
                onChange={(e) => setClubFilter(e.target.value)}
              >
                <option value="">All clubs</option>
                {CLUBS.map((club) => (
                  <option key={club.name} value={club.name}>
                    {club.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {deleteError && (
            <p className="status error" role="alert">
              {deleteError}
            </p>
          )}

          {loading && <p className="message">Loading members...</p>}

          {error && (
            <div className="message error-box" role="alert">
              <p>{error}</p>
              <button type="button" onClick={refetch}>
                Try again
              </button>
            </div>
          )}

          {!loading && !error && members && members.length === 0 && (
            <p className="message">
              {filtersActive
                ? 'No members match these filters.'
                : 'No members yet. Register the first one with the form.'}
            </p>
          )}

          {!error && members && members.length > 0 && (
            <MemberList members={members} onDelete={handleDelete} />
          )}
        </section>
      </main>
    </div>
  );
}
