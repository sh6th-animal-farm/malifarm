import RegionAccordion from '../components/RegionAccordion';

interface MapSectionProps {
  mapInstance: any;
  onRegionSelect: (lat: number, lng: number, lvl: number) => void;
}

export default function MapSection({
  mapInstance,
  onRegionSelect,
}: MapSectionProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-[24px] h-[400px] items-stretch">
      <div className="w-full lg:w-[320px] h-full flex-shrink-0">
        <RegionAccordion onRegionSelect={onRegionSelect} />
      </div>
      <div className="flex-1 h-full relative">
        <div
          id="map"
          className="w-full h-full rounded-[20px] border border-gray-200 bg-gray-50 shadow-sm"
          style={{ height: '100%' }}
        />
      </div>
    </div>
  );
}
