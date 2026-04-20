import { stats } from '@/pages/home/data/data';

export default function StatusSection() {
  return (
    <section className="bg-gray-50 py-14 md:py-20 lg:py-24">
      <div className="layout-container">
        <div className="grid rounded-lg bg-white shadow-std md:grid-cols-3">
          {stats.map((stat) => (
            <div
              className="flex flex-col md:flex-row md:items-center"
              key={stat.label}
            >
              <div className="flex-1 px-5 py-8 text-center">
                <span className="mb-2 block font-body-02 text-gray-400">
                  {stat.label}
                </span>
                <span className="font-header-00 text-gray-900">
                  {stat.value}
                  {stat.suffix ? (
                    <small className="ml-1 font-body-02 text-gray-900">
                      {stat.suffix}
                    </small>
                  ) : null}
                </span>
              </div>
              {/* {index < stats.length - 1 ? (
                <div className="h-px w-full bg-gray-100 md:h-full md:w-px" />
              ) : null} */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
