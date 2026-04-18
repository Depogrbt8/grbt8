import type { Airport } from '@/types/flight';

/**
 * Duffel’de metin araması olmadığı için yerel indeks.
 * Türkiye + Avrupa (ve önceki global hub’lar) — `/api/airports/search`
 */
export const STATIC_AIRPORTS: Airport[] = [
  // ——— Türkiye ———
  { code: 'IST', name: 'İstanbul Havalimanı', city: 'İstanbul' },
  { code: 'SAW', name: 'Sabiha Gökçen', city: 'İstanbul' },
  { code: 'ESB', name: 'Esenboğa', city: 'Ankara' },
  { code: 'ADB', name: 'Adnan Menderes', city: 'İzmir' },
  { code: 'AYT', name: 'Antalya', city: 'Antalya' },
  { code: 'GZP', name: 'Gazipaşa-Alanya', city: 'Alanya' },
  { code: 'DLM', name: 'Dalaman', city: 'Dalaman' },
  { code: 'BJV', name: 'Milas-Bodrum', city: 'Bodrum' },
  { code: 'GZT', name: 'Gaziantep', city: 'Gaziantep' },
  { code: 'ADA', name: 'Şakirpaşa', city: 'Adana' },
  { code: 'TZX', name: 'Trabzon', city: 'Trabzon' },
  { code: 'KYA', name: 'Konya', city: 'Konya' },
  { code: 'ERZ', name: 'Erzurum', city: 'Erzurum' },
  { code: 'VAN', name: 'Ferit Melen', city: 'Van' },
  { code: 'ASR', name: 'Erkilet', city: 'Kayseri' },
  { code: 'NAV', name: 'Kapadokya', city: 'Nevşehir' },
  { code: 'DIY', name: 'Diyarbakır', city: 'Diyarbakır' },
  { code: 'HTY', name: 'Hatay', city: 'Hatay' },
  { code: 'MLX', name: 'Erhaç', city: 'Malatya' },
  { code: 'MQM', name: 'Mardin', city: 'Mardin' },
  { code: 'MSR', name: 'Muş', city: 'Muş' },
  { code: 'OGU', name: 'Ordu-Giresun', city: 'Ordu' },
  { code: 'SZF', name: 'Samsun-Çarşamba', city: 'Samsun' },
  { code: 'VAS', name: 'Sivas Nuri Demirağ', city: 'Sivas' },
  { code: 'NOP', name: 'Sinop', city: 'Sinop' },
  { code: 'ERC', name: 'Erzincan', city: 'Erzincan' },
  { code: 'EZS', name: 'Elazığ', city: 'Elazığ' },
  { code: 'BAL', name: 'Batman', city: 'Batman' },
  { code: 'BGG', name: 'Bingöl', city: 'Bingöl' },
  { code: 'CKZ', name: 'Çanakkale', city: 'Çanakkale' },
  { code: 'DNZ', name: 'Çardak', city: 'Denizli' },
  { code: 'EDO', name: 'Balıkesir Körfez', city: 'Edremit' },
  { code: 'IGD', name: 'Iğdır', city: 'Iğdır' },
  { code: 'KCM', name: 'Kahramanmaraş', city: 'Kahramanmaraş' },
  { code: 'KSY', name: 'Kars Harakani', city: 'Kars' },
  { code: 'KZR', name: 'Zafer', city: 'Kütahya' },
  { code: 'TEQ', name: 'Tekirdağ-Çorlu', city: 'Çorlu' },
  { code: 'USQ', name: 'Uşak', city: 'Uşak' },
  { code: 'YEI', name: 'Yenişehir', city: 'Bursa' },
  { code: 'GNY', name: 'Şanlıurfa GAP', city: 'Şanlıurfa' },
  { code: 'NKT', name: 'Şırnak', city: 'Şırnak' },
  { code: 'TJK', name: 'Tokat', city: 'Tokat' },
  { code: 'AOE', name: 'Anadolu Üniversitesi', city: 'Eskişehir' },
  { code: 'ONQ', name: 'Zonguldak', city: 'Zonguldak' },
  { code: 'KFS', name: 'Kastamonu', city: 'Kastamonu' },
  { code: 'RZV', name: 'Rize-Artvin', city: 'Rize' },

  // ——— Birleşik Krallık ———
  { code: 'LHR', name: 'Heathrow', city: 'Londra' },
  { code: 'LGW', name: 'Gatwick', city: 'Londra' },
  { code: 'STN', name: 'Stansted', city: 'Londra' },
  { code: 'LTN', name: 'Luton', city: 'Londra' },
  { code: 'LCY', name: 'London City', city: 'Londra' },
  { code: 'SEN', name: 'Southend', city: 'Londra' },
  { code: 'MAN', name: 'Manchester', city: 'Manchester' },
  { code: 'EDI', name: 'Edinburgh', city: 'Edinburgh' },
  { code: 'GLA', name: 'Glasgow', city: 'Glasgow' },
  { code: 'BHX', name: 'Birmingham', city: 'Birmingham' },
  { code: 'BRS', name: 'Bristol', city: 'Bristol' },
  { code: 'NCL', name: 'Newcastle', city: 'Newcastle' },
  { code: 'LBA', name: 'Leeds Bradford', city: 'Leeds' },
  { code: 'ABZ', name: 'Aberdeen', city: 'Aberdeen' },
  { code: 'BFS', name: 'Belfast International', city: 'Belfast' },
  { code: 'BHD', name: 'Belfast City', city: 'Belfast' },
  { code: 'LPL', name: 'Liverpool John Lennon', city: 'Liverpool' },
  { code: 'EMA', name: 'East Midlands', city: 'Nottingham' },
  { code: 'SOU', name: 'Southampton', city: 'Southampton' },
  { code: 'EXT', name: 'Exeter', city: 'Exeter' },
  { code: 'NWI', name: 'Norwich', city: 'Norwich' },

  // ——— Almanya ———
  { code: 'FRA', name: 'Frankfurt', city: 'Frankfurt' },
  { code: 'MUC', name: 'Münih', city: 'Münih' },
  { code: 'BER', name: 'Brandenburg', city: 'Berlin' },
  { code: 'DUS', name: 'Düsseldorf', city: 'Düsseldorf' },
  { code: 'HAM', name: 'Hamburg', city: 'Hamburg' },
  { code: 'CGN', name: 'Köln/Bonn', city: 'Köln' },
  { code: 'STR', name: 'Stuttgart', city: 'Stuttgart' },
  { code: 'NUE', name: 'Nürnberg', city: 'Nürnberg' },
  { code: 'LEJ', name: 'Leipzig/Halle', city: 'Leipzig' },
  { code: 'HAJ', name: 'Hannover', city: 'Hannover' },
  { code: 'BRE', name: 'Bremen', city: 'Bremen' },
  { code: 'DTM', name: 'Dortmund', city: 'Dortmund' },
  { code: 'DRS', name: 'Dresden', city: 'Dresden' },
  { code: 'FDH', name: 'Friedrichshafen', city: 'Friedrichshafen' },
  { code: 'FMM', name: 'Memmingen', city: 'Memmingen' },
  { code: 'HHN', name: 'Frankfurt-Hahn', city: 'Hahn' },
  { code: 'PAD', name: 'Paderborn', city: 'Paderborn' },
  { code: 'SCN', name: 'Saarbrücken', city: 'Saarbrücken' },
  { code: 'RMS', name: 'Ramstein', city: 'Ramstein' },

  // ——— Fransa ———
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris' },
  { code: 'ORY', name: 'Orly', city: 'Paris' },
  { code: 'BVA', name: 'Beauvais', city: 'Paris' },
  { code: 'NCE', name: 'Nice Côte d’Azur', city: 'Nice' },
  { code: 'LYS', name: 'Lyon-Saint Exupéry', city: 'Lyon' },
  { code: 'TLS', name: 'Blagnac', city: 'Toulouse' },
  { code: 'MRS', name: 'Marseille Provence', city: 'Marsilya' },
  { code: 'NTE', name: 'Nantes Atlantique', city: 'Nantes' },
  { code: 'BOD', name: 'Mérignac', city: 'Bordeaux' },
  { code: 'SXB', name: 'Strasbourg', city: 'Strazburg' },
  { code: 'BSL', name: 'EuroAirport Basel-Mulhouse-Freiburg', city: 'Basel' },
  { code: 'MPL', name: 'Montpellier', city: 'Montpellier' },
  { code: 'RNS', name: 'Rennes Bretagne', city: 'Rennes' },
  { code: 'BIQ', name: 'Biarritz', city: 'Biarritz' },
  { code: 'LIL', name: 'Lille Lesquin', city: 'Lille' },
  { code: 'BES', name: 'Brest Bretagne', city: 'Brest' },
  { code: 'AJA', name: 'Ajaccio Napoleon Bonaparte', city: 'Ajaccio' },
  { code: 'CLY', name: 'Calvi Sainte-Catherine', city: 'Calvi' },

  // ——— Hollanda ———
  { code: 'AMS', name: 'Schiphol', city: 'Amsterdam' },
  { code: 'EIN', name: 'Eindhoven', city: 'Eindhoven' },
  { code: 'RTM', name: 'Rotterdam The Hague', city: 'Rotterdam' },
  { code: 'GRQ', name: 'Groningen Eelde', city: 'Groningen' },
  { code: 'MST', name: 'Maastricht Aachen', city: 'Maastricht' },

  // ——— Belçika ———
  { code: 'BRU', name: 'Brussels', city: 'Brüksel' },
  { code: 'CRL', name: 'Brussels South Charleroi', city: 'Charleroi' },
  { code: 'ANR', name: 'Antwerp', city: 'Antwerp' },
  { code: 'OST', name: 'Oostende-Bruges', city: 'Oostende' },
  { code: 'LGG', name: 'Liège', city: 'Liège' },

  // ——— İsviçre ———
  { code: 'ZRH', name: 'Zürih', city: 'Zürih' },
  { code: 'GVA', name: 'Cenevre', city: 'Cenevre' },

  // ——— Avusturya ———
  { code: 'VIE', name: 'Viyana', city: 'Viyana' },
  { code: 'SZG', name: 'Salzburg', city: 'Salzburg' },
  { code: 'INN', name: 'Innsbruck', city: 'Innsbruck' },
  { code: 'GRZ', name: 'Graz', city: 'Graz' },
  { code: 'LNZ', name: 'Linz', city: 'Linz' },
  { code: 'KLU', name: 'Klagenfurt', city: 'Klagenfurt' },

  // ——— İtalya ———
  { code: 'FCO', name: 'Fiumicino', city: 'Roma' },
  { code: 'CIA', name: 'Ciampino', city: 'Roma' },
  { code: 'MXP', name: 'Malpensa', city: 'Milano' },
  { code: 'LIN', name: 'Linate', city: 'Milano' },
  { code: 'BGY', name: 'Orio al Serio', city: 'Bergamo' },
  { code: 'VCE', name: 'Marco Polo', city: 'Venedik' },
  { code: 'NAP', name: 'Capodichino', city: 'Napoli' },
  { code: 'BLQ', name: 'Guglielmo Marconi', city: 'Bologna' },
  { code: 'CTA', name: 'Fontanarossa', city: 'Katanya' },
  { code: 'PSA', name: 'Galileo Galilei', city: 'Pisa' },
  { code: 'FLR', name: 'Peretola', city: 'Floransa' },
  { code: 'TRN', name: 'Caselle', city: 'Torino' },
  { code: 'GOA', name: 'Cristoforo Colombo', city: 'Cenova' },
  { code: 'PMO', name: 'Falcone-Borsellino', city: 'Palermo' },
  { code: 'CAG', name: 'Elmas', city: 'Cagliari' },
  { code: 'OLB', name: 'Costa Smeralda', city: 'Olbia' },
  { code: 'BRI', name: 'Karol Wojtyła', city: 'Bari' },
  { code: 'VRN', name: 'Valerio Catullo', city: 'Verona' },

  // ——— İspanya ———
  { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid' },
  { code: 'BCN', name: 'Josep Tarradellas Barcelona-El Prat', city: 'Barselona' },
  { code: 'AGP', name: 'Málaga-Costa del Sol', city: 'Málaga' },
  { code: 'PMI', name: 'Palma de Mallorca', city: 'Palma' },
  { code: 'VLC', name: 'Valencia', city: 'Valencia' },
  { code: 'ALC', name: 'Alicante-Elche', city: 'Alicante' },
  { code: 'SVQ', name: 'Sevilla', city: 'Sevilla' },
  { code: 'BIO', name: 'Bilbao', city: 'Bilbao' },
  { code: 'SCQ', name: 'Santiago-Rosalía de Castro', city: 'Santiago de Compostela' },
  { code: 'IBZ', name: 'Ibiza', city: 'Ibiza' },
  { code: 'LPA', name: 'Gran Canaria', city: 'Las Palmas' },
  { code: 'TFS', name: 'Tenerife South', city: 'Tenerife' },
  { code: 'TFN', name: 'Tenerife North', city: 'Tenerife' },
  { code: 'GIB', name: 'Gibraltar', city: 'Gibraltar' },

  // ——— Portekiz ———
  { code: 'LIS', name: 'Humberto Delgado', city: 'Lizbon' },
  { code: 'OPO', name: 'Francisco Sá Carneiro', city: 'Porto' },
  { code: 'FAO', name: 'Faro', city: 'Faro' },
  { code: 'FNC', name: 'Cristiano Ronaldo Madeira', city: 'Funchal' },
  { code: 'PDL', name: 'João Paulo II', city: 'Ponta Delgada' },

  // ——— Yunanistan ———
  { code: 'ATH', name: 'Eleftherios Venizelos', city: 'Atina' },
  { code: 'SKG', name: 'Makedonia', city: 'Selanik' },
  { code: 'HER', name: 'Nikos Kazantzakis', city: 'Heraklion' },
  { code: 'RHO', name: 'Diagoras', city: 'Rodos' },
  { code: 'CFU', name: 'Ioannis Kapodistrias', city: 'Korfu' },
  { code: 'CHQ', name: 'Souda', city: 'Hanya' },
  { code: 'JTR', name: 'Santorini', city: 'Santorini' },
  { code: 'JMK', name: 'Mykonos', city: 'Mykonos' },

  // ——— İskandinavya & Baltık ———
  { code: 'ARN', name: 'Arlanda', city: 'Stockholm' },
  { code: 'BMA', name: 'Bromma', city: 'Stockholm' },
  { code: 'GOT', name: 'Landvetter', city: 'Göteborg' },
  { code: 'MMX', name: 'Malmö', city: 'Malmö' },
  { code: 'CPH', name: 'Kastrup', city: 'Kopenhag' },
  { code: 'BLL', name: 'Billund', city: 'Billund' },
  { code: 'AAL', name: 'Aalborg', city: 'Aalborg' },
  { code: 'OSL', name: 'Gardermoen', city: 'Oslo' },
  { code: 'TRD', name: 'Trondheim Vaernes', city: 'Trondheim' },
  { code: 'BGO', name: 'Bergen Flesland', city: 'Bergen' },
  { code: 'SVG', name: 'Sola', city: 'Stavanger' },
  { code: 'TOS', name: 'Langnes', city: 'Tromsø' },
  { code: 'HEL', name: 'Helsinki-Vantaa', city: 'Helsinki' },
  { code: 'TMP', name: 'Tampere-Pirkkala', city: 'Tampere' },
  { code: 'KSU', name: 'Kajaani', city: 'Kajaani' },
  { code: 'RIX', name: 'Riga Intl', city: 'Riga' },
  { code: 'VNO', name: 'Vilnius', city: 'Vilnius' },
  { code: 'TLL', name: 'Lennart Meri', city: 'Tallinn' },

  // ——— Polonya ———
  { code: 'WAW', name: 'Chopin', city: 'Varşova' },
  { code: 'KRK', name: 'John Paul II Kraków-Balice', city: 'Krakow' },
  { code: 'GDN', name: 'Lech Wałęsa', city: 'Gdańsk' },
  { code: 'WRO', name: 'Copernicus Wrocław', city: 'Wrocław' },
  { code: 'POZ', name: 'Ławica', city: 'Poznań' },
  { code: 'KTW', name: 'Pyrzowice', city: 'Katowice' },
  { code: 'LUZ', name: 'Lublin', city: 'Lublin' },
  { code: 'RZE', name: 'Jasionka', city: 'Rzeszów' },

  // ——— Çekya, Slovakya, Macaristan, Romanya, Bulgaristan ———
  { code: 'PRG', name: 'Václav Havel', city: 'Prag' },
  { code: 'BRQ', name: 'Brno-Tuřany', city: 'Brno' },
  { code: 'BTS', name: 'M. R. Štefánik', city: 'Bratislava' },
  { code: 'BUD', name: 'Liszt Ferenc', city: 'Budapeşte' },
  { code: 'DEB', name: 'Debrecen Intl', city: 'Debrecen' },
  { code: 'OTP', name: 'Henri Coandă', city: 'Bükreş' },
  { code: 'CLJ', name: 'Avram Iancu', city: 'Cluj-Napoca' },
  { code: 'TSR', name: 'Traian Vuia', city: 'Timișoara' },
  { code: 'IAS', name: 'Iași Intl', city: 'Iași' },
  { code: 'SOF', name: 'Sofya', city: 'Sofya' },
  { code: 'VAR', name: 'Varna', city: 'Varna' },
  { code: 'BOJ', name: 'Burgas', city: 'Burgas' },

  // ——— Hırvatistan, Sırbistan, Slovenya, Karadağ, Bosna, Kuzey Makedonya, Arnavutluk ———
  { code: 'ZAG', name: 'Franjo Tuđman', city: 'Zagreb' },
  { code: 'SPU', name: 'Split', city: 'Split' },
  { code: 'DBV', name: 'Dubrovnik', city: 'Dubrovnik' },
  { code: 'BEG', name: 'Belgrad Nikola Tesla', city: 'Belgrad' },
  { code: 'INI', name: 'Niš Constantine the Great', city: 'Niš' },
  { code: 'LJU', name: 'Jože Pučnik', city: 'Ljubljana' },
  { code: 'TGD', name: 'Podgorica', city: 'Podgorica' },
  { code: 'TIV', name: 'Tivat', city: 'Tivat' },
  { code: 'SJJ', name: 'Sarajevo Intl', city: 'Saraybosna' },
  { code: 'SKP', name: 'Skopje Intl', city: 'Üsküp' },
  { code: 'TIA', name: 'Tirana Intl Nënë Tereza', city: 'Tiran' },
  { code: 'PRN', name: 'Pristina Intl', city: 'Priştine' },

  // ——— İrlanda, Lüksemburg, Malta, Kıbrıs, İzlanda ———
  { code: 'DUB', name: 'Dublin', city: 'Dublin' },
  { code: 'ORK', name: 'Cork', city: 'Cork' },
  { code: 'SNN', name: 'Shannon', city: 'Shannon' },
  { code: 'LUX', name: 'Findel', city: 'Lüksemburg' },
  { code: 'MLA', name: 'Malta Intl', city: 'Malta' },
  { code: 'LCA', name: 'Larnaka', city: 'Larnaka' },
  { code: 'PFO', name: 'Paphos', city: 'Baf' },
  { code: 'ECN', name: 'Ercan', city: 'Lefkoşa' },
  { code: 'KEF', name: 'Keflavík', city: 'Reykjavik' },

  // ——— Norveç ek ———
  { code: 'AES', name: 'Ålesund Vigra', city: 'Ålesund' },

  // ——— Ukrayna (Avrupa tarafı / yaygın) ———
  { code: 'KBP', name: 'Boryspil', city: 'Kiev' },
  { code: 'IEV', name: 'İgor Sikorsky Kyiv (Zhulyany)', city: 'Kiev' },
  { code: 'LWO', name: 'Lviv Danylo Halytskyi', city: 'Lviv' },

  // ——— Rusya (Avrupa hub’ları) ———
  { code: 'SVO', name: 'Sheremetyevo', city: 'Moskova' },
  { code: 'DME', name: 'Domodedovo', city: 'Moskova' },
  { code: 'VKO', name: 'Vnukovo', city: 'Moskova' },
  { code: 'LED', name: 'Pulkovo', city: 'St. Petersburg' },

  // ——— Global hub’lar (mevcut kullanım) ———
  { code: 'JFK', name: 'John F. Kennedy', city: 'New York' },
  { code: 'EWR', name: 'Newark Liberty', city: 'New York' },
  { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' },
  { code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' },
  { code: 'ORD', name: "O'Hare", city: 'Chicago' },
  { code: 'MIA', name: 'Miami Intl', city: 'Miami' },
  { code: 'IAD', name: 'Dulles', city: 'Washington' },
  { code: 'ATL', name: 'Hartsfield-Jackson', city: 'Atlanta' },
  { code: 'DXB', name: 'Dubai Intl', city: 'Dubai' },
  { code: 'AUH', name: 'Abu Dhabi Intl', city: 'Abu Dabi' },
  { code: 'DOH', name: 'Hamad Intl', city: 'Doha' },
  { code: 'RUH', name: 'King Khalid', city: 'Riyad' },
  { code: 'JED', name: 'King Abdulaziz', city: 'Cidde' },
  { code: 'CAI', name: 'Kahire Intl', city: 'Kahire' },
  { code: 'TLV', name: 'Ben Gurion', city: 'Tel Aviv' },
  { code: 'NRT', name: 'Narita', city: 'Tokyo' },
  { code: 'HND', name: 'Haneda', city: 'Tokyo' },
  { code: 'ICN', name: 'Incheon', city: 'Seul' },
  { code: 'SIN', name: 'Changi', city: 'Singapur' },
  { code: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok' },
  { code: 'KUL', name: 'Kuala Lumpur Intl', city: 'Kuala Lumpur' },
  { code: 'SYD', name: 'Kingsford Smith', city: 'Sidney' },
  { code: 'MEL', name: 'Tullamarine', city: 'Melbourne' },
  { code: 'GRU', name: 'Guarulhos', city: 'São Paulo' },
  { code: 'GIG', name: 'Galeão', city: 'Rio de Janeiro' },
  { code: 'BOG', name: 'El Dorado', city: 'Bogota' },
  { code: 'LIM', name: 'Jorge Chávez', city: 'Lima' },
  { code: 'MEX', name: 'Benito Juárez', city: 'Mexico City' },
  { code: 'YYZ', name: 'Pearson', city: 'Toronto' },
  { code: 'YVR', name: 'Vancouver Intl', city: 'Vancouver' },
];

export function filterStaticAirports(query: string, limit = 40): Airport[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const seen = new Set<string>();
  const out: Airport[] = [];
  for (const a of STATIC_AIRPORTS) {
    if (seen.has(a.code)) continue;
    const match =
      a.code.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q);
    if (match) {
      seen.add(a.code);
      out.push(a);
      if (out.length >= limit) break;
    }
  }
  return out;
}
