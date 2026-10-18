import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api.js';
import { SponsorCampaign, AdSetting } from '../types/index.js';
import { ExternalLink } from 'lucide-react';

interface AdSlotProps {
  placement: 'header' | 'sidebar' | 'footer' | 'question_bottom';
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ placement, className = '' }) => {
  const [adSettings, setAdSettings] = useState<AdSetting | null>(null);
  const [sponsor, setSponsor] = useState<SponsorCampaign | null>(null);

  useEffect(() => {
    let isMounted = true;
    ApiClient.getAdvertisements()
      .then(res => {
        if (!isMounted || !res || !res.data) return;
        setAdSettings(res.data.settings);
        const match = res.data.sponsors.find((s: SponsorCampaign) => s.placement === placement && s.is_active);
        if (match) {
          setSponsor(match);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [placement]);

  const handleSponsorClick = () => {
    if (sponsor) {
      ApiClient.recordAdClick(sponsor.id).catch(() => {});
    }
  };

  // If a direct sponsor exists for this slot, prioritize it
  if (sponsor) {
    return (
      <div className={`my-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs ${className}`}>
        <div className="flex items-center justify-between px-3 py-1 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-600">
          <span>Sponsored by {sponsor.client_name}</span>
          <span className="text-slate-600 text-[10px]">Advertisement</span>
        </div>
        <a
          href={sponsor.target_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleSponsorClick}
          className="group block relative"
        >
          <img
            src={sponsor.banner_url}
            alt={sponsor.title}
            className="w-full h-auto max-h-48 object-cover transition-opacity group-hover:opacity-95"
            referrerPolicy="no-referrer"
          />
          <div className="p-3 flex items-center justify-between gap-2 bg-slate-900 text-white">
            <div>
              <p className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">{sponsor.title}</p>
              <p className="text-[11px] text-slate-300">Click to explore admission circular & test schedule</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-amber-300 font-medium shrink-0">
              Visit <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </a>
      </div>
    );
  }

  // If Google AdSense is enabled
  if (adSettings?.adsense_enabled) {
    return (
      <div className={`my-4 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 text-center ${className}`}>
        <div className="text-[10px] uppercase font-semibold text-slate-600 tracking-wider mb-2">Google AdSense Placement</div>
        <div className="py-6 px-4 bg-white rounded-lg border border-slate-200 inline-block max-w-lg w-full">
          <p className="text-xs font-medium text-slate-600">Responsive Display Ad Slot</p>
          <p className="text-[11px] text-slate-600 font-mono-numbers mt-0.5">
            Pub ID: {adSettings.publisher_id} · Slot: {adSettings[`${placement}_slot_id` as keyof AdSetting] || 'auto'}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
