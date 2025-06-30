import { useLocation } from "wouter";

// Akan diisi oleh lokasi terdekat berdasarkan GPS
const cities: any[] = [];

export default function PopularCities() {
  const [, setLocation] = useLocation();

  const handleLocationSearch = () => {
    setLocation('/cari-lokasi');
  };

  if (cities.length === 0) {
    return (
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Cari Kos Terdekat
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Temukan kos di sekitar lokasi Anda secara otomatis
            </p>
            
            <button
              onClick={handleLocationSearch}
              className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors duration-200"
            >
              <svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Cari Berdasarkan Lokasi
            </button>
          </div>
        </div>
      </section>
    );
  }

  return null;
}
