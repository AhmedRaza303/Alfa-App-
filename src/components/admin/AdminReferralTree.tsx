import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { buildReferralForest, countReferralEdges } from '../../utils/referrals';
import { ReferralGraphPanel } from '../common/ReferralGraphPanel';

export const AdminReferralTree: React.FC = () => {
  const { users, setActiveTab } = useApp();

  const forest = useMemo(() => buildReferralForest(users), [users]);
  const marketers = users.filter((u) => u.role === 'Marketer').length;
  const links = countReferralEdges(users);

  return (
    <ReferralGraphPanel
      forest={forest}
      showRootFilter
      statsLabel={`${marketers} · ${links} links`}
      emptyHint="No referrals yet."
      footerAction={
        <button
          type="button"
          onClick={() => setActiveTab('marketer_requests')}
          className="text-[10px] font-bold text-sky-700 hover:underline cursor-pointer shrink-0"
        >
          Requests
        </button>
      }
    />
  );
};
