import type { CSSProperties } from 'react';
import { clubColor } from '../constants';
import type { Member } from '../types';

interface MemberListProps {
  members: Member[];
  onDelete: (id: string) => void;
}

export default function MemberList({ members, onDelete }: MemberListProps) {
  return (
    <ul className="member-list">
      {members.map((member) => (
        <li
          key={member.id}
          className="member-card"
          style={{ '--club': clubColor(member.club) } as CSSProperties}
        >
          <div className="member-top">
            <span className="member-club">{member.club}</span>
            <span className="member-no">ID {member.id.slice(0, 5)}</span>
          </div>
          <h3>{member.member_name}</h3>
          <p className="member-email">{member.email}</p>
          <p className="member-interests">{member.interests}</p>
          <div className="member-bottom">
            <span>
              {member.year_level}, joined {new Date(member.created_at).toLocaleDateString()}
            </span>
            <button type="button" className="danger" onClick={() => onDelete(member.id)}>
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
