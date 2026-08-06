import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, ClipboardCheck, Compass, Info, Search, MapPin, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { useDexieDB } from '../../hooks/useDexieDB';
import { socket } from '../../services/socket';

interface CitizenSOSProps {
  onSubmitSOS: (beaconData: any) => void;
  myBeacons: any[];
  blackoutActive: boolean;
  onLocationChange?: (lat: string, lon: string) => void;
}

export default function CitizenSOS({ onSubmitSOS, myBeacons, blackoutActive, onLocationChange }: CitizenSOSProps) {
  // Coordinates & Location States
  const [lat, setLat] = useState('17.5500');
  const [lon, setLon] = useState('78.4650');
  const [address, setAddress] = useState('Maisammaguda Corridor');
  const [district, setDistrict] = useState('Medchal-Malkajgiri');
  const [state, setState] = useState('Telangana');
  const [gpsAccuracy, setGpsAccuracy] = useState('10'); // in meters
  
  // Search Autocomplete States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Form Fields
  const [selectedCategory, setSelectedCategory] = useState('Medical Emergency');
  const [customCategory, setCustomCategory] = useState('');
  const [type, setType] = useState('Medical Emergency');
  const [priority, setPriority] = useState('Critical');
  const [supply, setSupply] = useState('medical');
  const [details, setDetails] = useState('');
  
  // Demographics parameters
  const [childrenCount, setChildrenCount] = useState('0');
  const [elderlyCount, setElderlyCount] = useState('0');
  const [disabledCount, setDisabledCount] = useState('0');
  const [pregnantCount, setPregnantCount] = useState('0');

  const { saveOfflineSOS } = useDexieDB();

  // Bubble coordinates up when lat/lon change
  useEffect(() => {
    onLocationChange?.(lat, lon);
  }, [lat, lon, onLocationChange]);

  // Search autocomplete handler
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=in`;
        const res = await axios.get(url);
        setSearchResults(res.data as any[]);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error("OSM Search failed:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectSearchResult = async (result: any) => {
    const targetLat = parseFloat(result.lat);
    const targetLon = parseFloat(result.lon);
    
    setLat(targetLat.toFixed(4));
    setLon(targetLon.toFixed(4));
    setAddress(result.display_name);
    setShowSearchDropdown(false);
    setSearchQuery('');

    await triggerReverseGeocode(targetLat, targetLon);
  };

  const triggerReverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
      const res = await axios.get(url);
      const addr = (res.data as any).address || {};
      
      const parsedDistrict = addr.county || addr.district || addr.city_district || addr.suburb || 'Medchal-Malkajgiri';
      const parsedState = addr.state || 'Telangana';
      const landmark = (res.data as any).display_name || addr.road || 'Maisammaguda';

      setDistrict(parsedDistrict);
      setState(parsedState);
      setAddress(landmark);
    } catch (err) {
      console.error("OSM Reverse Geocoding failed:", err);
    }
  };

  const handleFetchCoords = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const targetLat = pos.coords.latitude;
        const targetLon = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;

        setLat(targetLat.toFixed(4));
        setLon(targetLon.toFixed(4));
        setGpsAccuracy(accuracy.toFixed(0));

        await triggerReverseGeocode(targetLat, targetLon);
      },
      (err) => {
        console.warn("Location permission denied or unavailable. Falling back to default corridor.", err);
        setLat('17.5512');
        setLon('78.4634');
        setGpsAccuracy('150');
        setDistrict('Medchal-Malkajgiri');
        setState('Telangana');
        setAddress('Maisammaguda Malla Reddy Corridor (Manual GPS)');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitSOS({
      lat,
      lon,
      address,
      district,
      state,
      type,
      priority,
      item_requested: supply,
      details,
      children: parseInt(childrenCount),
      elderly: parseInt(elderlyCount),
      disabled: parseInt(disabledCount),
      pregnant: parseInt(pregnantCount),
      gps_accuracy: gpsAccuracy,
      network_status: blackoutActive ? 'Offline' : 'Online'
    });
    setDetails('');
  };

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1 select-none">
      
      {/* Section 1: Location & Coordinates (1-Tap SOS Top) */}
      <div className="bg-[#0d1425] border border-white/5 rounded-2xl p-6 shadow-glass relative">
        
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
          <h4 className="font-heading font-extrabold text-[13.5px] text-white flex items-center gap-2">
            <ClipboardCheck size={16} className="text-safeGreen" /> Report Emergency Distress Signal
          </h4>
          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
            {blackoutActive ? (
              <><WifiOff size={12} className="text-warningOrange" /> Offline WAL Caching</>
            ) : (
              <><Wifi size={12} className="text-safeGreen animate-pulse" /> Live Telemetry Link</>
            )}
          </span>
        </div>

        {/* Location Search Autocomplete */}
        <div className="relative flex flex-col gap-1 z-50">
          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <Search size={10} /> Search Village / Area / Town / Pincode
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search location in India..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded px-9 py-1.5 text-white outline-none focus:border-safeGreen text-[12px]"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
            {searchLoading && (
              <span className="absolute right-3 top-2 text-[10px] text-slate-500">Searching...</span>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute top-12 left-0 w-full bg-[#0d1425] border border-white/10 rounded-xl shadow-glass z-[9999] max-h-[160px] overflow-y-auto divide-y divide-white/5 text-[11.5px]">
              {searchResults.map((res, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectSearchResult(res)}
                  className="w-full text-left px-3 py-2 hover:bg-white/5 text-slate-300 flex items-start gap-2"
                >
                  <MapPin size={12} className="flex-shrink-0 mt-0.5 text-neonCyan" />
                  <span>{res.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-[12px] min-h-0">
          
          {/* Coordinates row */}
          <div className="grid grid-cols-3 gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={e => setLat(e.target.value)}
                className="bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-safeGreen"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={lon}
                onChange={e => setLon(e.target.value)}
                className="bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-safeGreen"
                required
              />
            </div>
            <button
              type="button"
              onClick={handleFetchCoords}
              className="py-1.5 px-3 bg-[#1e293b] border border-white/5 rounded font-heading font-semibold text-[11.5px] text-white hover:border-safeGreen flex items-center justify-center gap-1.5 h-[32px] transition-all"
            >
              <Compass size={13} className="text-neonCyan" />
              <span>Fetch GPS</span>
            </button>
          </div>

          {/* District & State */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">District</label>
              <input
                type="text"
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-safeGreen"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">State</label>
              <input
                type="text"
                value={state}
                onChange={e => setState(e.target.value)}
                className="bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-safeGreen"
                required
              />
            </div>
          </div>

          {/* Address / Landmark */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nearest Landmark / Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. Near Maisammaguda Lake"
              className="bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-safeGreen"
              required
            />
          </div>

          {/* Predefined visual category chips */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Emergency Category</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Flood', 'Cyclone', 'Earthquake', 'Landslide', 'Fire', 
                'Building Collapse', 'Medical Emergency', 'Road Block', 
                'Missing Person', 'Food Required', 'Water Required', 'Other / Custom Incident'
              ].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    if (cat !== 'Other / Custom Incident') {
                      setType(cat);
                    } else {
                      setType(customCategory || 'Custom Emergency');
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-safeGreen/15 border-safeGreen text-safeGreen shadow-[0_0_8px_rgba(0,255,135,0.08)]'
                      : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {selectedCategory === 'Other / Custom Incident' && (
              <input
                type="text"
                placeholder="Type custom emergency category..."
                value={customCategory}
                onChange={e => {
                  setCustomCategory(e.target.value);
                  setType(e.target.value || 'Custom Emergency');
                }}
                className="bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-safeGreen text-[12px] w-full mt-1.5"
                required
              />
            )}
          </div>

          {/* Priority Level */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Priority Level</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-safeGreen"
            >
              <option value="Critical">Critical - Life Threat</option>
              <option value="High">High - Severe Hazard</option>
              <option value="Medium">Medium - Safe / Isolated</option>
            </select>
          </div>

          {/* Resource Request */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Relief Resource Required</label>
            <select
              value={supply}
              onChange={e => setSupply(e.target.value)}
              className="bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-safeGreen"
            >
              <option value="medical">Medical First Aid Kit</option>
              <option value="food">Emergency Rations Block</option>
              <option value="water">Emergency Hydration Pack</option>
              <option value="blankets">Thermal Blankets</option>
              <option value="generator">Backup Portable Generator</option>
            </select>
          </div>

          {/* Demographics inputs (Fixed layout overlaps & squishing) */}
          <div className="bg-white/2 border border-white/5 rounded-xl p-3 flex flex-col gap-2.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1"><Info size={11} /> Evacuee Demographics</span>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-center">
              <div className="flex flex-col gap-1 bg-black/40 border border-white/5 p-2 rounded-lg">
                <label className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Children</label>
                <input
                  type="number"
                  min="0"
                  value={childrenCount}
                  onChange={e => setChildrenCount(e.target.value)}
                  className="bg-black/60 border border-white/10 rounded py-1 px-1 text-center text-white text-[12px] w-full border-none outline-none"
                />
              </div>
              <div className="flex flex-col gap-1 bg-black/40 border border-white/5 p-2 rounded-lg">
                <label className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Elderly</label>
                <input
                  type="number"
                  min="0"
                  value={elderlyCount}
                  onChange={e => setElderlyCount(e.target.value)}
                  className="bg-black/60 border border-white/10 rounded py-1 px-1 text-center text-white text-[12px] w-full border-none outline-none"
                />
              </div>
              <div className="flex flex-col gap-1 bg-black/40 border border-white/5 p-2 rounded-lg">
                <label className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Disabled</label>
                <input
                  type="number"
                  min="0"
                  value={disabledCount}
                  onChange={e => setDisabledCount(e.target.value)}
                  className="bg-black/60 border border-white/10 rounded py-1 px-1 text-center text-white text-[12px] w-full border-none outline-none"
                />
              </div>
              <div className="flex flex-col gap-1 bg-black/40 border border-white/5 p-2 rounded-lg">
                <label className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Pregnant</label>
                <input
                  type="number"
                  min="0"
                  value={pregnantCount}
                  onChange={e => setPregnantCount(e.target.value)}
                  className="bg-black/60 border border-white/10 rounded py-1 px-1 text-center text-white text-[12px] w-full border-none outline-none"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Incident details</label>
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Describe casualties and situation context..."
              rows={2}
              className="bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-safeGreen resize-none text-[12px]"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-safeGreen to-safeGreen/80 text-black font-heading font-extrabold rounded-lg shadow-md hover:opacity-95 flex items-center justify-center gap-2 mt-2 select-none"
          >
            <Send size={14} />
            <span>Broadcast SOS Beacon</span>
          </button>

        </form>
      </div>

      {/* SOS List and trackings */}
      <div className="bg-[#0b0f19]/80 border border-white/5 p-4 rounded-xl flex flex-col shadow-sm flex-shrink-0">
        <h4 className="font-heading font-extrabold text-[13.5px] text-white border-b border-white/5 pb-2 mb-3">
          My Active SOS Trackers
        </h4>
        <div className="overflow-y-auto pr-1 flex flex-col gap-2.5 max-h-[300px]">
          {myBeacons.length === 0 ? (
            <div className="text-[11.5px] text-slate-500 text-center py-10 leading-normal">
              No reported emergency SOS signals found on device.
            </div>
          ) : (
            myBeacons.map(b => {
              let statusStyle = 'text-slate-400 bg-slate-500/10 border-slate-500/20';
              if (b.status === 'Completed' || b.status === 'Rescued') statusStyle = 'text-safeGreen bg-safeGreen/10 border-safeGreen/20';
              if (b.status === 'Dispatched') statusStyle = 'text-purple bg-purple/10 border-purple/20';
              if (b.status === 'Located') statusStyle = 'text-neonCyan bg-neonCyan/10 border-neonCyan/20';
              if (b.status === 'Cached Offline') statusStyle = 'text-warningOrange bg-warningOrange/10 border-warningOrange/20';

              const teamName = b.assigned_team ? (b.assigned_team === 'team_alpha' ? 'Team Alpha (Vehicle)' : b.assigned_team === 'team_bravo' ? 'Team Bravo (Boat)' : 'N/A') : 'Assigning...';

              return (
                <div key={b.id} className="bg-white/2 border border-white/5 rounded-xl p-3 flex flex-col gap-2 hover:border-safeGreen transition-all">
                  <div className="flex justify-between items-center text-[11.5px]">
                    <span className="font-mono text-slate-500">ID: <code>{b.id.substring(0,8)}</code></span>
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${statusStyle}`}>{b.status}</span>
                  </div>
                  <div>
                    <h5 className="font-heading font-extrabold text-[12px] text-white">{b.type}</h5>
                    <p className="text-[11px] text-slate-400 leading-normal mt-0.5">{b.details}</p>
                    {b.district && (
                      <span className="text-[10px] text-slate-500 block mt-1">Location: {b.address || 'N/A'}, {b.district}, {b.state}</span>
                    )}
                  </div>
                  {b.assigned_team && (
                    <div className="border-t border-white/5 pt-2 flex justify-between items-center text-[10.5px] text-slate-500 font-medium">
                      <span>Assigned: <strong className="text-slate-300">{teamName}</strong></span>
                      <span>ETA: <strong className="text-neonCyan">{b.predicted_eta || '12 mins'}</strong></span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
