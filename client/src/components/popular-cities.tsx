import { useLocation } from "wouter";

const cities = [
  {
    name: "Jakarta",
    slug: "jakarta",
    count: "2,847",
    image: "https://images.unsplash.com/photo-1555993539-1732b0258235?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },
  {
    name: "Bandung",
    slug: "bandung",
    count: "1,523",
    image: "https://images.unsplash.com/photo-1587393855524-087f83d95bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },
  {
    name: "Surabaya",
    slug: "surabaya",
    count: "987",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },
  {
    name: "Yogyakarta",
    slug: "yogyakarta",
    count: "1,234",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  }
];

export default function PopularCities() {
  const [, setLocation] = useLocation();

  const handleCityClick = (citySlug: string) => {
    setLocation(`/search?city=${citySlug}`);
  };

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Kota Populer
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Jelajahi ribuan pilihan kos di kota-kota favorit mahasiswa dan pekerja
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {cities.map((city) => (
            <div
              key={city.slug}
              className="group cursor-pointer"
              onClick={() => handleCityClick(city.slug)}
            >
              <div className="relative overflow-hidden rounded-xl mb-4">
                <img
                  src={city.image}
                  alt={`${city.name} cityscape`}
                  className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-semibold text-lg">{city.name}</h3>
                  <p className="text-sm opacity-90">{city.count} kos tersedia</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
