import { useLocation } from "wouter";

const cities = [
  // Kota-kota besar Jawa
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
  },
  {
    name: "Semarang",
    slug: "semarang",
    count: "743",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },
  {
    name: "Solo",
    slug: "solo",
    count: "612",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },
  {
    name: "Malang",
    slug: "malang",
    count: "892",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },
  {
    name: "Bogor",
    slug: "bogor",
    count: "534",
    image: "https://images.unsplash.com/photo-1587393855524-087f83d95bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },

  // Kota-kota Sumatera
  {
    name: "Medan",
    slug: "medan",
    count: "856",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },
  {
    name: "Padang",
    slug: "padang",
    count: "423",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },
  {
    name: "Palembang",
    slug: "palembang",
    count: "367",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },
  {
    name: "Pekanbaru",
    slug: "pekanbaru",
    count: "298",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },

  // Kota-kota Kalimantan
  {
    name: "Banjarmasin",
    slug: "banjarmasin",
    count: "234",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },
  {
    name: "Balikpapan",
    slug: "balikpapan",
    count: "189",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },
  {
    name: "Pontianak",
    slug: "pontianak",
    count: "156",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },
  {
    name: "Samarinda",
    slug: "samarinda",
    count: "134",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },

  // Kota-kota Sulawesi
  {
    name: "Makassar",
    slug: "makassar",
    count: "567",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },
  {
    name: "Manado",
    slug: "manado",
    count: "198",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },
  {
    name: "Palu",
    slug: "palu",
    count: "87",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },
  {
    name: "Kendari",
    slug: "kendari",
    count: "76",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },

  // Kota-kota Bali & Nusa Tenggara
  {
    name: "Denpasar",
    slug: "denpasar",
    count: "445",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },
  {
    name: "Mataram",
    slug: "mataram",
    count: "123",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },
  {
    name: "Kupang",
    slug: "kupang",
    count: "89",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },

  // Kota-kota Papua & Maluku
  {
    name: "Jayapura",
    slug: "jayapura",
    count: "67",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },
  {
    name: "Ambon",
    slug: "ambon",
    count: "54",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
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
            Kota Populer Se-Indonesia
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Jelajahi ribuan pilihan kos dari Sabang sampai Merauke. Dari kota besar hingga kota kecil di 38 provinsi Indonesia
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {cities.slice(0, 24).map((city) => (
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
