import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import PageTransition from "../components/common/PageTransition";
import HeroSection from "../features/home/HeroSection";
import CategoryGrid from "../features/home/CategoryGrid";
import PopularProducts from "../features/home/PopularProducts";
import NewPanditsSection from "../features/home/NewPanditsSection";
import NewBestOffers from "../features/home/NewBestOffers";
import ComboOffers from "../features/home/ComboOffers";
import WhyShop from "../features/home/WhyShop";
import { fetchHomeSections } from "../api/homeApi";
import { useHomeStore } from "../store/homeStore";
import { useLocationStore } from "../store/locationStore";
import { PageLoader } from "../components/common/Loader";

export default function Home() {
  const { latitude, longitude } = useLocationStore();
  const { sections, setSections } = useHomeStore();

  const { data, isLoading } = useQuery({
    queryKey: ["home-sections", latitude, longitude],
    queryFn: () => fetchHomeSections(
      latitude || "26.94386831",
      longitude || "80.94058558"
    ),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data?.sections) setSections(data.sections);
  }, [data, setSections]);

  if (isLoading && !sections.length) return <PageLoader />;

  return (
    <PageTransition>
      {sections.map((section) => {
        if (section.status !== "active") return null;

        switch (section.section_type) {
          case "slider":
            return <HeroSection key={section.id} data={section.data} />;
          case "category":
            return <CategoryGrid key={section.id} data={section.data} />;
          case "products":
            return <PopularProducts key={section.id} data={section.data} />;
          case "pandit":
            return <NewPanditsSection key={section.id} data={section.data} />;
          case "best_offer":
            return <NewBestOffers key={section.id} data={section.data} />;
          case "combo_offer":
            return section.data?.items?.length > 0
              ? <ComboOffers key={section.id} data={section.data} />
              : null;
          default:
            return null;
        }
      })}
      <WhyShop />
    </PageTransition>
  );
}
