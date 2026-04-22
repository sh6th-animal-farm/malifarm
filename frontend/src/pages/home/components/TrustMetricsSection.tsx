import TrustMetricsChart from './TrustMetricsChart';

export default function TrustMetricsSection() {
  return (
    <section className="bg-gray-50 py-14 md:py-20 lg:py-24">
      <div className="layout-container">
        <div className="mb-8 md:mb-10">
          <h2 className="font-header-01 text-gray-900">투자 신뢰 지표</h2>
        </div>
        <TrustMetricsChart />
      </div>
    </section>
  );
}
