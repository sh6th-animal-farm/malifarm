import TrustMetricsChart from './TrustMetricsChart';

export default function TrustMetricsSection() {
  return (
    <section className="bg-gray-50 pt-14 md:py-20 lg:py-24">
      <div className="layout-container">
        <h2 className="font-header-01 text-gray-900 mb-7">투자 신뢰 지표</h2>
        <TrustMetricsChart />
      </div>
    </section>
  );
}
