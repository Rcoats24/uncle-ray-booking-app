"use client";

import { useEffect, useMemo, useState } from "react";

type Status =
| "Not Contacted"
| "Contacted"
| "Follow Up"
| "Interested"
| "Booked";

type Venue = {
id: string;
name: string;
city: string;
status: Status;
fee: number;
notes: string;
followUpDate: string;
};

const starterVenues: Venue[] = [
{
id: "1",
name: "The Side Door",
city: "Sacramento, CA",
status: "Contacted",
fee: 0,
notes: "Good room for blues audience. Follow up with booking manager next week.",
followUpDate: "",
},
{
id: "2",
name: "Torch Club",
city: "Sacramento, CA",
status: "Follow Up",
fee: 0,
notes: "Strong fit for late-night soul set. Need contact email.",
followUpDate: "",
},
{
id: "3",
name: "Yoshi's",
city: "Oakland, CA",
status: "Interested",
fee: 0,
notes: "Could pitch premium show package and live video clips.",
followUpDate: "",
},
{
id: "4",
name: "Biscuits & Blues",
city: "San Francisco, CA",
status: "Not Contacted",
fee: 0,
notes: "Research booker and send polished intro.",
followUpDate: "",
},
];

function getStatusColor(status: Status) {
switch (status) {
case "Booked":
return "#16a34a";
case "Interested":
return "#2563eb";
case "Follow Up":
return "#eab308";
case "Contacted":
return "#9333ea";
default:
return "#52525b";
}
}

function isUpcomingFollowUp(date: string) {
if (!date) return false;

const today = new Date();
const target = new Date(date);

today.setHours(0, 0, 0, 0);
target.setHours(0, 0, 0, 0);

const diffMs = target.getTime() - today.getTime();
const diffDays = diffMs / (1000 * 60 * 60 * 24);

return diffDays >= 0 && diffDays <= 7;
}

function findVenueByName(question: string, venues: Venue[]) {
const lower = question.toLowerCase();
return venues.find((venue) => lower.includes(venue.name.toLowerCase()));
}

function buildAssistantAnswer(question: string, venues: Venue[]) {
const q = question.toLowerCase().trim();

if (!q) {
return "Ask me something like: Who should I follow up with? What’s my booked revenue? Write me a follow-up email for Yoshi’s.";
}

const bookedRevenue = venues
.filter((venue) => venue.status === "Booked")
.reduce((sum, venue) => sum + Number(venue.fee || 0), 0);

const followUps = venues.filter(
(venue) =>
venue.status === "Follow Up" || isUpcomingFollowUp(venue.followUpDate)
);

const interested = venues.filter((venue) => venue.status === "Interested");
const booked = venues.filter((venue) => venue.status === "Booked");

if (q.includes("booked revenue") || q.includes("revenue")) {
return `Your current booked revenue is $${bookedRevenue.toLocaleString()}.`;
}

if (
q.includes("follow up") ||
q.includes("who should i contact") ||
q.includes("who should i follow up with")
) {
if (followUps.length === 0) {
return "You don’t have any follow-ups due right now. A smart next move is to contact your 'Not Contacted' venues and move them into the pipeline.";
}

const names = followUps.map((venue) => venue.name).join(", ");
return `Your top follow-up targets are: ${names}. Start with the venues already in 'Follow Up' or those with a follow-up date due this week.`;
}

if (q.includes("interested")) {
if (interested.length === 0) {
return "You do not have any venues marked Interested yet.";
}

return `Interested venues: ${interested
.map((venue) => venue.name)
.join(", ")}. These are your warmest leads right now.`;
}

if (q.includes("booked shows") || q.includes("what is booked")) {
if (booked.length === 0) {
return "You do not have any booked shows yet in this dashboard.";
}

return `Booked shows: ${booked
.map((venue) => `${venue.name} ($${venue.fee})`)
.join(", ")}.`;
}

if (
q.includes("write") &&
q.includes("email")
) {
const venue = findVenueByName(question, venues);

if (!venue) {
return "I can write the email, but mention the venue name in your question, like: Write me a follow-up email for Torch Club.";
}

return `Subject: Follow-Up on Booking Opportunity at ${venue.name}

Hi ${venue.name} Team,

I wanted to follow up regarding a possible performance opportunity at ${venue.name}. I believe my live blues and soul show would be a strong fit for your audience in ${venue.city}.

I’d love to discuss available dates and how I can bring a memorable night of live music to your room. Please let me know if you'd like me to send over live footage, music links, or available dates.

Best,
Uncle Ray`;
}

if (
q.includes("write") &&
(q.includes("dm") || q.includes("message"))
) {
const venue = findVenueByName(question, venues);

if (!venue) {
return "Mention the venue name and I’ll write the DM. Example: Write me a DM for Biscuits & Blues.";
}

return `Hi ${venue.name} — I’m reaching out because I believe my live blues and soul show would be a strong fit for your audience. I’d love to explore a booking opportunity and can send music, live footage, and available dates if helpful.`;
}

if (q.includes("next step") || q.includes("what should i do next")) {
const priority =
followUps[0] ||
interested[0] ||
venues.find((venue) => venue.status === "Not Contacted");

if (!priority) {
return "Your dashboard is empty. Add a venue first, then I can guide your next move.";
}

return `Your best next move is to focus on ${priority.name} in ${priority.city}. Its current status is '${priority.status}'. Take action that moves it one step closer to 'Booked'.`;
}

return "I can help with follow-ups, booked revenue, interested venues, booked shows, next steps, and writing booking emails or DMs. Try asking a more specific question.";
}

export default function DashboardPage() {
const [mounted, setMounted] = useState(false);
const [venues, setVenues] = useState<Venue[]>(starterVenues);
const [editingId, setEditingId] = useState<string | null>(null);

const [formData, setFormData] = useState({
name: "",
city: "",
status: "Not Contacted" as Status,
fee: "",
notes: "",
followUpDate: "",
});

const [assistantQuestion, setAssistantQuestion] = useState("");
const [assistantAnswer, setAssistantAnswer] = useState(
"Ask me who to follow up with, what your booked revenue is, or ask me to write a booking email."
);

useEffect(() => {
setMounted(true);
}, []);

useEffect(() => {
const saved = localStorage.getItem("uncle-ray-venues");
if (saved) {
setVenues(JSON.parse(saved));
}
}, []);

useEffect(() => {
if (mounted) {
localStorage.setItem("uncle-ray-venues", JSON.stringify(venues));
}
}, [venues, mounted]);

const bookedRevenue = useMemo(() => {
return venues
.filter((venue) => venue.status === "Booked")
.reduce((sum, venue) => sum + Number(venue.fee || 0), 0);
}, [venues]);

const bookedShows = useMemo(() => {
return venues.filter((venue) => venue.status === "Booked").length;
}, [venues]);

const interestedCount = useMemo(() => {
return venues.filter((venue) => venue.status === "Interested").length;
}, [venues]);

const upcomingFollowUps = useMemo(() => {
return venues.filter((venue) => isUpcomingFollowUp(venue.followUpDate)).length;
}, [venues]);

function handleAddVenue(event: React.FormEvent<HTMLFormElement>) {
event.preventDefault();

if (!formData.name.trim() || !formData.city.trim()) return;

const newVenue: Venue = {
id: crypto.randomUUID(),
name: formData.name.trim(),
city: formData.city.trim(),
status: formData.status,
fee: Number(formData.fee || 0),
notes: formData.notes.trim(),
followUpDate: formData.followUpDate,
};

setVenues((prev) => [newVenue, ...prev]);

setFormData({
name: "",
city: "",
status: "Not Contacted",
fee: "",
notes: "",
followUpDate: "",
});
}

function handleDeleteVenue(id: string) {
setVenues((prev) => prev.filter((venue) => venue.id !== id));
if (editingId === id) setEditingId(null);
}

function handleStatusChange(id: string, status: Status) {
setVenues((prev) =>
prev.map((venue) => (venue.id === id ? { ...venue, status } : venue))
);
}

function handleFeeChange(id: string, fee: string) {
setVenues((prev) =>
prev.map((venue) =>
venue.id === id ? { ...venue, fee: Number(fee || 0) } : venue
)
);
}

function handleCityChange(id: string, city: string) {
setVenues((prev) =>
prev.map((venue) => (venue.id === id ? { ...venue, city } : venue))
);
}

function handleNotesChange(id: string, notes: string) {
setVenues((prev) =>
prev.map((venue) => (venue.id === id ? { ...venue, notes } : venue))
);
}

function handleFollowUpDateChange(id: string, followUpDate: string) {
setVenues((prev) =>
prev.map((venue) =>
venue.id === id ? { ...venue, followUpDate } : venue
)
);
}

function startEditing(id: string) {
setEditingId(id);
}

function stopEditing() {
setEditingId(null);
}

function handleAskAssistant() {
setAssistantAnswer(buildAssistantAnswer(assistantQuestion, venues));
}

if (!mounted) {
return (
<main
style={{
minHeight: "100vh",
background: "#0a0a0a",
color: "white",
padding: "32px 20px",
fontFamily: "Arial, sans-serif",
}}
/>
);
}

return (
<main
style={{
minHeight: "100vh",
background: "#0a0a0a",
color: "white",
padding: "32px 20px",
fontFamily: "Arial, sans-serif",
}}
>
<div style={{ maxWidth: 1100, margin: "0 auto" }}>
<div
style={{
display: "flex",
justifyContent: "space-between",
gap: 16,
alignItems: "center",
marginBottom: 24,
flexWrap: "wrap",
}}
>
<div>
<h1 style={{ fontSize: 42, margin: 0 }}>Uncle Ray Booking Dashboard</h1>
<p style={{ color: "#a1a1aa", marginTop: 8 }}>
Track venues, update status, and watch your booked revenue grow.
</p>
</div>

<a
href="/"
style={{
background: "#eab308",
color: "#111",
padding: "12px 18px",
borderRadius: 12,
textDecoration: "none",
fontWeight: 700,
}}
>
Back Home
</a>
</div>

<div
style={{
background: "#18181b",
border: "1px solid #27272a",
borderRadius: 18,
padding: 20,
marginBottom: 24,
}}
>
<h2 style={{ marginTop: 0 }}>Booking Assistant</h2>
<p style={{ color: "#a1a1aa", marginTop: 0 }}>
Ask about follow-ups, revenue, interested venues, or ask for a booking email.
</p>

<div style={{ display: "grid", gap: 12 }}>
<textarea
value={assistantQuestion}
onChange={(e) => setAssistantQuestion(e.target.value)}
placeholder='Try: "Who should I follow up with?" or "Write me a follow-up email for Yoshi’s"'
style={{
...inputStyle,
minHeight: 100,
resize: "vertical",
}}
/>

<button onClick={handleAskAssistant} style={buttonStyle}>
Ask Assistant
</button>

<div
style={{
background: "#111111",
border: "1px solid #27272a",
borderRadius: 14,
padding: 16,
whiteSpace: "pre-wrap",
lineHeight: 1.5,
}}
>
{assistantAnswer}
</div>
</div>
</div>

<div
style={{
background: "#18181b",
border: "1px solid #27272a",
borderRadius: 18,
padding: 20,
marginBottom: 24,
}}
>
<h2 style={{ marginTop: 0 }}>Add Venue</h2>

<form onSubmit={handleAddVenue}>
<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
gap: 12,
marginBottom: 12,
}}
>
<input
type="text"
placeholder="Venue Name"
value={formData.name}
onChange={(e) =>
setFormData((prev) => ({ ...prev, name: e.target.value }))
}
style={inputStyle}
/>

<input
type="text"
placeholder="City"
value={formData.city}
onChange={(e) =>
setFormData((prev) => ({ ...prev, city: e.target.value }))
}
style={inputStyle}
/>

<select
value={formData.status}
onChange={(e) =>
setFormData((prev) => ({
...prev,
status: e.target.value as Status,
}))
}
style={inputStyle}
>
<option>Not Contacted</option>
<option>Contacted</option>
<option>Follow Up</option>
<option>Interested</option>
<option>Booked</option>
</select>

<input
type="number"
placeholder="Fee"
value={formData.fee}
onChange={(e) =>
setFormData((prev) => ({ ...prev, fee: e.target.value }))
}
style={inputStyle}
/>

<input
type="date"
value={formData.followUpDate}
onChange={(e) =>
setFormData((prev) => ({
...prev,
followUpDate: e.target.value,
}))
}
style={inputStyle}
/>
</div>

<textarea
placeholder="Booking notes, contact info, follow-up plan, pitch angle..."
value={formData.notes}
onChange={(e) =>
setFormData((prev) => ({ ...prev, notes: e.target.value }))
}
style={{
...inputStyle,
minHeight: 110,
resize: "vertical",
marginBottom: 12,
}}
/>

<button type="submit" style={buttonStyle}>
Add Venue
</button>
</form>
</div>

<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
gap: 14,
marginBottom: 24,
}}
>
<StatCard label="Total Venues" value={String(venues.length)} />
<StatCard
label="Booked Revenue"
value={`$${bookedRevenue.toLocaleString()}`}
/>
<StatCard label="Booked Shows" value={String(bookedShows)} />
<StatCard label="Interested" value={String(interestedCount)} />
<StatCard label="Follow-Ups This Week" value={String(upcomingFollowUps)} />
</div>

<div style={{ display: "grid", gap: 16 }}>
{venues.map((venue) => {
const isEditing = editingId === venue.id;
const highlightFollowUp = isUpcomingFollowUp(venue.followUpDate);

return (
<div
key={venue.id}
style={{
background: "#111111",
border: highlightFollowUp
? "1px solid #eab308"
: "1px solid #27272a",
borderRadius: 16,
padding: 18,
boxShadow: highlightFollowUp
? "0 0 0 1px rgba(234,179,8,0.25)"
: "none",
}}
>
<div
style={{
display: "flex",
justifyContent: "space-between",
gap: 12,
alignItems: "flex-start",
flexWrap: "wrap",
}}
>
<div>
<h3 style={{ margin: "0 0 8px 0", fontSize: 24 }}>{venue.name}</h3>
{isEditing ? (
<input
type="text"
value={venue.city}
onChange={(e) => handleCityChange(venue.id, e.target.value)}
style={inputStyle}
/>
) : (
<p style={{ margin: 0, color: "#a1a1aa" }}>{venue.city}</p>
)}
</div>

<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
{isEditing ? (
<button onClick={stopEditing} style={secondaryButtonStyle}>
Done
</button>
) : (
<button
onClick={() => startEditing(venue.id)}
style={secondaryButtonStyle}
>
Edit
</button>
)}

<button
onClick={() => handleDeleteVenue(venue.id)}
style={deleteButtonStyle}
>
Delete
</button>
</div>
</div>

<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
gap: 12,
marginTop: 16,
}}
>
<div>
<div style={smallLabel}>Status</div>
<select
value={venue.status}
onChange={(e) =>
handleStatusChange(venue.id, e.target.value as Status)
}
style={inputStyle}
>
<option>Not Contacted</option>
<option>Contacted</option>
<option>Follow Up</option>
<option>Interested</option>
<option>Booked</option>
</select>
</div>

<div>
<div style={smallLabel}>Fee</div>
<input
type="number"
value={venue.fee}
onChange={(e) => handleFeeChange(venue.id, e.target.value)}
style={inputStyle}
/>
</div>

<div>
<div style={smallLabel}>Follow-Up Date</div>
<input
type="date"
value={venue.followUpDate}
onChange={(e) =>
handleFollowUpDateChange(venue.id, e.target.value)
}
style={inputStyle}
/>
</div>

<div>
<div style={smallLabel}>Current Tag</div>
<div
style={{
display: "inline-block",
marginTop: 6,
background: getStatusColor(venue.status),
color: venue.status === "Follow Up" ? "#111" : "white",
padding: "8px 12px",
borderRadius: 999,
fontWeight: 700,
}}
>
{venue.status}
</div>
</div>
</div>

<div style={{ marginTop: 16 }}>
<div style={smallLabel}>Booking Notes</div>
<textarea
value={venue.notes}
onChange={(e) => handleNotesChange(venue.id, e.target.value)}
placeholder="Add contact notes, follow-up dates, email addresses, what they said, pitch angle..."
style={{
...inputStyle,
minHeight: 120,
resize: "vertical",
}}
/>
</div>
</div>
);
})}
</div>
</div>
</main>
);
}

function StatCard({ label, value }: { label: string; value: string }) {
return (
<div
style={{
background: "#18181b",
border: "1px solid #27272a",
borderRadius: 16,
padding: 18,
}}
>
<div style={{ color: "#a1a1aa", fontSize: 14 }}>{label}</div>
<div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>{value}</div>
</div>
);
}

const inputStyle: React.CSSProperties = {
width: "100%",
background: "#27272a",
color: "white",
border: "1px solid #3f3f46",
borderRadius: 12,
padding: "12px 14px",
boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
background: "#eab308",
color: "#111",
border: "none",
borderRadius: 12,
padding: "12px 18px",
fontWeight: 700,
cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
background: "#27272a",
color: "white",
border: "1px solid #3f3f46",
borderRadius: 10,
padding: "10px 14px",
cursor: "pointer",
fontWeight: 700,
};

const deleteButtonStyle: React.CSSProperties = {
background: "#991b1b",
color: "white",
border: "none",
borderRadius: 10,
padding: "10px 14px",
cursor: "pointer",
fontWeight: 700,
};

const smallLabel: React.CSSProperties = {
fontSize: 13,
color: "#a1a1aa",
marginBottom: 6,
};

