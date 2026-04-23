import { useMemo } from 'react';
import { partners } from '@/pages/home/data/data';

function Partner() {
  const duplicatedPartners = useMemo(
    () => [...partners, ...partners, ...partners, ...partners],
    [],
  );

  return (
    <section className="bg-gray-50 py-14 md:py-20 lg:py-24">
      {/* <div className="layout-container">
        <h3 className="mb-10 font-header-00 text-gray-900">함께하는 파트너사</h3>
      </div> */}
      <div
        className="relative flex overflow-hidden mask-fade"
        onMouseEnter={(e) => {
          (
            e.currentTarget.firstChild as HTMLDivElement
          ).style.animationPlayState = 'paused';
        }}
        onMouseLeave={(e) => {
          (
            e.currentTarget.firstChild as HTMLDivElement
          ).style.animationPlayState = 'running';
        }}
      >
        <div className="flex w-max animate-infinite-scroll">
          {duplicatedPartners.map((partner, index) => (
            <div
              className="mr-12 flex min-w-[190px] items-center justify-center transition-transform hover:scale-105"
              key={`${partner.name}-${index}`}
            >
              <div className="flex h-[72px] w-[170px] items-center justify-center">
                <img
                  src={partner.src}
                  alt={partner.name}
                  className="h-full w-full object-contain grayscale transition-all hover:grayscale-0"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Partner;
