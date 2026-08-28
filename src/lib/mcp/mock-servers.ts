export interface MockHotel {
  id: string
  name: string
  location: string
  price_per_night: number
  rating: number
  amenities: string[]
}

export interface MockFlight {
  id: string
  airline: string
  flight_number: string
  departure: string
  arrival: string
  price: number
  duration: string
  stops: number
}

// HOTELHUB PRO
const hotels: MockHotel[] = [
  { id: "h1", name: "Taj Exotica", location: "Goa", price_per_night: 15000, rating: 4.8, amenities: ["Pool", "Spa", "Beachfront"] },
  { id: "h2", name: "W Goa", location: "Goa", price_per_night: 18000, rating: 4.6, amenities: ["Pool", "Bar", "Gym"] },
  { id: "h3", name: "The Leela", location: "Goa", price_per_night: 22000, rating: 4.9, amenities: ["Private Beach", "Golf Course"] },
  { id: "h4", name: "Taj Mahal Palace", location: "Mumbai", price_per_night: 25000, rating: 4.9, amenities: ["Sea View", "Heritage"] },
  { id: "h5", name: "Trident", location: "Mumbai", price_per_night: 12000, rating: 4.5, amenities: ["Business Center", "Pool"] },
  { id: "h6", name: "Burj Al Arab", location: "Dubai", price_per_night: 150000, rating: 5.0, amenities: ["Helipad", "Butler"] },
  { id: "h7", name: "Atlantis", location: "Dubai", price_per_night: 40000, rating: 4.7, amenities: ["Waterpark", "Aquarium"] },
  { id: "h8", name: "Ayana Resort", location: "Bali", price_per_night: 28000, rating: 4.8, amenities: ["Rock Bar", "Spa"] },
  { id: "h9", name: "The Siam", location: "Bangkok", price_per_night: 35000, rating: 4.7, amenities: ["River View", "Boutique"] }
]

export const HotelHub = {
  search_hotels: async (args: any) => {
    await simulateDelay(100, 300)
    maybeThrow(0.05)
    return hotels.filter(h => !args.destination || h.location.toLowerCase() === args.destination.toLowerCase())
  },
  get_hotel_details: async (args: { hotel_id: string }) => {
    await simulateDelay(100, 300)
    maybeThrow(0.05)
    return hotels.find(h => h.id === args.hotel_id) || null
  },
  check_availability: async (args: any) => {
    await simulateDelay(150, 350)
    return { available: Math.random() > 0.2, rooms_left: Math.floor(Math.random() * 10) }
  },
  make_booking: async (args: any) => {
    await simulateDelay(200, 400)
    return { booking_id: "HB-" + Math.random().toString(36).substring(7).toUpperCase(), status: "confirmed" }
  }
}

// SKYROUTE
const flights: MockFlight[] = [
  { id: "f1", airline: "IndiGo", flight_number: "6E-101", departure: "DEL", arrival: "BOM", price: 5000, duration: "2h 10m", stops: 0 },
  { id: "f2", airline: "Vistara", flight_number: "UK-999", departure: "DEL", arrival: "BOM", price: 7500, duration: "2h 15m", stops: 0 },
  { id: "f3", airline: "Air India", flight_number: "AI-202", departure: "BOM", arrival: "GOA", price: 4000, duration: "1h 20m", stops: 0 },
  { id: "f4", airline: "Emirates", flight_number: "EK-501", departure: "DEL", arrival: "DXB", price: 25000, duration: "4h 30m", stops: 0 },
  { id: "f5", airline: "Thai Airways", flight_number: "TG-300", departure: "BLR", arrival: "BKK", price: 18000, duration: "4h 0m", stops: 0 }
]

export const SkyRoute = {
  search_flights: async (args: any) => {
    await simulateDelay(150, 400)
    await maybeTimeout(0.08, 2000)
    return flights.filter(f => 
      (!args.origin || f.departure === args.origin) && 
      (!args.destination || f.arrival === args.destination)
    )
  },
  get_flight_details: async (args: { flight_id: string }) => {
    await simulateDelay(150, 400)
    return flights.find(f => f.id === args.flight_id) || null
  },
  check_seat_availability: async (args: any) => {
    await simulateDelay(150, 400)
    return { available: Math.floor(Math.random() * 50), class: args.class || "economy" }
  }
}

// BOOKEASE
export const BookEase = {
  create_booking: async (args: any) => {
    await simulateDelay(200, 500)
    maybeThrow(0.03)
    return { 
      booking_id: "BE-" + Math.random().toString(36).substring(7).toUpperCase(), 
      status: "pending", 
      total_amount: Math.floor(Math.random() * 50000) + 5000 
    }
  },
  get_booking_status: async (args: { booking_id: string }) => {
    await simulateDelay(100, 300)
    return { status: "confirmed", updated_at: new Date().toISOString() }
  },
  process_payment: async (args: any) => {
    await simulateDelay(400, 800)
    maybeThrow(0.03)
    return { transaction_id: "TXN-" + Date.now(), status: "success" }
  },
  send_confirmation: async (args: any) => {
    await simulateDelay(100, 200)
    return { sent: true, confirmation_url: "https://bookease.void.dev/confirm/" + args.booking_id }
  }
}

// Helpers
async function simulateDelay(min: number, max: number) {
  const delay = Math.floor(Math.random() * (max - min + 1) + min)
  return new Promise(resolve => setTimeout(resolve, delay))
}

function maybeThrow(probability: number) {
  if (Math.random() < probability) {
    throw new Error("Simulated mock server error")
  }
}

async function maybeTimeout(probability: number, timeoutMs: number) {
  if (Math.random() < probability) {
    await new Promise(resolve => setTimeout(resolve, timeoutMs))
    throw new Error("Simulated timeout error")
  }
}
