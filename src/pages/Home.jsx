import PageTransition from "../components/common/PageTransition";
import HeroSection from "../features/home/HeroSection";
import CategoryGrid from "../features/home/CategoryGrid";
import PopularProducts from "../features/home/PopularProducts";
import ComboOffers from "../features/home/ComboOffers";
import WhyShop from "../features/home/WhyShop";

export default function Home() {
  return (
    <PageTransition>
      <HeroSection />
      <CategoryGrid />
      <PopularProducts />
      <ComboOffers />
      <WhyShop />
    </PageTransition>
  );
}
