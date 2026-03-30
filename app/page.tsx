export default function Home() {
return (
<main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
<h1 className="text-4xl md:text-6xl font-bold text-center mb-4">
Uncle Ray’s Booking App
</h1>

<p className="text-lg md:text-xl text-gray-300 text-center max-w-2xl mb-8">
Turn your talent into booked shows and real income. Track venues,
follow-ups, and opportunities in one clean place.
</p>

<button className="bg-yellow-500 text-black font-semibold px-6 py-3 rounded-xl">
Start Booking
</button>
</main>
);
}