import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api.js';
import { SponsorCampaign, AdSetting } from '../types/index.js';
import { ExternalLink, Sparkles } from 'lucide-react';

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

  // Load Google AdSense script dynamically if enabled and publisher_id is present
  useEffect(() => {
    if (adSettings?.adsense_enabled && adSettings?.publisher_id && !adSettings.test_mode) {
      const scriptId = 'google-adsense-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSettings.publisher_id}`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }
    }
  }, [adSettings]);

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
          <span className="text-slate-500 text-[10px]">Advertisement</span>
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
              <p className="text-[11px] text-slate-300">ভর্তি সার্কুলার ও বিস্তারিত তথ্যের জন্য ক্লিক করুন</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-amber-300 font-medium shrink-0">
              Visit <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </a>
      </div>
    );
  }

  // Check if Master AdSense is enabled
  if (!adSettings?.adsense_enabled) {
    return null;
  }

  // Check placement-specific toggle
  const isSlotEnabled = (() => {
    switch (placement) {
      case 'header':
        return adSettings.header_ad_enabled !== false;
      case 'sidebar':
        return adSettings.sidebar_ad_enabled !== false;
      case 'question_bottom':
        return adSettings.content_ad_enabled !== false;
      case 'footer':
        return adSettings.footer_ad_enabled !== false;
      default:
        return true;
    }
  })();

  if (!isSlotEnabled) {
    return null;
  }

  // Get corresponding slot ID
  const slotId = (() => {
    switch (placement) {
      case 'header':
        return adSettings.header_slot_id || 'slot_header_728x90';
      case 'sidebar':
        return adSettings.sidebar_slot_id || 'slot_sidebar_300x250';
      case 'question_bottom':
        return adSettings.content_slot_id || 'slot_inarticle_fluid';
      case 'footer':
        return adSettings.footer_slot_id || 'slot_footer_leaderboard';
      default:
        return 'auto';
    }
  })();

  const placementLabel = (() => {
    switch (placement) {
      case 'header': return 'হেডার ব্যানার বিজ্ঞাপন (728x90 / Responsive)';
      case 'sidebar': return 'সাইডবার বিজ্ঞাপন ইউনিট (300x250 / 300x600)';
      case 'question_bottom': return 'ইন-আর্টিকেল / প্রশ্নপত্রের মধ্যবর্তী ফ্লুইড এড';
      case 'footer': return 'ফুটার ব্যানার বিজ্ঞাপন ইউনিট';
    }
  })();

  return (
    <div className={`my-4 overflow-hidden rounded-xl border border-dashed border-indigo-200 bg-gradient-to-r from-slate-50 to-indigo-50/30 p-3 sm:p-4 text-center ${className}`}>
      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 px-1">
        <div className="flex items-center gap-1.5 font-semibold text-indigo-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Google AdSense বিজ্ঞাপন · {placementLabel}</span>
        </div>
        <span className="text-[10px] bg-indigo-100/80 text-indigo-800 font-bold px-2 py-0.5 rounded font-mono-numbers">
          {adSettings.test_mode ? 'Test Mode Active' : 'Live Unit'}
        </span>
      </div>

      {/* Actual Google AdSense element */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-4 shadow-2xs max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[90px]">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client={adSettings.publisher_id}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />

        <div className="text-center py-2 space-y-1">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold text-slate-700">Google AdSense Responsive Unit</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono-numbers">
            Client: <strong>{adSettings.publisher_id}</strong> · Slot: <strong>{slotId}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
